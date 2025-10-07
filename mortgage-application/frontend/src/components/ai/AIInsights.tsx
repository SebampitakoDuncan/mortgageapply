import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Button,
  Collapse,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DocumentScanner as DocumentIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import apiService from '../../services/api';

interface AIInsightsProps {
  applicationId: string;
  documents?: any[];
  showOnlyDocuments?: boolean;
}

interface RiskAssessment {
  overall_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: Array<{
    factor_name: string;
    score: number;
    description: string;
    impact: string;
  }>;
  recommendations: string[];
  approval_probability: number;
  conditions: string[];
}

interface DocumentAnalysis {
  confidence_score: number;
  verification_status: string;
  extracted_data: any;
  ai_insights: string[];
  requires_human_review: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ applicationId, documents = [], showOnlyDocuments = false }) => {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [documentAnalyses, setDocumentAnalyses] = useState<DocumentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    risk: true,
    documents: false,
    recommendations: false,
  });

  useEffect(() => {
    loadAIInsights();
  }, [applicationId]);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      setError('');

      // Load risk assessment only if not showing only documents
      if (!showOnlyDocuments) {
        try {
          const riskResponse = await apiService.getRiskAssessment(applicationId);
          if (riskResponse.success && riskResponse.data) {
            setRiskAssessment(riskResponse.data);
          }
        } catch (err) {
          console.warn('Risk assessment not available:', err);
        }
      }

      // Load document analyses from documents
      const analyses: DocumentAnalysis[] = [];
      for (const doc of documents) {
        if (doc.ai_analysis) {
          analyses.push(doc.ai_analysis);
        }
      }
      setDocumentAnalyses(analyses);

    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setError('Failed to load AI insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckIcon />;
      case 'medium': return <WarningIcon />;
      case 'high': return <WarningIcon />;
      case 'critical': return <ErrorIcon />;
      default: return <AssessmentIcon />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <BrainIcon color="primary" />
            <Typography variant="h6">AI Insights</Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading AI analysis...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={loadAIInsights}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BrainIcon color="primary" />
            <Typography variant="h6">AI Insights</Typography>
            <Chip 
              label="Powered by AI" 
              color="primary" 
              size="small" 
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      {!showOnlyDocuments && riskAssessment && (
        <Card>
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection('risk')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">Risk Assessment</Typography>
                <Chip 
                  label={riskAssessment.risk_level?.toUpperCase() || 'UNKNOWN'} 
                  color={getRiskColor(riskAssessment.risk_level || 'unknown')}
                  icon={getRiskIcon(riskAssessment.risk_level || 'unknown')}
                />
              </Box>
              {expandedSections.risk ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={expandedSections.risk}>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {Math.round((riskAssessment.approval_probability || 0) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approval Probability
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {Math.round((riskAssessment.overall_risk_score || 0) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Risk Score
                    </Typography>
                  </Paper>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Risk Factors
                </Typography>
                <List dense>
                  {(riskAssessment.risk_factors || []).map((factor, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingUpIcon color={factor.score > 0.5 ? 'error' : 'success'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={factor.factor_name}
                        secondary={factor.description}
                      />
                      <Chip 
                        label={`${Math.round((factor.score || 0) * 100)}%`}
                        color={(factor.score || 0) > 0.5 ? 'error' : 'success'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Document Analysis */}
      {documentAnalyses.length > 0 && (
        <Card>
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection('documents')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DocumentIcon color="primary" />
                <Typography variant="h6">Document Analysis</Typography>
                <Chip 
                  label={`${documentAnalyses.length} documents`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>
              {expandedSections.documents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={expandedSections.documents}>
              <Box sx={{ mt: 2 }}>
                {documentAnalyses.map((analysis, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">Document {index + 1}</Typography>
                      <Chip 
                        label={`${Math.round((analysis.confidence_score || 0) * 100)}% confidence`}
                        color={(analysis.confidence_score || 0) > 0.7 ? 'success' : 'warning'}
                        size="small"
                      />
                      <Chip 
                        label={analysis.verification_status || 'unknown'}
                        color={analysis.verification_status === 'verified' ? 'success' : 'warning'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Extracted Text from PDF */}
                    {analysis.extracted_data && analysis.extracted_data.raw_text && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          📄 Extracted Text (via pdfplumber):
                        </Typography>
                        <Box sx={{ 
                          maxHeight: 200, 
                          overflow: 'auto', 
                          bgcolor: 'grey.50', 
                          p: 2, 
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          lineHeight: 1.4
                        }}>
                          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                            {analysis.extracted_data.raw_text.length > 1000 
                              ? analysis.extracted_data.raw_text.substring(0, 1000) + '...' 
                              : analysis.extracted_data.raw_text}
                          </Typography>
                        </Box>
                        {analysis.extracted_data.raw_text.length > 1000 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Showing first 1000 characters of {analysis.extracted_data.raw_text.length} total characters
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Structured Data */}
                    {analysis.extracted_data && analysis.extracted_data.fields && Object.keys(analysis.extracted_data.fields).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          📊 Structured Data Extracted:
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                          {Object.entries(analysis.extracted_data.fields).map(([key, value]) => (
                            <Box key={key}>
                              <Typography variant="caption" color="text.secondary">
                                {key.replace(/_/g, ' ').toUpperCase()}:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {String(value)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* LLM Analysis */}
                    {analysis.ai_insights && analysis.ai_insights.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <BrainIcon color="primary" />
                          <Typography variant="subtitle2" fontWeight="bold">
                            🏦 Expert Underwriter Analysis (LLM):
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                          Analysis by AI expert underwriter for Australian mortgage applications
                        </Typography>
                        <List dense>
                          {(analysis.ai_insights || []).map((insight, insightIndex) => (
                            <ListItem key={insightIndex} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <BrainIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={insight}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {analysis.requires_human_review && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        This document requires human review
                      </Alert>
                    )}
                  </Paper>
                ))}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {!showOnlyDocuments && riskAssessment && (riskAssessment.recommendations || []).length > 0 && (
        <Card>
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection('recommendations')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6">AI Recommendations</Typography>
                <Chip 
                  label={`${(riskAssessment.recommendations || []).length} recommendations`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>
              {expandedSections.recommendations ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={expandedSections.recommendations}>
              <Box sx={{ mt: 2 }}>
                <List>
                  {(riskAssessment.recommendations || []).map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* No AI Data */}
      {!showOnlyDocuments && !riskAssessment && documentAnalyses.length === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BrainIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No AI Analysis Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI insights will appear here once your application is processed and documents are analyzed.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* No Document Analysis */}
      {showOnlyDocuments && documentAnalyses.length === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Document Analysis Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered document analysis will appear here once documents are uploaded and processed.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AIInsights;
