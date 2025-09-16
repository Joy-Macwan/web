// models/chatSession.js
const supabase = require('../config/supabase');

// Create a chat session
async function createChatSession(userId, sessionId) {
  return await supabase.from('chat_sessions').insert([
    { user_id: userId, session_id: sessionId }
  ]);
}

// Fetch chat session by ID
async function getChatSession(sessionId) {
  return await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();
}

// Add message to a session
async function addMessage(sessionId, sender, message) {
  return await supabase.from('messages').insert([
    {
      session_id: sessionId,
      sender,
      message
    }
  ]);
}

module.exports = {
  createChatSession,
  getChatSession,
  addMessage
};