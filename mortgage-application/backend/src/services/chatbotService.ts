import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class ChatbotService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not found in environment variables');
    } else {
      console.log(`✅ ChatbotService initialized with API key: ${this.apiKey.substring(0, 10)}...`);
    }
  }

  async generateResponse(userMessage: string, applicationId?: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

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

      const response = await axios.post<OpenRouterResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: 'openai/gpt-oss-20b:free',
          messages: messages,
          max_tokens: 450,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Mortgage Application Assistant',
          },
        }
      );

      const assistantMessage = response.data.choices[0]?.message?.content;
      
      if (!assistantMessage) {
        throw new Error('No response from OpenRouter API');
      }

      return assistantMessage;

    } catch (error) {
      console.error('Chatbot service error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key for OpenRouter');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status === 500) {
          throw new Error('OpenRouter service is temporarily unavailable');
        }
      }
      
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }

      // Simple health check by making a minimal request
      await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'openai/gpt-oss-20b:free',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Mortgage Application Assistant',
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Chatbot health check failed:', error);
      return false;
    }
  }
}

export default new ChatbotService();
