import React from 'react';
import { FileText } from 'lucide-react';
import InfoCard from '../../InfoCard';

import TextField from '../../Common/TextField';
import SelectField from '../../Common/SelectDropdown';
import RadioGroup from '../../Common/RadioButtons';

import { invoiceFields } from './Details';

interface InvoiceDetailsCardProps {
  invoiceDetails: Record<string, string>;
  isEditing: boolean;
  onChange: (section: string, key: string, value: string) => void;
}

const InvoiceDetailsCard: React.FC<InvoiceDetailsCardProps> = ({ invoiceDetails, isEditing, onChange }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <InfoCard title="Invoice Information" icon={<FileText size={20} />}>
      {invoiceFields.map((field) => {
        const rawValue = invoiceDetails[field.key] || '';
        const value =
          field.key === 'invoiceAmount' && !isEditing
            ? `₹${rawValue}`
            : field.key === 'invoiceDate' && !isEditing
            ? formatDate(rawValue)
            : rawValue;

        const commonProps = {
          label: field.label,
          value,
          onChange: (val: string) =>
            onChange('invoiceDetails', field.key, field.key === 'invoiceAmount' ? val.replace(/₹/, '') : val),
          disabled: !isEditing,
        };

        switch (field.type) {
          case 'text':
            return <TextField key={field.key} {...commonProps} placeholder={field.key === 'invoiceDate' ? 'YYYY-MM-DD or DD/MM/YYYY' : ''} />;
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

export default InvoiceDetailsCard;
