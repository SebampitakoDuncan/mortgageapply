import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Assessment as AssessmentIcon,
  DocumentScanner as DocumentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { Application } from '../types';
import apiService from '../services/api';
import AIInsights from '../components/ai/AIInsights';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AIInsightsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    loadApplications();
  }, []);

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
        if (mappedApplications.length > 0) {
          setSelectedApplication(mappedApplications[0]);
          loadDocuments(mappedApplications[0].id);
        }
      } else {
        setError('Failed to load applications');
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
    loadDocuments(application.id);
  };

  const loadDocuments = async (applicationId: string) => {
    try {
      const response = await apiService.getDocuments(applicationId);
      if (response.success && response.data) {
        // Map database field names (snake_case) to frontend field names (camelCase)
        const mappedDocuments = response.data.map((doc: any) => ({
          ...doc,
          originalName: doc.original_name,
          documentType: doc.document_type,
          aiProcessed: doc.ai_processed,
          aiAnalysis: doc.ai_analysis,
          createdAt: doc.created_at,
        }));
        setDocuments(mappedDocuments);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setDocuments([]);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadApplications} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <BrainIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              AI Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AI-powered analysis of your mortgage applications, risk assessments, and document verification.
            </Typography>
          </Box>
        </Box>
      </Box>

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BrainIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Applications Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first mortgage application to see AI insights and analysis.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3 }}>
          {/* Application Selector */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Application
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {applications.map((app) => (
                    <Button
                      key={app.id}
                      variant={selectedApplication?.id === app.id ? 'contained' : 'outlined'}
                      onClick={() => handleApplicationSelect(app)}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {app.applicationNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {app.status}
                        </Typography>
                      </Box>
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* AI Insights Content */}
          <Box>
            {selectedApplication ? (
              <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={selectedTab} onChange={handleTabChange}>
                    <Tab 
                      label="Risk Assessment" 
                      icon={<AssessmentIcon />}
                      iconPosition="start"
                    />
                    <Tab 
                      label="Document Analysis" 
                      icon={<DocumentIcon />}
                      iconPosition="start"
                    />
                    <Tab 
                      label="Overall Insights" 
                      icon={<TrendingUpIcon />}
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                <TabPanel value={selectedTab} index={0}>
                  <AIInsights 
                    applicationId={selectedApplication.id}
                    documents={documents}
                  />
                </TabPanel>

                <TabPanel value={selectedTab} index={1}>
                  <AIInsights 
                    applicationId={selectedApplication.id}
                    documents={documents}
                    showOnlyDocuments={true}
                  />
                </TabPanel>

                <TabPanel value={selectedTab} index={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Overall Insights
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Comprehensive AI insights combining risk assessment, document analysis, and application trends.
                      </Typography>
                    </CardContent>
                  </Card>
                </TabPanel>
              </Box>
            ) : (
              <Card>
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <BrainIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Select an Application
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose an application from the list to view AI insights and analysis.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AIInsightsPage;
