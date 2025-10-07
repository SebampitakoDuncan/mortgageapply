import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Application } from '../types';
import apiService from '../services/api';

const Applications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Mock data for demonstration
  const mockApplications: Application[] = [
    {
      id: '1',
      userId: user?.id || '',
      applicationNumber: 'APP-2024-001',
      status: 'submitted',
      personalInfo: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '0412345678',
        dateOfBirth: '1985-06-15',
        residencyStatus: 'citizen',
        employmentStatus: 'full-time',
        employerName: 'Tech Corp Australia',
        jobTitle: 'Software Engineer',
      },
      propertyDetails: {
        address: '123 Collins Street',
        suburb: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
        propertyType: 'apartment',
        purpose: 'owner-occupied',
        purchasePrice: 750000,
        propertyValue: 750000,
      },
      loanInfo: {
        loanAmount: 600000,
        downPayment: 150000,
        termYears: 25,
        loanType: 'variable',
        purpose: 'purchase',
        interestRate: 6.5,
      },
      financialInfo: {
        annualIncome: 120000,
        monthlyIncome: 10000,
        monthlyExpenses: 4000,
        assets: 200000,
        liabilities: 50000,
        existingLoans: 0,
        creditCards: 5000,
        otherDebts: 0,
      },
      riskScore: 85.5,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      userId: user?.id || '',
      applicationNumber: 'APP-2024-002',
      status: 'under_review',
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '0423456789',
        dateOfBirth: '1990-03-22',
        residencyStatus: 'permanent',
        employmentStatus: 'full-time',
        employerName: 'Finance Solutions Ltd',
        jobTitle: 'Senior Analyst',
      },
      propertyDetails: {
        address: '456 George Street',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        propertyType: 'house',
        purpose: 'investment',
        purchasePrice: 950000,
        propertyValue: 950000,
      },
      loanInfo: {
        loanAmount: 760000,
        downPayment: 190000,
        termYears: 30,
        loanType: 'fixed',
        purpose: 'purchase',
        interestRate: 6.2,
      },
      financialInfo: {
        annualIncome: 95000,
        monthlyIncome: 7917,
        monthlyExpenses: 3500,
        assets: 150000,
        liabilities: 30000,
        existingLoans: 0,
        creditCards: 3000,
        otherDebts: 0,
      },
      riskScore: 78.2,
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
    },
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call the API to get applications from database
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
      } else {
        // Fallback to mock data if API fails
        setApplications(mockApplications);
      }
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error loading applications:', err);
      // Fallback to mock data
      setApplications(mockApplications);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track the status of your mortgage applications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadApplications}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/application')}
          >
            New Application
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>
              No Applications Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't submitted any mortgage applications yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/application')}
            >
              Start New Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {applications.map((application) => (
            <Card key={application.id} sx={{ '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Application #{application.applicationNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                    <IconButton
                      onClick={() => navigate(`/applications/${application.id}`)}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Property
                    </Typography>
                    <Typography variant="body1">
                      {application.propertyDetails?.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.propertyDetails?.suburb}, {application.propertyDetails?.state} {application.propertyDetails?.postcode}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Loan Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {application.loanInfo?.loanAmount && formatCurrency(application.loanInfo.loanAmount)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Risk Score
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {application.riskScore}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Submitted
                    </Typography>
                    <Typography variant="body1">
                      {application.createdAt && formatDate(application.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {application.updatedAt && formatDate(application.updatedAt)}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/applications/${application.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Applications;
