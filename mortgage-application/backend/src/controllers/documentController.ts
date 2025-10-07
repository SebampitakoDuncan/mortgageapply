import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import FormData from 'form-data';
import { ApiResponse, Document } from '../types';
import { documentModel } from '../models/Document';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export class DocumentController {
  async uploadDocument(req: Request, res: Response) {
    try {
      console.log('📄 Upload document request received - v2');
      console.log('File:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'No file');
      console.log('Params:', req.params);
      console.log('Body:', req.body);

      const { applicationId } = req.params;
      const { documentType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_APPLICATION_ID',
            message: 'Application ID is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      if (!documentType) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DOCUMENT_TYPE',
            message: 'Document type is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Create document record in database
      const documentData = {
        applicationId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType
      };

      const document = await documentModel.create(documentData);

      console.log(`📄 Document uploaded successfully: ${document.id}`);

      const response: ApiResponse<Document> = {
        success: true,
        data: document,
        message: 'Document uploaded successfully. AI analysis in progress.',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Failed to upload document'
        },
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  async getDocuments(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_APPLICATION_ID',
            message: 'Application ID is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const documents = await documentModel.findByApplicationId(applicationId);

      const response: ApiResponse<Document[]> = {
        success: true,
        data: documents,
        message: 'Documents retrieved successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DOCUMENTS_ERROR',
          message: 'Failed to retrieve documents'
        },
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  async downloadDocument(req: Request, res: Response) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DOCUMENT_ID',
            message: 'Document ID is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const document = await documentModel.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Document not found'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if file exists
      if (!fs.existsSync(document.file_path)) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found on server'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${document.original_name}"`);
      res.setHeader('Content-Type', document.mime_type);

      // Stream the file
      const fileStream = fs.createReadStream(document.file_path);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DOWNLOAD_ERROR',
          message: 'Failed to download document'
        },
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DOCUMENT_ID',
            message: 'Document ID is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      const document = await documentModel.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Document not found'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Delete file from filesystem
      if (fs.existsSync(document.file_path)) {
        fs.unlinkSync(document.file_path);
      }

      // Delete record from database
      await documentModel.delete(documentId);

      const response: ApiResponse = {
        success: true,
        message: 'Document deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete document'
        },
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  async extractTextFromDocument(req: Request, res: Response) {
    try {
      console.log('🧠 Document intelligence request received');
      const { documentId } = req.params;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DOCUMENT_ID',
            message: 'Document ID is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Get document from database
      const document = await documentModel.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Document not found'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if file exists
      if (!fs.existsSync(document.file_path)) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found on server'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if document type is supported for text extraction
      const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!supportedTypes.includes(document.mime_type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNSUPPORTED_FILE_TYPE',
            message: 'Text extraction not supported for this file type'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Call AI service for text extraction
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      
      try {
        // Create form data with the file
        const formData = new FormData();
        const fileStream = fs.createReadStream(document.file_path);
        formData.append('file', fileStream, {
          filename: document.original_name,
          contentType: document.mime_type
        });

        console.log(`🧠 Calling AI service at ${aiServiceUrl}/extract-text`);
        
        const aiResponse = await axios.post(`${aiServiceUrl}/extract-text`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 30000, // 30 second timeout
        });

        console.log('🧠 AI service response received');

        // Update document with AI analysis
        const aiAnalysis = {
          extracted_text: aiResponse.data.data.extracted_text,
          confidence_score: aiResponse.data.data.confidence_score,
          processing_method: aiResponse.data.data.processing_method,
          word_count: aiResponse.data.data.word_count,
          processed_at: new Date().toISOString()
        };

        await documentModel.updateAiAnalysis(documentId, aiAnalysis);

        const response: ApiResponse = {
          success: true,
          data: {
            documentId: documentId,
            filename: document.original_name,
            extractedText: aiResponse.data.data.extracted_text,
            confidenceScore: aiResponse.data.data.confidence_score,
            processingMethod: aiResponse.data.data.processing_method,
            wordCount: aiResponse.data.data.word_count,
            pageCount: aiResponse.data.data.page_count
          },
          message: 'Text extracted successfully',
          timestamp: new Date().toISOString()
        };

        res.json(response);
      } catch (aiError: any) {
        console.error('AI service error:', aiError.message);
        
        // Check if it's a connection error
        if (aiError.code === 'ECONNREFUSED') {
          return res.status(503).json({
            success: false,
            error: {
              code: 'AI_SERVICE_UNAVAILABLE',
              message: 'Document intelligence service is currently unavailable. Please try again later.'
            },
            timestamp: new Date().toISOString()
          });
        }

        return res.status(500).json({
          success: false,
          error: {
            code: 'AI_PROCESSING_ERROR',
            message: 'Failed to process document with AI service'
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Extract text error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'EXTRACTION_ERROR',
          message: 'Failed to extract text from document'
        },
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  async analyzeDocumentStructure(req: Request, res: Response) {
    try {
      console.log('🔍 Document structure analysis request received');
      const { documentId } = req.params;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DOCUMENT_ID',
            message: 'Document ID is required'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Get document from database
      const document = await documentModel.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Document not found'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Check if file exists
      if (!fs.existsSync(document.file_path)) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found on server'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Call AI service for document analysis
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      
      try {
        // Create form data with the file
        const formData = new FormData();
        const fileStream = fs.createReadStream(document.file_path);
        formData.append('file', fileStream, {
          filename: document.original_name,
          contentType: document.mime_type
        });

        console.log(`🔍 Calling AI service at ${aiServiceUrl}/analyze-document`);
        
        const aiResponse = await axios.post(`${aiServiceUrl}/analyze-document`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 45000, // 45 second timeout for analysis
        });

        console.log('🔍 AI analysis response received');

        // Update document with comprehensive AI analysis
        const aiAnalysis = {
          document_type: aiResponse.data.data.document_type,
          extracted_fields: aiResponse.data.data.extracted_fields,
          confidence_score: aiResponse.data.data.confidence_score,
          raw_text: aiResponse.data.data.raw_text,
          suggestions: aiResponse.data.data.suggestions,
          analyzed_at: new Date().toISOString()
        };

        await documentModel.updateAiAnalysis(documentId, aiAnalysis);

        const response: ApiResponse = {
          success: true,
          data: {
            documentId: documentId,
            filename: document.original_name,
            documentType: aiResponse.data.data.document_type,
            extractedFields: aiResponse.data.data.extracted_fields,
            confidenceScore: aiResponse.data.data.confidence_score,
            suggestions: aiResponse.data.data.suggestions,
            rawText: aiResponse.data.data.raw_text
          },
          message: 'Document analyzed successfully',
          timestamp: new Date().toISOString()
        };

        res.json(response);
      } catch (aiError: any) {
        console.error('AI analysis service error:', aiError.message);
        
        if (aiError.code === 'ECONNREFUSED') {
          return res.status(503).json({
            success: false,
            error: {
              code: 'AI_SERVICE_UNAVAILABLE',
              message: 'Document analysis service is currently unavailable. Please try again later.'
            },
            timestamp: new Date().toISOString()
          });
        }

        return res.status(500).json({
          success: false,
          error: {
            code: 'AI_ANALYSIS_ERROR',
            message: 'Failed to analyze document structure'
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Analyze document error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Failed to analyze document'
        },
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

}

export const documentController = new DocumentController();
export default documentController;
