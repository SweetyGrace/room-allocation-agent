// paymentFields.ts
import { FieldType } from '../../../../../types/details'; 

export interface PaymentField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export const paymentFields: PaymentField[] = [
  { key: 'paidAmount', label: 'Amount', type: 'text' },
  { key: 'paymentMode', label: 'Payment Mode', type: 'select', options: ['Cash', 'Card', 'UPI', 'Net Banking'] },
];
