import React from 'react';
import InfoCard from '../../InfoCard/index';

import TextField from '../../Common/TextField';
import SelectField from '../../Common/SelectDropdown';
import RadioGroup from '../../Common/RadioButtons';

import { personalInfoFields } from './Details';

interface PersonalInfoCardProps {
  data: Record<string, string>;
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ data, isEditing, onChange }) => {

  return (
    <InfoCard title="Personal Information" >
      {personalInfoFields.map((field) => {
        const commonProps = {
          label: field.label,
          value: isEditing || field.key !== 'dob' ? data[field.key] : new Date(data[field.key]).toLocaleDateString(),
          onChange: (value: string) => onChange(field.key, value),
          disabled: !isEditing,
        };

        switch (field.type) {
          case 'text':
            return <TextField key={field.key} {...commonProps} />;
          case 'select':
            return field.options ? <SelectField key={field.key} options={field.options} {...commonProps} /> : null;
          case 'radio':
            return field.options ? <RadioGroup key={field.key} options={field.options} {...commonProps} /> : null;
          default:
            return null;
        }
      })}
    </InfoCard>
  );
};

export default PersonalInfoCard;
