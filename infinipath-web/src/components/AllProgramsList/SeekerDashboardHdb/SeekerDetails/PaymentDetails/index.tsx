import React from 'react';
import InfoCard from '../../InfoCard';

import TextField from '../../Common/TextField';
import SelectField from '../../Common/SelectDropdown';
import RadioGroup from '../../Common/RadioButtons';

import { paymentFields } from './Details';

interface PaymentDetailsCardProps {
  data: Record<string, string>;
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

const PaymentDetailsCard: React.FC<PaymentDetailsCardProps> = ({ data, isEditing, onChange }) => {
  return (
    <InfoCard title="Payment Details">
      {paymentFields.map((field) => {
        const rawValue = data[field.key] || '';
        const value = field.key === 'paidAmount' && !isEditing
          ? `₹${rawValue}`
          : rawValue;

        const commonProps = {
          label: field.label,
          value,
          onChange: (val: string) =>
            field.key === 'paidAmount'
              ? onChange(field.key, val.replace(/₹/, ''))
              : onChange(field.key, val),
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

export default PaymentDetailsCard;
