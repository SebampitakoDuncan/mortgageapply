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
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Application } from '../types';
import apiService from '../services/api';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Mock data - in real app, this would come from API
  const mockApplication: Application = {
    id: id || '1',
    userId: user?.id || '',
    applicationNumber: 'APP-2024-001',
    status: 'under_review',
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
    updatedAt: '2024-01-20T14:45:00Z',
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the API to get application from database
      if (!id) {
        setError('Application ID is required');
        return;
      }
      const response = await apiService.getApplicationById(id);
      
      if (response.success && response.data) {
        // Map database field names (snake_case) to frontend field names (camelCase)
        const dbData = response.data as any;
        const mappedApplication = {
          ...dbData,
          applicationNumber: dbData.application_number,
          personalInfo: dbData.personal_info,
          propertyDetails: dbData.property_details,
          loanInfo: dbData.loan_info,
          financialInfo: dbData.financial_info,
          riskScore: dbData.risk_score,
          createdAt: dbData.created_at,
          updatedAt: dbData.updated_at,
        };
        setApplication(mappedApplication);
      } else {
        // Fallback to mock data if API fails
        setApplication(mockApplication);
      }
    } catch (err) {
      setError('Failed to load application details');
      console.error('Error loading application:', err);
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
      month: 'long',
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

  if (error || !application) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Application not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/applications')}
        >
          Back to Applications
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/applications" underline="hover">
          Applications
        </Link>
        <Typography color="text.primary">
          {application.applicationNumber}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Application Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {application.applicationNumber} • {application.personalInfo?.firstName} {application.personalInfo?.lastName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={getStatusLabel(application.status)}
            color={getStatusColor(application.status) as any}
            size="medium"
          />
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/applications')}
          >
            Back
          </Button>
        </Box>
      </Box>

      {/* Application Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Application Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Loan Amount
              </Typography>
              <Typography variant="h6" color="primary">
                {application.loanInfo?.loanAmount && formatCurrency(application.loanInfo.loanAmount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Property Value
              </Typography>
              <Typography variant="h6">
                {application.propertyDetails?.purchasePrice && formatCurrency(application.propertyDetails.purchasePrice)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Risk Score
              </Typography>
              <Typography variant="h6" color={application.riskScore && application.riskScore > 80 ? 'success.main' : 'warning.main'}>
                {application.riskScore}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Submitted Date
              </Typography>
              <Typography variant="h6">
                {application.createdAt && formatDate(application.createdAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
        {/* Personal Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {application.personalInfo?.firstName} {application.personalInfo?.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {application.personalInfo?.email}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {application.personalInfo?.phone}
              </Typography>
              <Typography variant="body2">
                <strong>Date of Birth:</strong> {application.personalInfo?.dateOfBirth && new Date(application.personalInfo.dateOfBirth).toLocaleDateString('en-AU')}
              </Typography>
              <Typography variant="body2">
                <strong>Residency:</strong> {application.personalInfo?.residencyStatus?.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Employment:</strong> {application.personalInfo?.employmentStatus?.replace('_', ' ').toUpperCase()}
              </Typography>
              {application.personalInfo?.employerName && (
                <Typography variant="body2">
                  <strong>Employer:</strong> {application.personalInfo.employerName}
                </Typography>
              )}
              {application.personalInfo?.jobTitle && (
                <Typography variant="body2">
                  <strong>Job Title:</strong> {application.personalInfo.jobTitle}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Property Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Address:</strong> {application.propertyDetails?.address}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {application.propertyDetails?.suburb}, {application.propertyDetails?.state} {application.propertyDetails?.postcode}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {application.propertyDetails?.propertyType?.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Purpose:</strong> {application.propertyDetails?.purpose?.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Purchase Price:</strong> {application.propertyDetails?.purchasePrice && formatCurrency(application.propertyDetails.purchasePrice)}
              </Typography>
              {application.propertyDetails?.propertyValue && (
                <Typography variant="body2">
                  <strong>Property Value:</strong> {formatCurrency(application.propertyDetails.propertyValue)}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Loan Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Loan Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Loan Amount:</strong> {application.loanInfo?.loanAmount && formatCurrency(application.loanInfo.loanAmount)}
              </Typography>
              <Typography variant="body2">
                <strong>Down Payment:</strong> {application.loanInfo?.downPayment && formatCurrency(application.loanInfo.downPayment)}
              </Typography>
              <Typography variant="body2">
                <strong>Term:</strong> {application.loanInfo?.termYears} years
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {application.loanInfo?.loanType?.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Purpose:</strong> {application.loanInfo?.purpose?.replace('_', ' ').toUpperCase()}
              </Typography>
              {application.loanInfo?.interestRate && (
                <Typography variant="body2">
                  <strong>Interest Rate:</strong> {application.loanInfo.interestRate}%
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Financial Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Annual Income:</strong> {application.financialInfo?.annualIncome && formatCurrency(application.financialInfo.annualIncome)}
              </Typography>
              <Typography variant="body2">
                <strong>Monthly Income:</strong> {application.financialInfo?.monthlyIncome && formatCurrency(application.financialInfo.monthlyIncome)}
              </Typography>
              <Typography variant="body2">
                <strong>Monthly Expenses:</strong> {application.financialInfo?.monthlyExpenses && formatCurrency(application.financialInfo.monthlyExpenses)}
              </Typography>
              <Typography variant="body2">
                <strong>Assets:</strong> {application.financialInfo?.assets && formatCurrency(application.financialInfo.assets)}
              </Typography>
              <Typography variant="body2">
                <strong>Liabilities:</strong> {application.financialInfo?.liabilities && formatCurrency(application.financialInfo.liabilities)}
              </Typography>
              <Typography variant="body2">
                <strong>Existing Loans:</strong> {application.financialInfo?.existingLoans && formatCurrency(application.financialInfo.existingLoans)}
              </Typography>
              <Typography variant="body2">
                <strong>Credit Cards:</strong> {application.financialInfo?.creditCards && formatCurrency(application.financialInfo.creditCards)}
              </Typography>
              <Typography variant="body2">
                <strong>Other Debts:</strong> {application.financialInfo?.otherDebts && formatCurrency(application.financialInfo.otherDebts)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => alert('Download functionality would be implemented here')}
        >
          Download PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Print
        </Button>
      </Box>
    </Box>
  );
};

export default ApplicationDetail;
