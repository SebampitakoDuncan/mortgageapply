import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import PersonalInfoStep from '../components/application/PersonalInfoStep';
import PropertyDetailsStep from '../components/application/PropertyDetailsStep';
import LoanInfoStep from '../components/application/LoanInfoStep';
import FinancialInfoStep from '../components/application/FinancialInfoStep';
import ReviewStep from '../components/application/ReviewStep';
import { Application } from '../types';

const steps = [
  'Personal Information',
  'Property Details',
  'Loan Information',
  'Financial Information',
  'Review & Submit',
];

const ApplicationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [applicationData, setApplicationData] = useState<Partial<Application>>({
    userId: user?.id,
    status: 'draft',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDataChange = (stepData: any) => {
    setApplicationData((prev) => ({
      ...prev,
      ...stepData,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Generate application number
      const applicationNumber = `APP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      // Calculate risk score (simplified calculation)
      const monthlyIncome = applicationData.financialInfo?.monthlyIncome || 0;
      const monthlyExpenses = applicationData.financialInfo?.monthlyExpenses || 0;
      const existingLoans = applicationData.financialInfo?.existingLoans || 0;
      const creditCards = applicationData.financialInfo?.creditCards || 0;
      const otherDebts = applicationData.financialInfo?.otherDebts || 0;
      
      const totalMonthlyDebt = monthlyExpenses + (existingLoans / 12) + (creditCards / 12) + (otherDebts / 12);
      const dti = monthlyIncome > 0 ? (totalMonthlyDebt / monthlyIncome) * 100 : 0;
      
      // Simple risk score calculation (higher is better)
      let riskScore = 100;
      if (dti > 40) riskScore -= 20;
      if (dti > 30) riskScore -= 10;
      if (monthlyIncome < 5000) riskScore -= 15;
      if (applicationData.financialInfo?.assets && applicationData.financialInfo.assets < 50000) riskScore -= 10;
      
      const completeApplication = {
        ...applicationData,
        applicationNumber,
        status: 'submitted' as const,
        riskScore: Math.max(0, Math.min(100, riskScore)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Call the API to submit the application to database
      const response = await apiService.createApplication(completeApplication);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to submit application');
      }
      
      // Show success message
      alert(`Application submitted successfully!\nApplication Number: ${applicationNumber}\nRisk Score: ${riskScore.toFixed(1)}%`);
      
      // Redirect to applications list
      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PersonalInfoStep
            onNext={handleNext}
            onDataChange={handleDataChange}
            formData={applicationData}
          />
        );
      case 1:
        return (
          <PropertyDetailsStep
            onNext={handleNext}
            onBack={handleBack}
            onDataChange={handleDataChange}
            formData={applicationData}
          />
        );
      case 2:
        return (
          <LoanInfoStep
            onNext={handleNext}
            onBack={handleBack}
            onDataChange={handleDataChange}
            formData={applicationData}
          />
        );
      case 3:
        return (
          <FinancialInfoStep
            onNext={handleNext}
            onBack={handleBack}
            onDataChange={handleDataChange}
            formData={applicationData}
          />
        );
      case 4:
        return (
          <ReviewStep
            onBack={handleBack}
            onSubmit={handleSubmit}
            formData={applicationData}
            loading={loading}
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mortgage Application
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete your mortgage application in a few simple steps
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApplicationPage;
