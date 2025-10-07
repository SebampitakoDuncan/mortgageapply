import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Application, Document } from '../types';
import apiService from '../services/api';
import DocumentUpload from '../components/documents/DocumentUpload';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (selectedApplicationId) {
      loadDocuments(selectedApplicationId);
    } else {
      setDocuments([]);
    }
  }, [selectedApplicationId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getApplications();
      
      if (response.success && response.data) {
        // Map database field names (snake_case) to frontend field names (camelCase)
        const mappedApplications = response.data.map((app: any) => ({
          ...app,
          applicationNumber: app.application_number,
          personalInfo: app.personal_info,
          propertyDetails: app.property_details,
          loanInfo: app.loan_info,
          financialInfo: app.financial_info,
          riskScore: app.risk_score,
          createdAt: app.created_at,
          updatedAt: app.updated_at,
        }));
        setApplications(mappedApplications);
        
        // Auto-select first application if available
        if (mappedApplications.length > 0) {
          setSelectedApplicationId(mappedApplications[0].id);
        }
      }
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (applicationId: string) => {
    try {
      setDocumentsLoading(true);
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
      setDocumentsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    if (selectedApplicationId) {
      loadDocuments(selectedApplicationId);
    }
  };

  const selectedApplication = applications.find(app => app.id === selectedApplicationId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && applications.length === 0) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadApplications} startIcon={<RefreshIcon />} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (applications.length === 0) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, p: 3 }}>
        <Alert severity="info">
          No applications found. Please create an application first before uploading documents.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/application')}
          sx={{ mt: 2 }}
        >
          Create New Application
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Document Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/applications')}
            sx={{ mr: 2 }}
          >
            Back to Applications
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadApplications}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Application</InputLabel>
          <Select
            value={selectedApplicationId}
            label="Select Application"
            onChange={(e) => setSelectedApplicationId(e.target.value)}
          >
            {applications.map((app) => (
              <MenuItem key={app.id} value={app.id}>
                {app.applicationNumber} - {app.propertyDetails?.address || 'No address'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedApplication && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Application Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Application Number:</strong> {selectedApplication.applicationNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Property:</strong> {selectedApplication.propertyDetails?.address}, {selectedApplication.propertyDetails?.suburb}, {selectedApplication.propertyDetails?.state} {selectedApplication.propertyDetails?.postcode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Loan Amount:</strong> ${selectedApplication.loanInfo?.loanAmount?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Status:</strong> {selectedApplication.status}
            </Typography>
          </CardContent>
        </Card>
      )}

      {documentsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DocumentUpload
          applicationId={selectedApplicationId}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Documents;
