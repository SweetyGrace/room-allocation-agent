import React from 'react';
import { FileText, User, CreditCard, Shirt } from 'lucide-react';
import styles from './index.module.scss';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  accept?: string;
}

interface TravelDetailsProps {
  data: {
    idType?: string;
    idNumber?: string;
    idPicture?: string;
    yourPicture?: string;
    tshirtSize?: string;
    [key: string]: any;
  };
  fields: Field[];
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
}

const TravelDetailsCard: React.FC<TravelDetailsProps> = ({
  data,
  fields,
  isEditing,
  onChange
}) => {
  const getFieldIcon = (fieldId: string) => {
    switch (fieldId) {
      case 'idType':
      case 'idNumber':
        return <CreditCard size={16} />;
      case 'idPicture':
      case 'yourPicture':
        return <User size={16} />;
      case 'tshirtSize':
        return <Shirt size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const renderField = (field: Field) => {
    const value = data[field.id] || '';

    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={!isEditing || field.isDisabled}
          className={styles.select}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'file') {
      return (
        <div className={styles.fileField}>
          {isEditing ? (
            <input
              type="file"
              accept={field.accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange(field.id, file);
                }
              }}
              className={styles.fileInput}
            />
          ) : (
            <div className={styles.fileDisplay}>
              {value ? (
                <span className={styles.fileName}>
                  {typeof value === 'string' ? value : (value as File).name}
                </span>
              ) : (
                <span className={styles.noFile}>No file uploaded</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        disabled={!isEditing || field.isDisabled}
        className={styles.input}
      />
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <FileText size={20} />
          Travel Details
        </h3>
      </div>
      
      <div className={styles.cardContent}>
        {fields.map(field => (
          <div key={field.id} className={styles.field}>
            <label className={styles.label}>
              {getFieldIcon(field.id)}
              {field.label}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelDetailsCard;