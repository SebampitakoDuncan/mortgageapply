import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
  Psychology as IntelligenceIcon,
  TextFields as ExtractTextIcon,
  Analytics as AnalyzeIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import apiService from '../../services/api';
import { Document } from '../../types';

interface DocumentUploadProps {
  applicationId: string;
  onUploadSuccess?: () => void;
}

const documentTypes = [
  { value: 'identity', label: 'Identity Document' },
  { value: 'income', label: 'Income Verification' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'property', label: 'Property Documents' },
  { value: 'other', label: 'Other' },
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({ applicationId, onUploadSuccess }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [processingIntelligence, setProcessingIntelligence] = useState<string>(''); // documentId being processed
  const [intelligenceResults, setIntelligenceResults] = useState<{[key: string]: any}>({});

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getDocuments(applicationId);
      
      if (response.success && response.data) {
        // Map database field names to frontend field names
        const mappedDocuments = response.data.map((doc: any) => ({
          ...doc,
          applicationId: doc.application_id,
          originalName: doc.original_name,
          filePath: doc.file_path,
          fileSize: doc.file_size,
          mimeType: doc.mime_type,
          documentType: doc.document_type,
          aiProcessed: doc.ai_processed,
          aiAnalysis: doc.ai_analysis,
          createdAt: doc.created_at,
        }));
        setDocuments(mappedDocuments);
      }
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Load existing documents when component mounts or applicationId changes
  useEffect(() => {
    if (applicationId) {
      loadDocuments();
    }
  }, [applicationId, loadDocuments]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('onDrop called with files:', acceptedFiles);
    
    if (!selectedDocumentType) {
      setError('Please select a document type first');
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      console.log('Calling uploadDocument API...');
      const response = await apiService.uploadDocument(applicationId, file, selectedDocumentType);
      console.log('Upload response:', response);

      if (response.success && response.data) {
        // Map database field names to frontend field names
        const dbData = response.data as any;
        const mappedDocument = {
          ...dbData,
          applicationId: dbData.application_id,
          originalName: dbData.original_name,
          filePath: dbData.file_path,
          fileSize: dbData.file_size,
          mimeType: dbData.mime_type,
          documentType: dbData.document_type,
          aiProcessed: dbData.ai_processed,
          aiAnalysis: dbData.ai_analysis,
          createdAt: dbData.created_at,
        };

        setSelectedDocumentType('');
        // Reload documents to get the updated list
        await loadDocuments();
        console.log('Document uploaded successfully!');
        onUploadSuccess?.();
      } else {
        setError(response.error?.message || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [applicationId, selectedDocumentType, onUploadSuccess, loadDocuments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    disabled: uploading || !selectedDocumentType,
  });

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const response = await apiService.deleteDocument(documentId);

      if (response.success) {
        // Reload documents to get the updated list
        await loadDocuments();
      } else {
        setError(response.error?.message || 'Failed to delete document');
      }
    } catch (err) {
      setError('Failed to delete document');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      setLoading(true);
      const blob = await apiService.downloadDocument(doc.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download document');
      console.error('Download error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const handleExtractText = async (documentId: string) => {
    try {
      setProcessingIntelligence(documentId);
      setError('');
      
      const response = await apiService.extractTextFromDocument(documentId);
      
      if (response.success && response.data) {
        setIntelligenceResults(prev => ({
          ...prev,
          [documentId]: {
            type: 'text_extraction',
            ...response.data
          }
        }));
        
        // Reload documents to update AI processed status
        await loadDocuments();
      } else {
        setError(response.error?.message || 'Failed to extract text from document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from document');
      console.error('Text extraction error:', err);
    } finally {
      setProcessingIntelligence('');
    }
  };

  const handleAnalyzeDocument = async (documentId: string) => {
    try {
      setProcessingIntelligence(documentId);
      setError('');
      
      const response = await apiService.analyzeDocument(documentId);
      
      if (response.success && response.data) {
        setIntelligenceResults(prev => ({
          ...prev,
          [documentId]: {
            type: 'document_analysis',
            ...response.data
          }
        }));
        
        // Reload documents to update AI processed status
        await loadDocuments();
      } else {
        setError(response.error?.message || 'Failed to analyze document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document');
      console.error('Document analysis error:', err);
    } finally {
      setProcessingIntelligence('');
    }
  };

  const isDocumentSupported = (mimeType: string) => {
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    return supportedTypes.includes(mimeType);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Document Upload
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload supporting documents for your mortgage application. Accepted formats: PDF, JPG, PNG, DOC, DOCX (max 10MB).
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={selectedDocumentType}
            label="Document Type"
            onChange={(e) => setSelectedDocumentType(e.target.value)}
          >
            {documentTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: uploading || !selectedDocumentType ? 'not-allowed' : 'pointer',
            opacity: uploading || !selectedDocumentType ? 0.6 : 1,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: uploading || !selectedDocumentType ? 'grey.300' : 'primary.main',
              backgroundColor: uploading || !selectedDocumentType ? 'background.paper' : 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {uploading ? 'Uploading...' : isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select a file
          </Typography>
          {!selectedDocumentType && (
            <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
              Please select a document type first
            </Typography>
          )}
          {uploading && <CircularProgress sx={{ mt: 2 }} />}
        </Paper>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading documents...
          </Typography>
        </Box>
      )}

      {documents.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Uploaded Documents ({documents.length})
          </Typography>
          <List>
            {documents.map((document) => (
              <ListItem key={document.id} divider>
                <DocumentIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={document.originalName}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {getDocumentTypeLabel(document.documentType)} • {formatFileSize(document.fileSize)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {new Date(document.createdAt).toLocaleDateString()}
                      </Typography>
                      {document.aiProcessed && (
                        <Chip
                          label="Content Extracted"
                          size="small"
                          color="success"
                          sx={{ ml: 1, mt: 0.5 }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {/* Document Intelligence Buttons */}
                    {isDocumentSupported(document.mimeType) && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleExtractText(document.id)}
                          disabled={loading || processingIntelligence === document.id}
                          title="Extract Text"
                          sx={{ color: 'primary.main' }}
                        >
                          {processingIntelligence === document.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ExtractTextIcon fontSize="small" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAnalyzeDocument(document.id)}
                          disabled={loading || processingIntelligence === document.id}
                          title="Analyze Document"
                          sx={{ color: 'secondary.main' }}
                        >
                          {processingIntelligence === document.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <AnalyzeIcon fontSize="small" />
                          )}
                        </IconButton>
                      </>
                    )}
                    
                    {/* Standard Actions */}
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadDocument(document)}
                      disabled={loading}
                      title="Download"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDocument(document.id)}
                      disabled={loading}
                      color="error"
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Document Extraction Results */}
      {Object.keys(intelligenceResults).length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Document Extraction Results
          </Typography>
          {Object.entries(intelligenceResults).map(([documentId, result]) => {
            const document = documents.find(d => d.id === documentId);
            return (
              <Paper key={documentId} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <IntelligenceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {document?.originalName || 'Unknown Document'}
                </Typography>
                
                {result.type === 'text_extraction' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Text Extraction Results (Confidence: {(result.confidenceScore * 100).toFixed(1)}%)
                    </Typography>
                    <Typography variant="caption" display="block" gutterBottom>
                      Method: {result.processingMethod} • Words: {result.wordCount}
                      {result.pageCount && ` • Pages: ${result.pageCount}`}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50' }}>
                      <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {result.extractedText || 'No text extracted'}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {result.type === 'document_analysis' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Document Analysis Results (Confidence: {(result.confidenceScore * 100).toFixed(1)}%)
                    </Typography>
                    <Typography variant="caption" display="block" gutterBottom>
                      Document Type: <Chip label={result.documentType} size="small" sx={{ ml: 0.5 }} />
                    </Typography>
                    
                    {result.extractedFields && Object.keys(result.extractedFields).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Extracted Fields:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(result.extractedFields).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${Array.isArray(value) ? value.join(', ') : value}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {result.suggestions && result.suggestions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Suggestions:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                          {result.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>
                              <Typography variant="caption">{suggestion}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
