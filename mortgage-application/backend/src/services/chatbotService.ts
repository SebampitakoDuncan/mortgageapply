import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class ChatbotService {
  private lmStudioURL: string;
  private model: string;

  constructor() {
    // LM Studio configuration (only option)
    this.lmStudioURL = process.env.LM_STUDIO_URL || 'http://127.0.0.1:1234';
    this.model = process.env.LM_STUDIO_MODEL || 'google/gemma-3-1b';
    
    console.log(`🏠 ChatbotService initialized with LM Studio:`);
    console.log(`   - URL: ${this.lmStudioURL}`);
    console.log(`   - Model: ${this.model}`);
  }

  async generateResponse(userMessage: string, applicationId?: string): Promise<string> {
    try {
      const systemPrompt = `You are Chloe, a friendly mortgage specialist assistant for an Australian bank. You help customers with their home loan applications in a conversational, approachable way.

CHAT RESPONSE GUIDELINES:
- Keep responses conversational and chat-friendly (aim for 2-5 sentences)
- NO large tables or extensive lists - use simple bullet points (max 4-5 items)
- Be concise but complete - finish your thoughts naturally
- Use emojis sparingly for friendliness
- Prioritize the most important information first
- If complex, break into digestible chunks but complete each point

Your expertise: mortgage applications, document requirements, loan processes, interest rates, and general home buying guidance.

Response style: Friendly, professional, helpful. Think "complete helpful chat message" not "detailed manual".

${applicationId ? `Current application ID: ${applicationId}` : ''}`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      console.log(`🏠 Using LM Studio at ${this.lmStudioURL}...`);
      const response = await axios.post<LLMResponse>(
        `${this.lmStudioURL}/v1/chat/completions`,
        {
          model: this.model,
          messages: messages,
          max_tokens: 450,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const assistantMessage = response.data.choices[0]?.message?.content;
      
      if (!assistantMessage) {
        throw new Error('No response from LM Studio');
      }

      console.log('✅ LM Studio response received');
      return assistantMessage;

    } catch (error) {
      console.error('Chatbot service error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('LM Studio is not running. Please start LM Studio and ensure the server is running on http://127.0.0.1:1234');
        } else if (error.response?.status === 500) {
          throw new Error('LM Studio service error. Please check the model is loaded correctly.');
        }
      }
      
      throw new Error('Failed to generate response. Please ensure LM Studio is running.');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await axios.post(
        `${this.lmStudioURL}/v1/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout for health check
        }
      );
      console.log('✅ LM Studio health check passed');
      return true;
    } catch (error) {
      console.error('❌ LM Studio health check failed:', error);
      return false;
    }
  }
}

export default new ChatbotService();
