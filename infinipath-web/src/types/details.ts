export interface UserListItem {
    userId: number;
    fullName: string;
    email: string;
    dob: string;
    paymentMode: 'Online' | 'Offline';
    gender: string;
    city: string;
  }
  
  export interface UserDetails {
    errors?: string[];
    programRegistration: {
      programRegistrationId: number;
      userId: number;
      status: string;
      registerStatus: string;
      user: {
        userId: number;
        fullName: string;
        email: string;
        mobile: string;
        createdAt: string;
      };
      program: {
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        programFee: number;
      };
    };
    user: {
      userId: number;
      fullName: string;
      email: string;
      mobile: string;
      createdAt: string;
    };
    userDetails: {
      dob: string;
      gender: string;
      maritalStatus?: string;
    };
    address: {
      country: string;
      state: string;
      city: string;
    };
    rmDetails: {
      fullName: string;
      email: string;
      mobile: string;
    };
    paymentDetails: {
      paidAmount: string;
      paymentMode: string;
      paymentStatus: string;
      total: string;
    };
    invoiceDetails: {
      invoiceNumber: number;
      invoiceAmount: string;
      status: string;
      invoiceDate: string;
    };
    seekerStatus: {
      registration: { status: string; substatus: string };
      payment: { status: string; substatus: string };
      invoice: { status: string; substatus: string };
      travel: { status: string; substatus: string };
      logistic: { status: string; substatus: string };
      roomallocation: { status: string; substatus: string };
      finalStatus: { status: string; substatus: string };
    };
  }

  export type FieldType = 'text' | 'select' | 'radio';