// utils/aiChatBot.js
class AIChatBot {
  constructor() {
    this.responses = {
      greeting: [
        "Hello! I'm here to support you. How are you feeling today?",
        "Hi there! What's on your mind?",
        "Welcome! I'm glad you reached out. How can I help you?"
      ],
      anxiety: [
        "I understand you're feeling anxious. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8.",
        "Anxiety can be overwhelming. Let's ground yourself: name 5 things you can see, 4 you can touch, 3 you can hear.",
        "It's okay to feel anxious. Would you like to try a quick mindfulness exercise?"
      ],
      depression: [
        "I hear that you're struggling. Your feelings are valid, and seeking help shows strength.",
        "Depression can make everything feel difficult. Have you been able to do any small self-care activities today?",
        "Thank you for sharing this with me. Would it help to talk about what's been weighing on you?"
      ],
      stress: [
        "Stress can be really challenging. Let's work on breaking it down into manageable pieces.",
        "I understand you're feeling stressed. What's the most pressing thing you're dealing with right now?",
        "Stress affects us all differently. Have you tried any stress-relief techniques that have helped before?"
      ],
      crisis: [
        "I'm concerned about what you're sharing. Please reach out to a counselor immediately at +91-123-456-7890 or emergency services at 112.",
        "Your safety is the most important thing right now. Please contact the crisis helpline at +91-987-654-3210 immediately.",
        "This sounds very serious. Please don't hesitate to call emergency services at 112 or contact a trusted person right away."
      ],
      positive: [
        "I'm glad to hear you're doing well! What's been helping you feel positive?",
        "That's wonderful to hear! Keep up the good work with your mental health.",
        "It sounds like you're in a good place. Is there anything specific that's been working well for you?"
      ],
      general: [
        "I'm here to listen. Can you tell me more about what you're experiencing?",
        "Thank you for sharing that with me. How has this been affecting your daily life?",
        "I appreciate you opening up. What kind of support would be most helpful right now?"
      ]
    };

    this.crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'die', 'hurt myself', 'self-harm',
      'cutting', 'overdose', 'worthless', 'hopeless', 'give up'
    ];

    this.anxietyKeywords = [
      'anxious', 'anxiety', 'worried', 'panic', 'nervous', 'scared', 'fear',
      'overwhelmed', 'racing thoughts', 'can\'t breathe'
    ];

    this.depressionKeywords = [
      'depressed', 'depression', 'sad', 'lonely', 'empty', 'numb', 'hopeless',
      'tired', 'exhausted', 'worthless', 'guilty'
    ];

    this.stressKeywords = [
      'stressed', 'stress', 'pressure', 'overwhelmed', 'busy', 'exhausted',
      'deadline', 'exam', 'work', 'academic'
    ];

    this.positiveKeywords = [
      'good', 'great', 'happy', 'better', 'improving', 'positive', 'grateful',
      'thankful', 'excited', 'proud'
    ];
  }

  async getAIResponse(message, conversationHistory = []) {
    try {
      const lowerMessage = message.toLowerCase();
      let category = 'general';
      let riskLevel = 'low';

      // Check for crisis indicators
      if (this.crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
        category = 'crisis';
        riskLevel = 'high';
      }
      // Check for anxiety
      else if (this.anxietyKeywords.some(keyword => lowerMessage.includes(keyword))) {
        category = 'anxiety';
        riskLevel = 'medium';
      }
      // Check for depression
      else if (this.depressionKeywords.some(keyword => lowerMessage.includes(keyword))) {
        category = 'depression';
        riskLevel = 'medium';
      }
      // Check for stress
      else if (this.stressKeywords.some(keyword => lowerMessage.includes(keyword))) {
        category = 'stress';
        riskLevel = 'low';
      }
      // Check for positive sentiment
      else if (this.positiveKeywords.some(keyword => lowerMessage.includes(keyword))) {
        category = 'positive';
        riskLevel = 'low';
      }
      // Greeting patterns
      else if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerMessage)) {
        category = 'greeting';
        riskLevel = 'low';
      }

      const responses = this.responses[category] || this.responses.general;
      const response = responses[Math.floor(Math.random() * responses.length)];

      return {
        message: response,
        category,
        riskLevel,
        suggestions: this.getSuggestions(category)
      };
    } catch (error) {
      console.error('AI response error:', error);
      return {
        message: "I'm sorry, I'm having trouble processing your message right now. Please try again, or consider speaking with a human counselor.",
        category: 'error',
        riskLevel: 'low',
        suggestions: ['Contact counselor', 'Try again later']
      };
    }
  }

  getSuggestions(category) {
    const suggestions = {
      anxiety: [
        'Try deep breathing exercises',
        'Practice grounding techniques',
        'Consider talking to a counselor',
        'Explore relaxation resources'
      ],
      depression: [
        'Reach out to support network',
        'Consider professional help',
        'Engage in self-care activities',
        'Join support groups'
      ],
      stress: [
        'Break tasks into smaller steps',
        'Practice time management',
        'Try stress-relief techniques',
        'Talk to someone you trust'
      ],
      crisis: [
        'Contact emergency services: 112',
        'Call crisis helpline: +91-987-654-3210',
        'Reach out to a trusted person',
        'Go to nearest hospital'
      ],
      general: [
        'Explore mental health resources',
        'Consider booking an appointment',
        'Join our community forum',
        'Try self-assessment tools'
      ]
    };

    return suggestions[category] || suggestions.general;
  }
}

const aiChatBot = new AIChatBot();

async function getAIResponse(message, conversationHistory) {
  return await aiChatBot.getAIResponse(message, conversationHistory);
}

module.exports = {
  getAIResponse
};
