import { Request, Response } from 'express';
import { CreateApplicationRequest, Application, ApiResponse } from '../types';
import applicationModel from '../models/Application';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationController {
  async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const applicationData: CreateApplicationRequest = {
        ...req.body,
        userId,
        applicationNumber: `APP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        status: 'submitted'
      };

      // Create application first
      const application = await applicationModel.create(applicationData);

      const response: ApiResponse<Application> = {
        success: true,
        data: application,
        message: 'Application submitted successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create application'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async getUserApplications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const applications = await applicationModel.findByUserId(userId);

      const response: ApiResponse<Application[]> = {
        success: true,
        data: applications,
        message: 'Applications retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve applications'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async getApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Application ID is required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const application = await applicationModel.findById(id);

      if (!application) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Application not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns this application
      if (application.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse<Application> = {
        success: true,
        data: application,
        message: 'Application retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve application'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Application ID is required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
      const { status } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const application = await applicationModel.findById(id);
      if (!application || application.user_id !== userId) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Application not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updatedApplication = await applicationModel.updateStatus(id, status);

      if (!updatedApplication) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update application'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse<Application> = {
        success: true,
        data: updatedApplication,
        message: 'Application status updated successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update application'
        },
        timestamp: new Date().toISOString()
      });
    }
  }


}

export const applicationController = new ApplicationController();
export default applicationController;
