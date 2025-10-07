import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Description,
  CheckCircle,
  Schedule,
  TrendingUp,
  AccountBalance,
  SmartToy,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Application } from '../types';
import apiService from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
      }
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length,
    approvedApplications: applications.filter(app => app.status === 'approved').length,
    totalLoanAmount: applications.reduce((sum, app) => sum + (app.loanInfo?.loanAmount || 0), 0),
  };

  // Get recent applications (last 3, sorted by creation date)
  const recentApplications = applications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(app => ({
      id: app.id,
      applicationNumber: app.applicationNumber,
      propertyAddress: `${app.propertyDetails?.address || ''}, ${app.propertyDetails?.suburb || ''} ${app.propertyDetails?.state || ''} ${app.propertyDetails?.postcode || ''}`.trim(),
      loanAmount: app.loanInfo?.loanAmount || 0,
      status: app.status,
      submittedDate: app.createdAt,
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'under_review':
        return 'warning';
      case 'draft':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'draft':
        return 'Draft';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
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
        <Button 
          onClick={loadApplications} 
          sx={{ 
            mt: 2,
            fontFamily: '"Inter", sans-serif'
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}
        >
          Welcome back, {user?.first_name}!
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontFamily: '"Inter", sans-serif' }}
        >
          Here's an overview of your mortgage applications and recent activity.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Description color="primary" sx={{ mr: 1 }} />
              <Typography 
                variant="h6"
                sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
              >
                Total Applications
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="primary"
              sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}
            >
              {stats.totalApplications}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule color="warning" sx={{ mr: 1 }} />
              <Typography 
                variant="h6"
                sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
              >
                Pending
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="warning.main"
              sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}
            >
              {stats.pendingApplications}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography 
                variant="h6"
                sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
              >
                Approved
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="success.main"
              sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}
            >
              {stats.approvedApplications}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="info" sx={{ mr: 1 }} />
              <Typography 
                variant="h6"
                sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
              >
                Total Loan Amount
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              color="info.main"
              sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}
            >
              ${stats.totalLoanAmount.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>


      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/application')}
                fullWidth
                sx={{ fontFamily: '"Inter", sans-serif' }}
              >
                New Application
              </Button>
              <Button
                variant="outlined"
                startIcon={<Description />}
                onClick={() => navigate('/applications')}
                fullWidth
                sx={{ fontFamily: '"Inter", sans-serif' }}
              >
                View All Applications
              </Button>
              <Button
                variant="outlined"
                startIcon={<AccountBalance />}
                onClick={() => navigate('/documents')}
                fullWidth
                sx={{ fontFamily: '"Inter", sans-serif' }}
              >
                Manage Documents
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardContent>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
            >
              Recent Applications
            </Typography>
            {recentApplications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontFamily: '"Inter", sans-serif' }}
                >
                  No applications found
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/application')}
                  size="small"
                  sx={{ fontFamily: '"Inter", sans-serif' }}
                >
                  Start New Application
                </Button>
              </Box>
            ) : (
              <List>
                {recentApplications.map((app, index) => (
                  <React.Fragment key={app.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Description color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="subtitle1"
                              sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
                            >
                              {app.applicationNumber}
                            </Typography>
                            <Chip
                              label={getStatusLabel(app.status)}
                              color={getStatusColor(app.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontFamily: '"Inter", sans-serif' }}
                            >
                              {app.propertyAddress}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontFamily: '"Inter", sans-serif' }}
                            >
                              Loan Amount: ${app.loanAmount.toLocaleString()}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontFamily: '"Inter", sans-serif' }}
                            >
                              Submitted: {new Date(app.submittedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        size="small"
                        onClick={() => navigate(`/applications/${app.id}`)}
                        sx={{ fontFamily: '"Inter", sans-serif' }}
                      >
                        View
                      </Button>
                    </ListItem>
                    {index < recentApplications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

    </Box>
  );
};

export default Dashboard;
