import { Router } from 'express';
import applicationController from '../controllers/applicationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create new application
router.post('/', (req, res) => applicationController.createApplication(req, res));

// Get user's applications
router.get('/', (req, res) => applicationController.getUserApplications(req, res));

// Get specific application by ID
router.get('/:id', (req, res) => applicationController.getApplicationById(req, res));

// Update application status
router.patch('/:id/status', (req, res) => applicationController.updateApplicationStatus(req, res));

export default router;
