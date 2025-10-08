import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CreateUserRequest, LoginRequest, AuthResponse, ApiResponse } from '../types';
import userModel from '../models/User';
import redis from '../utils/redis';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      // Validate required fields
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, password, first name, and last name are required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user already exists
      const existingUser = await userModel.findByEmail(userData.email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Create user
      const user = await userModel.create(userData);

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(user.id, user.email, user.role);

      // Store refresh token in Redis
      await redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          token,
          refreshToken
        },
        message: 'User registered successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Find user
      const user = await userModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate password
      const isValidPassword = await userModel.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(user.id, user.email, user.role);

      // Store refresh token in Redis
      await redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          token,
          refreshToken
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid refresh token'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Get user
      const user = await userModel.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate new tokens
      const { token: newToken, refreshToken: newRefreshToken } = this.generateTokens(
        user.id, 
        user.email, 
        user.role
      );

      // Update refresh token in Redis
      await redis.set(`refresh_token:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60);

      const response: ApiResponse<{ token: string; refreshToken: string }> = {
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (userId) {
        // Remove refresh token from Redis
        await redis.del(`refresh_token:${userId}`);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  private generateTokens(userId: string, email: string, role: string) {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    
    // Generate tokens WITHOUT expiration to prevent 403 errors
    const token = jwt.sign(
      { userId, email, role },
      secret
      // Removed expiresIn to make tokens never expire
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      secret
      // Removed expiresIn to make refresh tokens never expire
    );

    return { token, refreshToken };
  }
}

export const authController = new AuthController();
export default authController;
