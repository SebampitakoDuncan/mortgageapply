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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormStepProps } from '../../types';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .required('Phone number is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  residencyStatus: Yup.string()
    .oneOf(['citizen', 'permanent', 'temporary'], 'Invalid residency status')
    .required('Residency status is required'),
  employmentStatus: Yup.string()
    .oneOf(['full-time', 'part-time', 'casual', 'self-employed', 'unemployed'], 'Invalid employment status')
    .required('Employment status is required'),
  employerName: Yup.string()
    .when('employmentStatus', {
      is: (status: string) => ['full-time', 'part-time', 'casual'].includes(status),
      then: (schema) => schema.required('Employer name is required'),
      otherwise: (schema) => schema.optional(),
    }),
  jobTitle: Yup.string()
    .when('employmentStatus', {
      is: (status: string) => ['full-time', 'part-time', 'casual'].includes(status),
      then: (schema) => schema.required('Job title is required'),
      otherwise: (schema) => schema.optional(),
    }),
});

const PersonalInfoStep: React.FC<FormStepProps> = ({ onNext, onDataChange, formData }) => {
  const formik = useFormik({
    initialValues: {
      firstName: formData?.personalInfo?.firstName || '',
      lastName: formData?.personalInfo?.lastName || '',
      email: formData?.personalInfo?.email || '',
      phone: formData?.personalInfo?.phone || '',
      dateOfBirth: formData?.personalInfo?.dateOfBirth || '',
      residencyStatus: formData?.personalInfo?.residencyStatus || '',
      employmentStatus: formData?.personalInfo?.employmentStatus || '',
      employerName: formData?.personalInfo?.employerName || '',
      jobTitle: formData?.personalInfo?.jobTitle || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onDataChange({
        personalInfo: values,
      });
      onNext();
    },
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please provide your personal details and employment information.
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box>
            <TextField
              fullWidth
              id="firstName"
              name="firstName"
              label="First Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName ? String(formik.errors.firstName) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="lastName"
              name="lastName"
              label="Last Name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName ? String(formik.errors.lastName) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email ? String(formik.errors.email) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              type="tel"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone ? String(formik.errors.phone) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="dateOfBirth"
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
              helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? String(formik.errors.dateOfBirth) : ''}
            />
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="residencyStatus-label">Residency Status</InputLabel>
              <Select
                labelId="residencyStatus-label"
                id="residencyStatus"
                name="residencyStatus"
                value={formik.values.residencyStatus}
                label="Residency Status"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.residencyStatus && Boolean(formik.errors.residencyStatus)}
              >
                <MenuItem value="citizen">Australian Citizen</MenuItem>
                <MenuItem value="permanent">Permanent Resident</MenuItem>
                <MenuItem value="temporary">Temporary Resident</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="employmentStatus-label">Employment Status</InputLabel>
              <Select
                labelId="employmentStatus-label"
                id="employmentStatus"
                name="employmentStatus"
                value={formik.values.employmentStatus}
                label="Employment Status"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.employmentStatus && Boolean(formik.errors.employmentStatus)}
              >
                <MenuItem value="full-time">Full-time</MenuItem>
                <MenuItem value="part-time">Part-time</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="self-employed">Self-employed</MenuItem>
                <MenuItem value="unemployed">Unemployed</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {['full-time', 'part-time', 'casual'].includes(formik.values.employmentStatus) && (
            <>
              <Box>
                <TextField
                  fullWidth
                  id="employerName"
                  name="employerName"
                  label="Employer Name"
                  value={formik.values.employerName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.employerName && Boolean(formik.errors.employerName)}
                  helperText={formik.touched.employerName && formik.errors.employerName ? String(formik.errors.employerName) : ''}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  id="jobTitle"
                  name="jobTitle"
                  label="Job Title"
                  value={formik.values.jobTitle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.jobTitle && Boolean(formik.errors.jobTitle)}
                  helperText={formik.touched.jobTitle && formik.errors.jobTitle ? String(formik.errors.jobTitle) : ''}
                />
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
          >
            Next: Property Details
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PersonalInfoStep;
