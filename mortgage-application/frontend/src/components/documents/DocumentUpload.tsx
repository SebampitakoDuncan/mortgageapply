import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  const handleLLMAnalyzeDocument = async (documentId: string) => {
    try {
      setProcessingIntelligence(documentId);
      setError('');
      
      const response = await apiService.analyzeLLMDocument(documentId);
      
      if (response.success && response.data) {
        setIntelligenceResults(prev => ({
          ...prev,
          [documentId]: {
            type: 'llm_analysis',
            llmAnalysis: response.data.llmAnalysis,
            extractedText: response.data.extractedText,
            modelUsed: response.data.modelUsed,
            confidenceScore: response.data.confidenceScore,
            wordCount: response.data.wordCount,
            analysisTimeMs: response.data.analysisTimeMs,
            tokensAnalyzed: response.data.tokensAnalyzed
          }
        }));
        
        // Reload documents to update AI processed status
        await loadDocuments();
      } else {
        setError(response.error?.message || 'Failed to analyze document with LLM');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze document with LLM');
      console.error('LLM analysis error:', err);
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
                          onClick={() => handleLLMAnalyzeDocument(document.id)}
                          disabled={loading || processingIntelligence === document.id}
                          title="AI Banking Analysis"
                          sx={{ color: 'warning.main' }}
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
                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 500, overflow: 'auto', bgcolor: 'grey.50', mt: 1 }}>
                      <Typography variant="body2" component="pre" sx={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        lineHeight: 1.6
                      }}>
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

                {result.type === 'llm_analysis' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      🏦 AI Banking Analysis (Confidence: {(result.confidenceScore * 100).toFixed(1)}%)
                    </Typography>
                    <Typography variant="caption" display="block" gutterBottom>
                      Model: {result.modelUsed} • Words: {result.wordCount} • Tokens: {result.tokensAnalyzed} • Time: {result.analysisTimeMs}ms
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ 
                      p: 3, 
                      mt: 1, 
                      bgcolor: 'grey.50', 
                      border: '1px solid', 
                      borderColor: 'grey.300',
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: '#000000',
                        fontWeight: 'bold',
                        mt: 2,
                        mb: 1,
                        '&:first-of-type': { mt: 0 }
                      },
                      '& h1': { fontSize: '1.25rem' },
                      '& h2': { fontSize: '1.1rem' },
                      '& h3': { fontSize: '1rem' },
                      '& p': {
                        mb: 1.5,
                        lineHeight: 1.6,
                        color: '#000000',
                        '&:last-child': { mb: 0 }
                      },
                      '& ul, & ol': {
                        pl: 2,
                        mb: 1.5,
                        '& li': {
                          mb: 0.5,
                          lineHeight: 1.5,
                          color: '#000000'
                        }
                      },
                      '& strong': {
                        fontWeight: 'bold',
                        color: '#000000'
                      },
                      '& em': {
                        fontStyle: 'italic',
                        color: '#333333'
                      },
                      '& code': {
                        bgcolor: 'grey.200',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        color: '#000000'
                      },
                      '& table': {
                        width: '100%',
                        borderCollapse: 'collapse',
                        mb: 2,
                        mt: 1,
                        '& th, & td': {
                          border: '1px solid #333333',
                          padding: '8px 12px',
                          textAlign: 'left',
                          color: '#000000'
                        },
                        '& th': {
                          backgroundColor: '#f5f5f5',
                          fontWeight: 'bold'
                        },
                        '& tr:nth-of-type(even)': {
                          backgroundColor: '#fafafa'
                        }
                      },
                      '& blockquote': {
                        borderLeft: '4px solid #333333',
                        pl: 2,
                        ml: 0,
                        mb: 2,
                        fontStyle: 'italic',
                        color: '#333333'
                      },
                      '& hr': {
                        border: 'none',
                        borderTop: '1px solid #333333',
                        my: 2
                      }
                    }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <Typography variant="body2" component="p" sx={{ mb: 1.5, lineHeight: 1.6, color: '#000000', '&:last-child': { mb: 0 } }}>
                              {children}
                            </Typography>
                          ),
                          h1: ({ children }) => (
                            <Typography variant="h6" component="h1" sx={{ color: '#000000', fontWeight: 'bold', mt: 2, mb: 1, '&:first-of-type': { mt: 0 } }}>
                              {children}
                            </Typography>
                          ),
                          h2: ({ children }) => (
                            <Typography variant="subtitle1" component="h2" sx={{ color: '#000000', fontWeight: 'bold', mt: 2, mb: 1, '&:first-of-type': { mt: 0 } }}>
                              {children}
                            </Typography>
                          ),
                          h3: ({ children }) => (
                            <Typography variant="subtitle2" component="h3" sx={{ color: '#000000', fontWeight: 'bold', mt: 1.5, mb: 0.75 }}>
                              {children}
                            </Typography>
                          ),
                          h4: ({ children }) => (
                            <Typography variant="body1" component="h4" sx={{ color: '#000000', fontWeight: 'bold', mt: 1.5, mb: 0.75 }}>
                              {children}
                            </Typography>
                          ),
                          h5: ({ children }) => (
                            <Typography variant="body2" component="h5" sx={{ color: '#000000', fontWeight: 'bold', mt: 1, mb: 0.5 }}>
                              {children}
                            </Typography>
                          ),
                          h6: ({ children }) => (
                            <Typography variant="caption" component="h6" sx={{ color: '#000000', fontWeight: 'bold', mt: 1, mb: 0.5, display: 'block' }}>
                              {children}
                            </Typography>
                          ),
                          strong: ({ children }) => (
                            <Typography component="strong" sx={{ fontWeight: 'bold', color: '#000000' }}>
                              {children}
                            </Typography>
                          ),
                          em: ({ children }) => (
                            <Typography component="em" sx={{ fontStyle: 'italic', color: '#333333' }}>
                              {children}
                            </Typography>
                          ),
                          li: ({ children }) => (
                            <Typography component="li" variant="body2" sx={{ mb: 0.5, lineHeight: 1.5, color: '#000000' }}>
                              {children}
                            </Typography>
                          ),
                          table: ({ children }) => (
                            <Box component="table" sx={{ 
                              width: '100%', 
                              borderCollapse: 'collapse', 
                              mb: 2, 
                              mt: 1,
                              border: '1px solid #333333'
                            }}>
                              {children}
                            </Box>
                          ),
                          th: ({ children }) => (
                            <Box component="th" sx={{ 
                              border: '1px solid #333333',
                              padding: '8px 12px',
                              textAlign: 'left',
                              backgroundColor: '#f5f5f5',
                              fontWeight: 'bold',
                              color: '#000000'
                            }}>
                              {children}
                            </Box>
                          ),
                          td: ({ children }) => (
                            <Box component="td" sx={{ 
                              border: '1px solid #333333',
                              padding: '8px 12px',
                              textAlign: 'left',
                              color: '#000000'
                            }}>
                              {children}
                            </Box>
                          ),
                          blockquote: ({ children }) => (
                            <Box component="blockquote" sx={{
                              borderLeft: '4px solid #333333',
                              pl: 2,
                              ml: 0,
                              mb: 2,
                              fontStyle: 'italic',
                              color: '#333333'
                            }}>
                              {children}
                            </Box>
                          ),
                          code: ({ children, ...props }) => {
                            const inline = (props as any).inline;
                            return inline ? (
                              <Typography component="code" sx={{
                                bgcolor: 'grey.200',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: '0.875rem',
                                fontFamily: 'monospace',
                                color: '#000000'
                              }}>
                                {children}
                              </Typography>
                            ) : (
                              <Box component="pre" sx={{
                                bgcolor: 'grey.200',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                mb: 2,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: '#000000'
                              }}>
                                <code>{children}</code>
                              </Box>
                            );
                          }
                        }}
                      >
                        {result.llmAnalysis || 'No analysis available'}
                      </ReactMarkdown>
                    </Paper>

                    {result.extractedText && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Extracted Text:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto', bgcolor: 'grey.50' }}>
                          <Typography variant="caption" component="pre" sx={{ 
                            whiteSpace: 'pre-wrap', 
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}>
                            {result.extractedText.substring(0, 1000)}{result.extractedText.length > 1000 ? '...' : ''}
                          </Typography>
                        </Paper>
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
