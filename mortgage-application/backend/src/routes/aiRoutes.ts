import { Router } from 'express';
import chatbotService from '../services/chatbotService';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI Services
 *   description: AI-powered services for mortgage applications
 */

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the AI assistant
 *                 example: "What documents do I need to upload?"
 *               applicationId:
 *                 type: string
 *                 description: Optional application ID for context
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: AI assistant response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     related_documents:
 *                       type: array
 *                       items:
 *                         type: string
 *                     next_steps:
 *                       type: array
 *                       items:
 *                         type: string
 *                     confidence:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/chat', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, applicationId } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MESSAGE',
          message: 'Message is required'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const response = await chatbotService.generateResponse(message, applicationId);

    res.json({
      success: true,
      data: {
        response: response,
        suggestions: [
          "What documents do I need?",
          "How long does the process take?",
          "What are the interest rates?",
          "Can I track my application status?"
        ],
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get AI assistant response'
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/ai/health:
 *   get:
 *     summary: Check AI services health
 *     tags: [AI Services]
 *     responses:
 *       200:
 *         description: AI services health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     healthy:
 *                       type: boolean
 *                     services:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const isHealthy = await chatbotService.checkHealth();
    
    res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        services: {
          chatbot: isHealthy ? 'healthy' : 'unhealthy'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_ERROR',
        message: 'Failed to check AI services health'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Risk assessment endpoint removed - using simple chatbot only

export default router;
