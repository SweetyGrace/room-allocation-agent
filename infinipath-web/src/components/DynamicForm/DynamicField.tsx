import React from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { FormField } from '../../types/form';
import { useFormContext } from 'react-hook-form';

interface DynamicFieldProps {
  field: FormField;
  parentValue?: string;
}

const DynamicField: React.FC<DynamicFieldProps> = ({ field, parentValue }) => {
  const { register, formState: { errors } } = useFormContext();

  // Check if field should be shown based on dependencies
  if (field.dependsOn && parentValue !== field.dependsOn.value) {
    return null;
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
    case 'date':
    case 'datetime-local':
    case 'time':
      return (
        <TextField
          {...register(field.id)}
          label={field.label}
          type={field.type}
          fullWidth
          margin="normal"
          required={field.required}
          placeholder={field.placeholder}
          error={!!errors[field.id]}
          helperText={errors[field.id]?.message as string}
        />
      );

    case 'textarea':
      return (
        <TextField
          {...register(field.id)}
          label={field.label}
          multiline
          rows={field.rows || 4}
          fullWidth
          margin="normal"
          required={field.required}
          placeholder={field.placeholder}
          error={!!errors[field.id]}
          helperText={errors[field.id]?.message as string}
        />
      );

    case 'radio':
      return (
        <FormControl component="fieldset" margin="normal" required={field.required}>
          <FormLabel component="legend">{field.label}</FormLabel>
          <RadioGroup>
            {field.options?.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio {...register(field.id)} />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              {...register(field.id)}
              required={field.required}
            />
          }
          label={field.label}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth margin="normal" required={field.required}>
          <InputLabel>{field.label}</InputLabel>
          <Select {...register(field.id)} label={field.label}>
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    default:
      return null;
  }
};

export default DynamicField;