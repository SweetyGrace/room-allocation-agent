import React from 'react';
import { Home, Users, MapPin, Calendar } from 'lucide-react';
import styles from './index.module.scss';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  rows?: number;
}

interface RoomAllocationProps {
  data: {
    roomType?: string;
    roomNumber?: string;
    checkInDate?: string;
    checkOutDate?: string;
    roommates?: string;
    preferences?: string;
    [key: string]: unknown;
  };
  fields: Field[];
  isEditing: boolean;
  onChange: (field: string, value: unknown) => void;
}

const RoomAllocationCard: React.FC<RoomAllocationProps> = ({
  data,
  fields,
  isEditing,
  onChange
}) => {
  const getFieldIcon = (fieldId: string) => {
    switch (fieldId) {
      case 'roomType':
      case 'roomNumber':
        return <Home size={16} />;
      case 'roommates':
      case 'preferredRoommates':
        return <Users size={16} />;
      case 'checkInDate':
      case 'checkOutDate':
        return <Calendar size={16} />;
      case 'city':
        return <MapPin size={16} />;
      default:
        return <Home size={16} />;
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

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          disabled={!isEditing || field.isDisabled}
          rows={field.rows || 3}
          className={styles.textarea}
        />
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
          <Home size={20} />
          Room Allocation
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

export default RoomAllocationCard;