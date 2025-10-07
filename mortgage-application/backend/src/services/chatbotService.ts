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
    }
  }

  async generateResponse(userMessage: string, applicationId?: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const systemPrompt = `You are an expert customer care assistant for home mortgage loans at a top Australian bank. You specialize in helping customers with their mortgage applications, providing exceptional support and guidance throughout the entire process.

Your expertise includes:
- Mortgage application guidance and support
- Document requirements and verification
- Application status updates and tracking
- Loan types, interest rates, and terms explanation
- General mortgage and home buying questions
- Troubleshooting application issues
- Process timeline and next steps

Guidelines:
- Be friendly, professional, and empathetic
- Provide clear, accurate, and helpful information
- If you don't have specific information about their application, guide them to the appropriate resources
- Keep responses concise but comprehensive
- Always prioritize customer satisfaction and support
- Format your responses professionally with proper structure
- Use bullet points or numbered lists when appropriate for clarity
- Be encouraging and supportive throughout the mortgage process

${applicationId ? `Current application ID: ${applicationId}` : ''}`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const response = await axios.post<OpenRouterResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: 'openai/gpt-4o-mini',
          messages: messages,
          max_tokens: 500,
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
          model: 'openai/gpt-4o-mini',
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
