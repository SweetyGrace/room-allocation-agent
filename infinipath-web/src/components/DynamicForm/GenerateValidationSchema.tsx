
import * as yup from 'yup';
import { DummyJSON } from '../../constants/urlConstants';
import { FormField } from '../../types/form';

export const generateValidationSchema = () => {
  const schema: { [key: string]: any } = {};

  const processFields = (fields: FormField[]) => {
    fields.forEach(field => {
      let fieldSchema: any;

      switch (field.type) {
        case 'text':
          fieldSchema = yup.string();
          break;
        case 'email':
          fieldSchema = yup.string().email('Invalid email address');
          break;
        case 'tel':
          fieldSchema = yup.string();
          break;
        case 'number':
          fieldSchema = yup.number();
          break;
        case 'date':
          fieldSchema = yup.date();
          break;
        case 'checkbox':
          fieldSchema = yup.boolean();
          break;
        default:
          fieldSchema = yup.string();
      }

      if (field.required) {
        fieldSchema = fieldSchema.required('This field is required');
      }

      if (field.validation?.pattern) {
        fieldSchema = fieldSchema.matches(
          new RegExp(field.validation.pattern),
          field.validation.message
        );
      }

      schema[field.id] = fieldSchema;

      // Process nested fields
      if (field.fields) {
        processFields(field.fields);
      }
    });
  };

  DummyJSON.sections.forEach(section => {
    processFields(section.fields);
  });

  return yup.object().shape(schema);
};