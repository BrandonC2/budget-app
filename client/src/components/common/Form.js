import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const Form = ({
  fields,
  onSubmit,
  validationSchema,
  submitButtonText = 'Submit',
  defaultValues = {},
  spacing = 2,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}
    >
      {fields.map((field) => (
        <Box key={field.name}>
          <TextField
            {...register(field.name)}
            label={field.label}
            type={field.type || 'text'}
            fullWidth
            error={!!errors[field.name]}
            helperText={errors[field.name]?.message}
            {...field.props}
          />
        </Box>
      ))}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        {submitButtonText}
      </Button>
    </Box>
  );
};

export default Form; 