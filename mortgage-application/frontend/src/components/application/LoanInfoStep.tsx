import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormStepProps } from '../../types';

const validationSchema = Yup.object({
  loanAmount: Yup.number()
    .min(50000, 'Loan amount must be at least $50,000')
    .max(5000000, 'Loan amount cannot exceed $5,000,000')
    .required('Loan amount is required'),
  downPayment: Yup.number()
    .min(0, 'Down payment cannot be negative')
    .required('Down payment is required'),
  termYears: Yup.number()
    .min(1, 'Loan term must be at least 1 year')
    .max(30, 'Loan term cannot exceed 30 years')
    .required('Loan term is required'),
  loanType: Yup.string()
    .oneOf(['variable', 'fixed', 'split'], 'Invalid loan type')
    .required('Loan type is required'),
  purpose: Yup.string()
    .oneOf(['purchase', 'refinance', 'cash_out'], 'Invalid purpose')
    .required('Purpose is required'),
  interestRate: Yup.number()
    .min(0, 'Interest rate cannot be negative')
    .max(20, 'Interest rate cannot exceed 20%')
    .optional(),
});

const LoanInfoStep: React.FC<FormStepProps> = ({ onNext, onBack, onDataChange, formData }) => {
  const formik = useFormik({
    initialValues: {
      loanAmount: formData?.loanInfo?.loanAmount || '',
      downPayment: formData?.loanInfo?.downPayment || '',
      termYears: formData?.loanInfo?.termYears || '',
      loanType: formData?.loanInfo?.loanType || '',
      purpose: formData?.loanInfo?.purpose || '',
      interestRate: formData?.loanInfo?.interestRate || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onDataChange({
        loanInfo: {
          ...values,
          loanAmount: Number(values.loanAmount),
          downPayment: Number(values.downPayment),
          termYears: Number(values.termYears),
          interestRate: values.interestRate ? Number(values.interestRate) : undefined,
        },
      });
      onNext();
    },
  });

  // Calculate loan-to-value ratio
  const purchasePrice = formData?.propertyDetails?.purchasePrice || 0;
  const loanAmount = Number(formik.values.loanAmount) || 0;
  const downPayment = Number(formik.values.downPayment) || 0;
  const lvr = purchasePrice > 0 ? ((loanAmount / purchasePrice) * 100).toFixed(1) : 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Loan Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide details about your loan requirements and preferences.
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box>
            <TextField
              fullWidth
              id="loanAmount"
              name="loanAmount"
              label="Loan Amount"
              type="number"
              InputProps={{
                startAdornment: '$',
              }}
              value={formik.values.loanAmount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.loanAmount && Boolean(formik.errors.loanAmount)}
              helperText={formik.touched.loanAmount && formik.errors.loanAmount ? String(formik.errors.loanAmount) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="downPayment"
              name="downPayment"
              label="Down Payment"
              type="number"
              InputProps={{
                startAdornment: '$',
              }}
              value={formik.values.downPayment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.downPayment && Boolean(formik.errors.downPayment)}
              helperText={formik.touched.downPayment && formik.errors.downPayment ? String(formik.errors.downPayment) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="termYears"
              name="termYears"
              label="Loan Term (Years)"
              type="number"
              value={formik.values.termYears}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.termYears && Boolean(formik.errors.termYears)}
              helperText={formik.touched.termYears && formik.errors.termYears ? String(formik.errors.termYears) : ''}
            />
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="loanType-label">Loan Type</InputLabel>
              <Select
                labelId="loanType-label"
                id="loanType"
                name="loanType"
                value={formik.values.loanType}
                label="Loan Type"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.loanType && Boolean(formik.errors.loanType)}
              >
                <MenuItem value="variable">Variable Rate</MenuItem>
                <MenuItem value="fixed">Fixed Rate</MenuItem>
                <MenuItem value="split">Split Loan</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="purpose-label">Loan Purpose</InputLabel>
              <Select
                labelId="purpose-label"
                id="purpose"
                name="purpose"
                value={formik.values.purpose}
                label="Loan Purpose"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
              >
                <MenuItem value="purchase">Purchase</MenuItem>
                <MenuItem value="refinance">Refinance</MenuItem>
                <MenuItem value="cash_out">Cash Out</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              id="interestRate"
              name="interestRate"
              label="Preferred Interest Rate (%)"
              type="number"
              value={formik.values.interestRate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.interestRate && Boolean(formik.errors.interestRate)}
              helperText={formik.touched.interestRate && formik.errors.interestRate ? String(formik.errors.interestRate) : "Optional - we'll find the best rate for you"}
            />
          </Box>
        </Box>

        {/* Loan-to-Value Ratio Display */}
        {purchasePrice > 0 && loanAmount > 0 && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Loan-to-Value Ratio (LVR):</strong> {lvr}%
                {Number(lvr) > 80 && (
                  <span style={{ color: '#d32f2f', marginLeft: '8px' }}>
                    (LMI may be required)
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
            Next: Financial Information
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoanInfoStep;
