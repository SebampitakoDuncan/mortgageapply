import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormStepProps } from '../../types';

const validationSchema = Yup.object({
  annualIncome: Yup.number()
    .min(30000, 'Annual income must be at least $30,000')
    .max(5000000, 'Annual income cannot exceed $5,000,000')
    .required('Annual income is required'),
  monthlyIncome: Yup.number()
    .min(2500, 'Monthly income must be at least $2,500')
    .max(400000, 'Monthly income cannot exceed $400,000')
    .required('Monthly income is required'),
  monthlyExpenses: Yup.number()
    .min(0, 'Monthly expenses cannot be negative')
    .max(200000, 'Monthly expenses cannot exceed $200,000')
    .required('Monthly expenses is required'),
  assets: Yup.number()
    .min(0, 'Assets cannot be negative')
    .max(50000000, 'Assets cannot exceed $50,000,000')
    .required('Assets is required'),
  liabilities: Yup.number()
    .min(0, 'Liabilities cannot be negative')
    .max(10000000, 'Liabilities cannot exceed $10,000,000')
    .required('Liabilities is required'),
  existingLoans: Yup.number()
    .min(0, 'Existing loans cannot be negative')
    .max(5000000, 'Existing loans cannot exceed $5,000,000')
    .required('Existing loans is required'),
  creditCards: Yup.number()
    .min(0, 'Credit card debt cannot be negative')
    .max(500000, 'Credit card debt cannot exceed $500,000')
    .required('Credit card debt is required'),
  otherDebts: Yup.number()
    .min(0, 'Other debts cannot be negative')
    .max(2000000, 'Other debts cannot exceed $2,000,000')
    .required('Other debts is required'),
});

const FinancialInfoStep: React.FC<FormStepProps> = ({ onNext, onBack, onDataChange, formData }) => {
  const formik = useFormik({
    initialValues: {
      annualIncome: formData?.financialInfo?.annualIncome || '',
      monthlyIncome: formData?.financialInfo?.monthlyIncome || '',
      monthlyExpenses: formData?.financialInfo?.monthlyExpenses || '',
      assets: formData?.financialInfo?.assets || '',
      liabilities: formData?.financialInfo?.liabilities || '',
      existingLoans: formData?.financialInfo?.existingLoans || '',
      creditCards: formData?.financialInfo?.creditCards || '',
      otherDebts: formData?.financialInfo?.otherDebts || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onDataChange({
        financialInfo: {
          ...values,
          annualIncome: Number(values.annualIncome),
          monthlyIncome: Number(values.monthlyIncome),
          monthlyExpenses: Number(values.monthlyExpenses),
          assets: Number(values.assets),
          liabilities: Number(values.liabilities),
          existingLoans: Number(values.existingLoans),
          creditCards: Number(values.creditCards),
          otherDebts: Number(values.otherDebts),
        },
      });
      onNext();
    },
  });

  // Calculate debt-to-income ratio
  const monthlyIncome = Number(formik.values.monthlyIncome) || 0;
  const monthlyExpenses = Number(formik.values.monthlyExpenses) || 0;
  const existingLoans = Number(formik.values.existingLoans) || 0;
  const creditCards = Number(formik.values.creditCards) || 0;
  const otherDebts = Number(formik.values.otherDebts) || 0;
  
  const totalMonthlyDebt = monthlyExpenses + (existingLoans / 12) + (creditCards / 12) + (otherDebts / 12);
  const dti = monthlyIncome > 0 ? ((totalMonthlyDebt / monthlyIncome) * 100).toFixed(1) : 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Financial Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide your financial details to help us assess your loan application.
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
              Income Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              <TextField
                fullWidth
                id="annualIncome"
                name="annualIncome"
                label="Annual Income"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.annualIncome}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.annualIncome && Boolean(formik.errors.annualIncome)}
                helperText={formik.touched.annualIncome && formik.errors.annualIncome ? String(formik.errors.annualIncome) : ''}
              />
              <TextField
                fullWidth
                id="monthlyIncome"
                name="monthlyIncome"
                label="Monthly Income"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.monthlyIncome}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.monthlyIncome && Boolean(formik.errors.monthlyIncome)}
                helperText={formik.touched.monthlyIncome && formik.errors.monthlyIncome ? String(formik.errors.monthlyIncome) : ''}
              />
              <TextField
                fullWidth
                id="monthlyExpenses"
                name="monthlyExpenses"
                label="Monthly Living Expenses"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.monthlyExpenses}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.monthlyExpenses && Boolean(formik.errors.monthlyExpenses)}
                helperText={formik.touched.monthlyExpenses && formik.errors.monthlyExpenses ? String(formik.errors.monthlyExpenses) : ''}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
              Assets & Liabilities
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              <TextField
                fullWidth
                id="assets"
                name="assets"
                label="Total Assets"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.assets}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.assets && Boolean(formik.errors.assets)}
                helperText={formik.touched.assets && formik.errors.assets ? String(formik.errors.assets) : ''}
              />
              <TextField
                fullWidth
                id="liabilities"
                name="liabilities"
                label="Total Liabilities"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.liabilities}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.liabilities && Boolean(formik.errors.liabilities)}
                helperText={formik.touched.liabilities && formik.errors.liabilities ? String(formik.errors.liabilities) : ''}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
              Existing Debts
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              <TextField
                fullWidth
                id="existingLoans"
                name="existingLoans"
                label="Existing Loans (Annual)"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.existingLoans}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.existingLoans && Boolean(formik.errors.existingLoans)}
                helperText={formik.touched.existingLoans && formik.errors.existingLoans ? String(formik.errors.existingLoans) : ''}
              />
              <TextField
                fullWidth
                id="creditCards"
                name="creditCards"
                label="Credit Card Debt (Annual)"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.creditCards}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.creditCards && Boolean(formik.errors.creditCards)}
                helperText={formik.touched.creditCards && formik.errors.creditCards ? String(formik.errors.creditCards) : ''}
              />
              <TextField
                fullWidth
                id="otherDebts"
                name="otherDebts"
                label="Other Debts (Annual)"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                value={formik.values.otherDebts}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.otherDebts && Boolean(formik.errors.otherDebts)}
                helperText={formik.touched.otherDebts && formik.errors.otherDebts ? String(formik.errors.otherDebts) : ''}
              />
            </Box>
          </Box>
        </Box>

        {/* Debt-to-Income Ratio Display */}
        {monthlyIncome > 0 && (
          <Box sx={{ mt: 3 }}>
            <Alert severity={Number(dti) > 40 ? "warning" : "info"}>
              <Typography variant="body2">
                <strong>Debt-to-Income Ratio (DTI):</strong> {dti}%
                {Number(dti) > 40 && (
                  <span style={{ color: '#d32f2f', marginLeft: '8px' }}>
                    (High DTI - may affect loan approval)
                  </span>
                )}
              </Typography>
            </Alert>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            size="large"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
          >
            Next: Review & Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default FinancialInfoStep;
