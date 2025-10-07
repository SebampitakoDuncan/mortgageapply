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
  address: Yup.string()
    .min(10, 'Please provide a complete address')
    .required('Property address is required'),
  suburb: Yup.string()
    .min(2, 'Suburb must be at least 2 characters')
    .required('Suburb is required'),
  state: Yup.string()
    .oneOf(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'], 'Invalid state')
    .required('State is required'),
  postcode: Yup.string()
    .matches(/^\d{4}$/, 'Postcode must be 4 digits')
    .required('Postcode is required'),
  propertyType: Yup.string()
    .oneOf(['house', 'apartment', 'townhouse', 'unit'], 'Invalid property type')
    .required('Property type is required'),
  purchasePrice: Yup.number()
    .min(100000, 'Purchase price must be at least $100,000')
    .max(10000000, 'Purchase price cannot exceed $10,000,000')
    .required('Purchase price is required'),
  propertyValue: Yup.number()
    .min(100000, 'Property value must be at least $100,000')
    .max(10000000, 'Property value cannot exceed $10,000,000')
    .optional(),
  purpose: Yup.string()
    .oneOf(['owner-occupied', 'investment'], 'Invalid purpose')
    .required('Purpose is required'),
});

const PropertyDetailsStep: React.FC<FormStepProps> = ({ onNext, onBack, onDataChange, formData }) => {
  const formik = useFormik({
    initialValues: {
      address: formData?.propertyDetails?.address || '',
      suburb: formData?.propertyDetails?.suburb || '',
      state: formData?.propertyDetails?.state || '',
      postcode: formData?.propertyDetails?.postcode || '',
      propertyType: formData?.propertyDetails?.propertyType || '',
      purchasePrice: formData?.propertyDetails?.purchasePrice || '',
      propertyValue: formData?.propertyDetails?.propertyValue || '',
      purpose: formData?.propertyDetails?.purpose || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onDataChange({
        propertyDetails: {
          ...values,
          purchasePrice: Number(values.purchasePrice),
          propertyValue: values.propertyValue ? Number(values.propertyValue) : undefined,
        },
      });
      onNext();
    },
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Property Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tell us about the property you're looking to purchase or refinance.
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              fullWidth
              id="address"
              name="address"
              label="Property Address"
              placeholder="123 Main Street"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address ? String(formik.errors.address) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="suburb"
              name="suburb"
              label="Suburb"
              value={formik.values.suburb}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.suburb && Boolean(formik.errors.suburb)}
              helperText={formik.touched.suburb && formik.errors.suburb ? String(formik.errors.suburb) : ''}
            />
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                id="state"
                name="state"
                value={formik.values.state}
                label="State"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.state && Boolean(formik.errors.state)}
              >
                <MenuItem value="NSW">NSW</MenuItem>
                <MenuItem value="VIC">VIC</MenuItem>
                <MenuItem value="QLD">QLD</MenuItem>
                <MenuItem value="SA">SA</MenuItem>
                <MenuItem value="WA">WA</MenuItem>
                <MenuItem value="TAS">TAS</MenuItem>
                <MenuItem value="NT">NT</MenuItem>
                <MenuItem value="ACT">ACT</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              id="postcode"
              name="postcode"
              label="Postcode"
              value={formik.values.postcode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.postcode && Boolean(formik.errors.postcode)}
              helperText={formik.touched.postcode && formik.errors.postcode ? String(formik.errors.postcode) : ''}
            />
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="propertyType-label">Property Type</InputLabel>
              <Select
                labelId="propertyType-label"
                id="propertyType"
                name="propertyType"
                value={formik.values.propertyType}
                label="Property Type"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.propertyType && Boolean(formik.errors.propertyType)}
              >
                <MenuItem value="house">House</MenuItem>
                <MenuItem value="apartment">Apartment</MenuItem>
                <MenuItem value="townhouse">Townhouse</MenuItem>
                <MenuItem value="unit">Unit</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="purpose-label">Purpose</InputLabel>
              <Select
                labelId="purpose-label"
                id="purpose"
                name="purpose"
                value={formik.values.purpose}
                label="Purpose"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
              >
                <MenuItem value="owner-occupied">Owner Occupied</MenuItem>
                <MenuItem value="investment">Investment</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              id="purchasePrice"
              name="purchasePrice"
              label="Purchase Price"
              type="number"
              InputProps={{
                startAdornment: '$',
              }}
              value={formik.values.purchasePrice}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.purchasePrice && Boolean(formik.errors.purchasePrice)}
              helperText={formik.touched.purchasePrice && formik.errors.purchasePrice ? String(formik.errors.purchasePrice) : ''}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              id="propertyValue"
              name="propertyValue"
              label="Property Value (Optional)"
              type="number"
              InputProps={{
                startAdornment: '$',
              }}
              value={formik.values.propertyValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.propertyValue && Boolean(formik.errors.propertyValue)}
              helperText={formik.touched.propertyValue && formik.errors.propertyValue ? String(formik.errors.propertyValue) : ''}
            />
          </Box>
        </Box>

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
            Next: Loan Information
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PropertyDetailsStep;
