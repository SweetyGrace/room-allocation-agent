// invoiceFields.ts
import { FieldType } from '../../../../../types/details';

export interface InvoiceField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export const invoiceFields: InvoiceField[] = [
  { key: 'invoiceNumber', label: 'Invoice Number', type: 'text' },
  { key: 'invoiceAmount', label: 'Invoice Amount', type: 'text' },
  { key: 'invoiceDate', label: 'Invoice Date', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['Completed', 'Pending'] },
];
