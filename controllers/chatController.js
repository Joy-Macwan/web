// controllers/chatController.js
const { supabase } = require('../utils/supabase');
const { getAIResponse } = require('../utils/aiChatBot');

class ChatController {
  // Render chat UI
  renderChatInterface(req, res) {
    res.render('chat/interface', {
      title: 'AI Mental Health Support'
    });
  }

  // Start a new chat session
  async startChatSession(req, res) {
    try {
      const sessionId = 'session_' + Date.now() + '_' + (req.session.user?.id || 'anonymous');

      const { error } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: req.session.user?.id || null,
          session_id: sessionId,
          messages: [],
          risk_level: 'low',
          needs_human_intervention: false,
          created_at: new Date()
        }]);

      if (error) throw error;

      res.json({ sessionId, success: true });
    } catch (error) {
      console.error('Start chat session error:', error.message);
      res.status(500).json({ error: 'Failed to start chat session' });
    }
  }

  // Send a message to AI bot
  async sendMessage(req, res) {
    try {
      const { message, sessionId } = req.body;

      // Fetch chat session
      let { data: chatSession, error: findError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (findError && findError.code !== 'PGRST116') throw findError;

      // If no session exists, create one
      if (!chatSession) {
        const { data, error: insertError } = await supabase
          .from('chat_sessions')
          .insert([{
            user_id: req.session.user?.id || null,
            session_id: sessionId,
            messages: [],
            created_at: new Date()
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        chatSession = data;
      }

      // Add user message
      const updatedMessages = [
        ...chatSession.messages,
        { sender: 'user', message, timestamp: new Date() }
      ];

      // Get AI response
      const aiResponse = await getAIResponse(message, updatedMessages);

      // Add AI response
      updatedMessages.push({
        sender: 'bot',
        message: aiResponse.message,
        timestamp: new Date()
      });

      // Update chat session
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({
          messages: updatedMessages,
          risk_level: aiResponse.riskLevel || 'low',
          needs_human_intervention: aiResponse.riskLevel === 'high'
        })
        .eq('session_id', sessionId);

      if (updateError) throw updateError;

      res.json({
        response: aiResponse.message,
        riskLevel: aiResponse.riskLevel,
        needsIntervention: aiResponse.riskLevel === 'high'
      });
    } catch (error) {
      console.error('Send message error:', error.message);
      res.status(500).json({ error: 'Failed to process message' });
    }
  }

  // Get chat history for user
  async getChatHistory(req, res) {
    try {
      const userId = req.session.user.id;

      const { data: chatSessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      res.json({ chatSessions });
    } catch (error) {
      console.error('Get chat history error:', error.message);
      res.status(500).json({ error: 'Failed to retrieve chat history' });
    }
  }

  // Escalate session to human
  async escalateToHuman(req, res) {
    try {
      const { sessionId } = req.body;

      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ needs_human_intervention: true })
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        res.json({
          success: true,
          message: 'Your conversation has been escalated to a human counselor.'
        });
      } else {
        res.status(404).json({ error: 'Chat session not found' });
      }
    } catch (error) {
      console.error('Escalate to human error:', error.message);
      res.status(500).json({ error: 'Failed to escalate to human' });
    }
  }
}

module.exports = new ChatController();
