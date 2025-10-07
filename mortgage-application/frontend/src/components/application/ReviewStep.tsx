import React from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Application } from '../../types';

interface ReviewStepProps {
  onBack: () => void;
  onSubmit: () => void;
  formData: Partial<Application>;
  loading: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onBack, onSubmit, formData, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU');
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Application
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please review all the information below before submitting your mortgage application.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
        {/* Personal Information */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.personalInfo?.firstName} {formData.personalInfo?.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {formData.personalInfo?.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {formData.personalInfo?.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Date of Birth:</strong> {formData.personalInfo?.dateOfBirth && formatDate(formData.personalInfo.dateOfBirth)}
                </Typography>
                <Typography variant="body2">
                  <strong>Residency:</strong> {formData.personalInfo?.residencyStatus?.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  <strong>Employment:</strong> {formData.personalInfo?.employmentStatus?.replace('_', ' ').toUpperCase()}
                </Typography>
                {formData.personalInfo?.employerName && (
                  <Typography variant="body2">
                    <strong>Employer:</strong> {formData.personalInfo.employerName}
                  </Typography>
                )}
                {formData.personalInfo?.jobTitle && (
                  <Typography variant="body2">
                    <strong>Job Title:</strong> {formData.personalInfo.jobTitle}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Property Details */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Address:</strong> {formData.propertyDetails?.address}
                </Typography>
                <Typography variant="body2">
                  <strong>Suburb:</strong> {formData.propertyDetails?.suburb}, {formData.propertyDetails?.state} {formData.propertyDetails?.postcode}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {formData.propertyDetails?.propertyType?.toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  <strong>Purpose:</strong> {formData.propertyDetails?.purpose?.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  <strong>Purchase Price:</strong> {formData.propertyDetails?.purchasePrice && formatCurrency(formData.propertyDetails.purchasePrice)}
                </Typography>
                {formData.propertyDetails?.propertyValue && (
                  <Typography variant="body2">
                    <strong>Property Value:</strong> {formatCurrency(formData.propertyDetails.propertyValue)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Loan Information */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Loan Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Loan Amount:</strong> {formData.loanInfo?.loanAmount && formatCurrency(formData.loanInfo.loanAmount)}
                </Typography>
                <Typography variant="body2">
                  <strong>Down Payment:</strong> {formData.loanInfo?.downPayment && formatCurrency(formData.loanInfo.downPayment)}
                </Typography>
                <Typography variant="body2">
                  <strong>Term:</strong> {formData.loanInfo?.termYears} years
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {formData.loanInfo?.loanType?.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  <strong>Purpose:</strong> {formData.loanInfo?.purpose?.replace('_', ' ').toUpperCase()}
                </Typography>
                {formData.loanInfo?.interestRate && (
                  <Typography variant="body2">
                    <strong>Interest Rate:</strong> {formData.loanInfo.interestRate}%
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Financial Information */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Annual Income:</strong> {formData.financialInfo?.annualIncome && formatCurrency(formData.financialInfo.annualIncome)}
                </Typography>
                <Typography variant="body2">
                  <strong>Monthly Income:</strong> {formData.financialInfo?.monthlyIncome && formatCurrency(formData.financialInfo.monthlyIncome)}
                </Typography>
                <Typography variant="body2">
                  <strong>Monthly Expenses:</strong> {formData.financialInfo?.monthlyExpenses && formatCurrency(formData.financialInfo.monthlyExpenses)}
                </Typography>
                <Typography variant="body2">
                  <strong>Assets:</strong> {formData.financialInfo?.assets && formatCurrency(formData.financialInfo.assets)}
                </Typography>
                <Typography variant="body2">
                  <strong>Liabilities:</strong> {formData.financialInfo?.liabilities && formatCurrency(formData.financialInfo.liabilities)}
                </Typography>
                <Typography variant="body2">
                  <strong>Existing Loans:</strong> {formData.financialInfo?.existingLoans && formatCurrency(formData.financialInfo.existingLoans)}
                </Typography>
                <Typography variant="body2">
                  <strong>Credit Cards:</strong> {formData.financialInfo?.creditCards && formatCurrency(formData.financialInfo.creditCards)}
                </Typography>
                <Typography variant="body2">
                  <strong>Other Debts:</strong> {formData.financialInfo?.otherDebts && formatCurrency(formData.financialInfo.otherDebts)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Application Status */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Application Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your application will be submitted for review once you click submit.
                  </Typography>
                </Box>
                <Chip
                  label={formData.status?.toUpperCase() || 'DRAFT'}
                  color={getStatusColor(formData.status || 'draft') as any}
                  size="medium"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> By submitting this application, you confirm that all information provided is accurate and complete. 
          You understand that providing false information may result in the rejection of your application.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          size="large"
          disabled={loading}
          sx={{ minWidth: 150 }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Submitting...
            </Box>
          ) : (
            'Submit Application'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewStep;
