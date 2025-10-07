import { Router } from 'express';
import { documentController, upload } from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All document routes require authentication
router.use(authenticateToken);

// Upload document
router.post('/:applicationId/upload', upload.single('file'), (req, res) => documentController.uploadDocument(req, res));

// Get documents for an application
router.get('/:applicationId', (req, res) => documentController.getDocuments(req, res));

// Test endpoint to check route binding (must be after parameterized routes)
router.get('/test', (req, res) => {
  res.json({ message: 'Document routes are working', timestamp: new Date().toISOString() });
});

// Download document
router.get('/download/:documentId', (req, res) => documentController.downloadDocument(req, res));

// Delete document
router.delete('/:documentId', (req, res) => documentController.deleteDocument(req, res));

// Document Intelligence endpoints
router.post('/extract-text/:documentId', (req, res) => documentController.extractTextFromDocument(req, res));
router.post('/analyze/:documentId', (req, res) => documentController.analyzeDocumentStructure(req, res));
router.post('/analyze-llm/:documentId', (req, res) => documentController.analyzeLLMDocument(req, res));

export default router;
