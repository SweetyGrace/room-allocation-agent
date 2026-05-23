// personalInfoFields.ts

export interface PersonalField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select and radio types
}

export const personalInfoFields: PersonalField[] = [
  {key: "name" , label:"Name" , type: "text"},  
  { key: "userId" , label: "User ID", type: "text" },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'mobile', label: 'Mobile', type: 'text' },
  { key: 'dob', label: 'Date of Birth', type: 'text' },
  { key: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female', 'Other'] },
  { key: "rmDetails", label: "RM Name", type: "text" },
];
