import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { FormSection } from '../../types/form';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { generateValidationSchema } from './GenerateValidationSchema';
import DynamicField from './DynamicField';
import { DummyJSON } from '../../constants/urlConstants';

const DynamicForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = DummyJSON.sections.map(section => section.title);

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(generateValidationSchema())
  });

  const { handleSubmit, watch } = methods;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = (data: any) => {
  };

  const renderSection = (section: FormSection) => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {section.title}
        </Typography>
        {section.fields.map((field) => (
          <DynamicField
            key={field.id}
            field={field}
            parentValue={field.dependsOn ? watch(field.dependsOn.field) : undefined}
          />
        ))}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        {DummyJSON.formTitle}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderSection(DummyJSON.sections[activeStep])}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                Submit
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </form>
      </FormProvider>
    </Paper>
  );
};

export default DynamicForm;