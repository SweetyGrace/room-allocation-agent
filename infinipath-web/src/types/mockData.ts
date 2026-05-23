import { UserListItem, UserDetails } from './details';

export const mockUsers: UserListItem[] = [
  {
    userId: 4709,
    fullName: "Akki",
    email: "saip123455465@gmail.com",
    dob: "1998-02-14",
    paymentMode: "Online",
    gender: "male",
    city: "Ahmedabad"
  },
  {
    userId: 4710,
    fullName: "John Doe",
    email: "john.doe@example.com",
    dob: "1995-06-20",
    paymentMode: "Offline",
    gender: "male",
    city: "Mumbai"
  },
  {
    userId: 4711,
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    dob: "1992-08-15",
    paymentMode: "Online",
    gender: "female",
    city: "Delhi"
  },
  {
    userId: 4712,
    fullName: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    dob: "1990-01-10",
    paymentMode: "Online",
    gender: "male",
    city: "Bangalore"
  },
  {
    userId: 4713,
    fullName: "Priya Kapoor",
    email: "priya.kapoor@example.com",
    dob: "1994-03-22",
    paymentMode: "Offline",
    gender: "female",
    city: "Chennai"
  },
  {
    userId: 4714,
    fullName: "Aman Verma",
    email: "aman.verma@example.com",
    dob: "1989-12-30",
    paymentMode: "Online",
    gender: "male",
    city: "Pune"
  },
  {
    userId: 4715,
    fullName: "Sneha Rao",
    email: "sneha.rao@example.com",
    dob: "1996-07-18",
    paymentMode: "Offline",
    gender: "female",
    city: "Hyderabad"
  },
  {
    userId: 4716,
    fullName: "Vikram Singh",
    email: "vikram.singh@example.com",
    dob: "1991-09-25",
    paymentMode: "Online",
    gender: "male",
    city: "Kolkata"
  },
  {
    userId: 4717,
    fullName: "Neha Sharma",
    email: "neha.sharma@example.com",
    dob: "1993-11-05",
    paymentMode: "Offline",
    gender: "female",
    city: "Jaipur"
  },
  {
    userId: 4718,
    fullName: "Rohan Desai",
    email: "rohan.desai@example.com",
    dob: "1997-04-08",
    paymentMode: "Online",
    gender: "male",
    city: "Surat"
  },
  {
    userId: 4719,
    fullName: "Anjali Nair",
    email: "anjali.nair@example.com",
    dob: "1990-10-12",
    paymentMode: "Offline",
    gender: "female",
    city: "Kochi"
  },
  {
    userId: 4720,
    fullName: "Karan Patel",
    email: "karan.patel@example.com",
    dob: "1988-05-16",
    paymentMode: "Online",
    gender: "male",
    city: "Rajkot"
  },
  {
    userId: 4721,
    fullName: "Divya Joshi",
    email: "divya.joshi@example.com",
    dob: "1992-02-28",
    paymentMode: "Offline",
    gender: "female",
    city: "Nagpur"
  }
];


export const mockAllUserDetails: { [key: number]: UserDetails } = {
  4709: {
    errors: ["Seeker Attendence not found"],
    programRegistration: {
      programRegistrationId: 2617,
      userId: 4709,
      status: "Online Payment Done",
      registerStatus: "Online Completed",
      user: {
        userId: 4709,
        fullName: "Akki",
        email: "saip123455465@gmail.com",
        mobile: "+919652463914",
        createdAt: "2025-05-09T08:49:48.599Z"
      },
      program: {
        name: "Entrainment 24",
        description: "Entrainment 24",
        startDate: "2024-09-18",
        endDate: "2024-09-21",
        programFee: 5
      }
    },
    user: {
      userId: 4709,
      fullName: "Akki",
      email: "saip123455465@gmail.com",
      mobile: "+919652463914",
      createdAt: "2025-05-09T08:49:48.599Z"
    },
    userDetails: {
      dob: "1998-02-14",
      gender: "male",
      maritalStatus: null
    },
    address: {
      country: "India",
      state: "Tamil Nadu",
      city: "Ahmedabad"
    },
    rmDetails: {
      fullName: "Rajashekar",
      email: "abc@gmail.com",
      mobile: "+123456789"
    },
    paymentDetails: {
      paidAmount: "5.00",
      paymentMode: "Online",
      paymentStatus: "Completed",
      total: "5.00"
    },
    invoiceDetails: {
      invoiceNumber: 1024,
      invoiceAmount: "5.00",
      status: "Pending",
      invoiceDate: "2025-05-12"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Online Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Completed" },
      travel: { status: "Completed", substatus: "Travel Plan Completed" },
      logistic: { status: "Completed", substatus: "Logistics Completed" },
      roomallocation: { status: "Not completed", substatus: "Room Allocation Pending" },
      finalStatus: { status: "Completed", substatus: "Online Completed" }
    }
  },
  4710: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2618,
      userId: 4710,
      status: "Offline Payment Done",
      registerStatus: "Offline Completed",
      user: {
        userId: 4710,
        fullName: "John Doe",
        email: "john.doe@example.com",
        mobile: "+919876543210",
        createdAt: "2025-05-08T10:15:30.123Z"
      },
      program: {
        name: "Leadership Summit 2024",
        description: "Annual Leadership Development Program",
        startDate: "2024-10-15",
        endDate: "2024-10-18",
        programFee: 150
      }
    },
    user: {
      userId: 4710,
      fullName: "John Doe",
      email: "john.doe@example.com",
      mobile: "+919876543210",
      createdAt: "2025-05-08T10:15:30.123Z"
    },
    userDetails: {
      dob: "1995-06-20",
      gender: "male",
      maritalStatus: "single"
    },
    address: {
      country: "India",
      state: "Maharashtra",
      city: "Mumbai"
    },
    rmDetails: {
      fullName: "Suresh Kumar",
      email: "suresh.kumar@company.com",
      mobile: "+919123456789"
    },
    paymentDetails: {
      paidAmount: "150.00",
      paymentMode: "Offline",
      paymentStatus: "Completed",
      total: "150.00"
    },
    invoiceDetails: {
      invoiceNumber: 1025,
      invoiceAmount: "150.00",
      status: "Generated",
      invoiceDate: "2025-05-10"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Offline Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "In Progress", substatus: "Travel Planning" },
      logistic: { status: "Not completed", substatus: "Logistics Pending" },
      roomallocation: { status: "Completed", substatus: "Room Allocated" },
      finalStatus: { status: "In Progress", substatus: "Processing" }
    }
  },
  4711: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2619,
      userId: 4711,
      status: "Online Payment Done",
      registerStatus: "Online Completed",
      user: {
        userId: 4711,
        fullName: "Jane Smith",
        email: "jane.smith@example.com",
        mobile: "+919988776655",
        createdAt: "2025-05-07T14:22:15.456Z"
      },
      program: {
        name: "Tech Innovation Workshop",
        description: "Latest Technology Trends and Innovation",
        startDate: "2024-11-20",
        endDate: "2024-11-23",
        programFee: 200
      }
    },
    user: {
      userId: 4711,
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      mobile: "+919988776655",
      createdAt: "2025-05-07T14:22:15.456Z"
    },
    userDetails: {
      dob: "1992-08-15",
      gender: "female",
      maritalStatus: "married"
    },
    address: {
      country: "India",
      state: "Delhi",
      city: "Delhi"
    },
    rmDetails: {
      fullName: "Priya Nair",
      email: "priya.nair@company.com",
      mobile: "+919234567890"
    },
    paymentDetails: {
      paidAmount: "200.00",
      paymentMode: "Online",
      paymentStatus: "Completed",
      total: "200.00"
    },
    invoiceDetails: {
      invoiceNumber: 1026,
      invoiceAmount: "200.00",
      status: "Generated",
      invoiceDate: "2025-05-08"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Online Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "Completed", substatus: "Travel Confirmed" },
      logistic: { status: "Completed", substatus: "Logistics Arranged" },
      roomallocation: { status: "Completed", substatus: "Room Allocated" },
      finalStatus: { status: "Completed", substatus: "All Set" }
    }
  },
  4712: {
    errors: ["Payment verification pending"],
    programRegistration: {
      programRegistrationId: 2620,
      userId: 4712,
      status: "Online Payment Pending",
      registerStatus: "Registration Completed",
      user: {
        userId: 4712,
        fullName: "Rahul Mehta",
        email: "rahul.mehta@example.com",
        mobile: "+919876512345",
        createdAt: "2025-05-06T09:30:45.789Z"
      },
      program: {
        name: "Digital Marketing Mastery",
        description: "Comprehensive Digital Marketing Program",
        startDate: "2024-12-05",
        endDate: "2024-12-08",
        programFee: 100
      }
    },
    user: {
      userId: 4712,
      fullName: "Rahul Mehta",
      email: "rahul.mehta@example.com",
      mobile: "+919876512345",
      createdAt: "2025-05-06T09:30:45.789Z"
    },
    userDetails: {
      dob: "1990-01-10",
      gender: "male",
      maritalStatus: "single"
    },
    address: {
      country: "India",
      state: "Karnataka",
      city: "Bangalore"
    },
    rmDetails: {
      fullName: "Anita Sharma",
      email: "anita.sharma@company.com",
      mobile: "+919345678901"
    },
    paymentDetails: {
      paidAmount: "100.00",
      paymentMode: "Online",
      paymentStatus: "Pending",
      total: "100.00"
    },
    invoiceDetails: {
      invoiceNumber: 1027,
      invoiceAmount: "100.00",
      status: "Pending",
      invoiceDate: "2025-05-06"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Registration Completed" },
      payment: { status: "Pending", substatus: "Payment Verification Pending" },
      invoice: { status: "Pending", substatus: "Invoice Pending" },
      travel: { status: "Not completed", substatus: "Travel Not Started" },
      logistic: { status: "Not completed", substatus: "Logistics Not Started" },
      roomallocation: { status: "Not completed", substatus: "Room Not Allocated" },
      finalStatus: { status: "Pending", substatus: "Payment Pending" }
    }
  },
  4713: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2621,
      userId: 4713,
      status: "Offline Payment Done",
      registerStatus: "Offline Completed",
      user: {
        userId: 4713,
        fullName: "Priya Kapoor",
        email: "priya.kapoor@example.com",
        mobile: "+919123567890",
        createdAt: "2025-05-05T16:45:20.321Z"
      },
      program: {
        name: "Financial Planning Workshop",
        description: "Personal Finance and Investment Planning",
        startDate: "2024-11-10",
        endDate: "2024-11-12",
        programFee: 75
      }
    },
    user: {
      userId: 4713,
      fullName: "Priya Kapoor",
      email: "priya.kapoor@example.com",
      mobile: "+919123567890",
      createdAt: "2025-05-05T16:45:20.321Z"
    },
    userDetails: {
      dob: "1994-03-22",
      gender: "female",
      maritalStatus: "married"
    },
    address: {
      country: "India",
      state: "Tamil Nadu",
      city: "Chennai"
    },
    rmDetails: {
      fullName: "Vikram Reddy",
      email: "vikram.reddy@company.com",
      mobile: "+919456789012"
    },
    paymentDetails: {
      paidAmount: "75.00",
      paymentMode: "Offline",
      paymentStatus: "Completed",
      total: "75.00"
    },
    invoiceDetails: {
      invoiceNumber: 1028,
      invoiceAmount: "75.00",
      status: "Generated",
      invoiceDate: "2025-05-05"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Offline Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "In Progress", substatus: "Travel Booking" },
      logistic: { status: "Completed", substatus: "Logistics Confirmed" },
      roomallocation: { status: "In Progress", substatus: "Room Assignment" },
      finalStatus: { status: "In Progress", substatus: "Nearly Complete" }
    }
  },
  4714: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2622,
      userId: 4714,
      status: "Online Payment Done",
      registerStatus: "Online Completed",
      user: {
        userId: 4714,
        fullName: "Aman Verma",
        email: "aman.verma@example.com",
        mobile: "+919567890123",
        createdAt: "2025-05-04T11:20:10.654Z"
      },
      program: {
        name: "Startup Accelerator",
        description: "Entrepreneurship and Startup Development",
        startDate: "2025-01-15",
        endDate: "2025-01-18",
        programFee: 250
      }
    },
    user: {
      userId: 4714,
      fullName: "Aman Verma",
      email: "aman.verma@example.com",
      mobile: "+919567890123",
      createdAt: "2025-05-04T11:20:10.654Z"
    },
    userDetails: {
      dob: "1989-12-30",
      gender: "male",
      maritalStatus: "single"
    },
    address: {
      country: "India",
      state: "Maharashtra",
      city: "Pune"
    },
    rmDetails: {
      fullName: "Deepika Singh",
      email: "deepika.singh@company.com",
      mobile: "+919678901234"
    },
    paymentDetails: {
      paidAmount: "250.00",
      paymentMode: "Online",
      paymentStatus: "Completed",
      total: "250.00"
    },
    invoiceDetails: {
      invoiceNumber: 1029,
      invoiceAmount: "250.00",
      status: "Generated",
      invoiceDate: "2025-05-04"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Online Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "Completed", substatus: "Travel Confirmed" },
      logistic: { status: "Completed", substatus: "Logistics Ready" },
      roomallocation: { status: "Completed", substatus: "Premium Room Allocated" },
      finalStatus: { status: "Completed", substatus: "Ready to Go" }
    }
  },
  4715: {
    errors: ["Document verification pending"],
    programRegistration: {
      programRegistrationId: 2623,
      userId: 4715,
      status: "Offline Payment Done",
      registerStatus: "Document Verification Pending",
      user: {
        userId: 4715,
        fullName: "Sneha Rao",
        email: "sneha.rao@example.com",
        mobile: "+919789012345",
        createdAt: "2025-05-03T13:55:33.987Z"
      },
      program: {
        name: "Data Science Bootcamp",
        description: "Comprehensive Data Science and Analytics",
        startDate: "2025-02-01",
        endDate: "2025-02-05",
        programFee: 300
      }
    },
    user: {
      userId: 4715,
      fullName: "Sneha Rao",
      email: "sneha.rao@example.com",
      mobile: "+919789012345",
      createdAt: "2025-05-03T13:55:33.987Z"
    },
    userDetails: {
      dob: "1996-07-18",
      gender: "female",
      maritalStatus: "single"
    },
    address: {
      country: "India",
      state: "Telangana",
      city: "Hyderabad"
    },
    rmDetails: {
      fullName: "Rohit Agarwal",
      email: "rohit.agarwal@company.com",
      mobile: "+919890123456"
    },
    paymentDetails: {
      paidAmount: "300.00",
      paymentMode: "Offline",
      paymentStatus: "Completed",
      total: "300.00"
    },
    invoiceDetails: {
      invoiceNumber: 1030,
      invoiceAmount: "300.00",
      status: "Generated",
      invoiceDate: "2025-05-03"
    },
    seekerStatus: {
      registration: { status: "Pending", substatus: "Document Verification Pending" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "Not completed", substatus: "Travel Not Started" },
      logistic: { status: "Not completed", substatus: "Logistics Pending" },
      roomallocation: { status: "Not completed", substatus: "Room Not Allocated" },
      finalStatus: { status: "Pending", substatus: "Document Verification Required" }
    }
  },
  4716: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2624,
      userId: 4716,
      status: "Online Payment Done",
      registerStatus: "Online Completed",
      user: {
        userId: 4716,
        fullName: "Vikram Singh",
        email: "vikram.singh@example.com",
        mobile: "+919901234567",
        createdAt: "2025-05-02T08:10:25.147Z"
      },
      program: {
        name: "AI & Machine Learning Summit",
        description: "Artificial Intelligence and ML Workshop",
        startDate: "2025-03-10",
        endDate: "2025-03-13",
        programFee: 400
      }
    },
    user: {
      userId: 4716,
      fullName: "Vikram Singh",
      email: "vikram.singh@example.com",
      mobile: "+919901234567",
      createdAt: "2025-05-02T08:10:25.147Z"
    },
    userDetails: {
      dob: "1991-09-25",
      gender: "male",
      maritalStatus: "married"
    },
    address: {
      country: "India",
      state: "West Bengal",
      city: "Kolkata"
    },
    rmDetails: {
      fullName: "Meera Jain",
      email: "meera.jain@company.com",
      mobile: "+919012345678"
    },
    paymentDetails: {
      paidAmount: "400.00",
      paymentMode: "Online",
      paymentStatus: "Completed",
      total: "400.00"
    },
    invoiceDetails: {
      invoiceNumber: 1031,
      invoiceAmount: "400.00",
      status: "Generated",
      invoiceDate: "2025-05-02"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Online Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "Completed", substatus: "Flight Booked" },
      logistic: { status: "In Progress", substatus: "Materials Preparation" },
      roomallocation: { status: "Completed", substatus: "Deluxe Room Allocated" },
      finalStatus: { status: "In Progress", substatus: "Final Preparations" }
    }
  },
  4717: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2625,
      userId: 4717,
      status: "Offline Payment Done",
      registerStatus: "Offline Completed",
      user: {
        userId: 4717,
        fullName: "Neha Sharma",
        email: "neha.sharma@example.com",
        mobile: "+919123456780",
        createdAt: "2025-05-01T15:30:40.258Z"
      },
      program: {
        name: "Creative Writing Workshop",
        description: "Professional Writing and Content Creation",
        startDate: "2024-12-20",
        endDate: "2024-12-22",
        programFee: 80
      }
    },
    user: {
      userId: 4717,
      fullName: "Neha Sharma",
      email: "neha.sharma@example.com",
      mobile: "+919123456780",
      createdAt: "2025-05-01T15:30:40.258Z"
    },
    userDetails: {
      dob: "1993-11-05",
      gender: "female",
      maritalStatus: "single"
    },
    address: {
      country: "India",
      state: "Rajasthan",
      city: "Jaipur"
    },
    rmDetails: {
      fullName: "Arjun Patel",
      email: "arjun.patel@company.com",
      mobile: "+919234567801"
    },
    paymentDetails: {
      paidAmount: "80.00",
      paymentMode: "Offline",
      paymentStatus: "Completed",
      total: "80.00"
    },
    invoiceDetails: {
      invoiceNumber: 1032,
      invoiceAmount: "80.00",
      status: "Generated",
      invoiceDate: "2025-05-01"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Offline Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "Completed", substatus: "Train Ticket Booked" },
      logistic: { status: "Completed", substatus: "Workshop Kit Ready" },
      roomallocation: { status: "Completed", substatus: "Shared Room Allocated" },
      finalStatus: { status: "Completed", substatus: "All Ready" }
    }
  },
  4718: {
    errors: ["Refund request pending"],
    programRegistration: {
      programRegistrationId: 2626,
      userId: 4718,
      status: "Online Payment Done",
      registerStatus: "Cancellation Requested",
      user: {
        userId: 4718,
        fullName: "Rohan Desai",
        email: "rohan.desai@example.com",
        mobile: "+919345678012",
        createdAt: "2025-04-30T12:45:55.369Z"
      },
      program: {
        name: "Project Management Certification",
        description: "PMP Certification Preparation",
        startDate: "2025-01-25",
        endDate: "2025-01-28",
        programFee: 180
      }
    },
    user: {
      userId: 4718,
      fullName: "Rohan Desai",
      email: "rohan.desai@example.com",
      mobile: "+919345678012",
      createdAt: "2025-04-30T12:45:55.369Z"
    },
    userDetails: {
      dob: "1997-04-08",
      gender: "male",
      maritalStatus: "single"
    },
    address: {
      country: "India",
      state: "Gujarat",
      city: "Surat"
    },
    rmDetails: {
      fullName: "Kavya Menon",
      email: "kavya.menon@company.com",
      mobile: "+919456789023"
    },
    paymentDetails: {
      paidAmount: "180.00",
      paymentMode: "Online",
      paymentStatus: "Refund Requested",
      total: "180.00"
    },
    invoiceDetails: {
      invoiceNumber: 1033,
      invoiceAmount: "180.00",
      status: "Cancelled",
      invoiceDate: "2025-04-30"
    },
    seekerStatus: {
      registration: { status: "Cancelled", substatus: "Cancellation Requested" },
      payment: { status: "Refund Pending", substatus: "Refund Processing" },
      invoice: { status: "Cancelled", substatus: "Invoice Cancelled" },
      travel: { status: "Cancelled", substatus: "Travel Cancelled" },
      logistic: { status: "Cancelled", substatus: "Logistics Cancelled" },
      roomallocation: { status: "Cancelled", substatus: "Room Deallocated" },
      finalStatus: { status: "Cancelled", substatus: "Refund Processing" }
    }
  },
  4719: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2627,
      userId: 4719,
      status: "Offline Payment Done",
      registerStatus: "Offline Completed",
      user: {
        userId: 4719,
        fullName: "Anjali Nair",
        email: "anjali.nair@example.com",
        mobile: "+919567890234",
        createdAt: "2025-04-29T09:25:12.741Z"
      },
      program: {
        name: "Wellness & Mindfulness Retreat",
        description: "Mental Health and Wellness Program",
        startDate: "2025-02-14",
        endDate: "2025-02-16",
        programFee: 120
      }
    },
    user: {
      userId: 4719,
      fullName: "Anjali Nair",
      email: "anjali.nair@example.com",
      mobile: "+919567890234",
      createdAt: "2025-04-29T09:25:12.741Z"
    },
    userDetails: {
      dob: "1990-10-12",
      gender: "female",
      maritalStatus: "married"
    },
    address: {
      country: "India",
      state: "Kerala",
      city: "Kochi"
    },
    rmDetails: {
      fullName: "Sanjay Kumar",
      email: "sanjay.kumar@company.com",
      mobile: "+919678901345"
    },
    paymentDetails: {
      paidAmount: "120.00",
      paymentMode: "Offline",
      paymentStatus: "Completed",
      total: "120.00"
    },
    invoiceDetails: {
      invoiceNumber: 1034,
      invoiceAmount: "120.00",
      status: "Generated",
      invoiceDate: "2025-04-29"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Offline Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "In Progress", substatus: "Travel Planning" },
      logistic: { status: "Completed", substatus: "Wellness Kit Prepared" },
      roomallocation: { status: "Completed", substatus: "Spa Room Allocated" },
      finalStatus: { status: "In Progress", substatus: "Travel Pending" }
    }
  },
  4720: {
    errors: [],
    programRegistration: {
      programRegistrationId: 2628,
      userId: 4720,
      status: "Online Payment Done",
      registerStatus: "Online Completed",
      user: {
        userId: 4720,
        fullName: "Karan Patel",
        email: "karan.patel@example.com",
        mobile: "+919789012456",
        createdAt: "2025-04-28T17:40:18.852Z"
      },
      program: {
        name: "Cybersecurity Essentials",
        description: "Network Security and Ethical Hacking",
        startDate: "2025-03-20",
        endDate: "2025-03-23",
        programFee: 220
      }
    },
    user: {
      userId: 4720,
      fullName: "Karan Patel",
      email: "karan.patel@example.com",
      mobile: "+919789012456",
      createdAt: "2025-04-28T17:40:18.852Z"
    },
    userDetails: {
      dob: "1988-05-16",
      gender: "male",
      maritalStatus: "married"
    },
    address: {
      country: "India",
      state: "Gujarat",
      city: "Rajkot"
    },
    rmDetails: {
      fullName: "Ritika Gupta",
      email: "ritika.gupta@company.com",
      mobile: "+919890123567"
    },
    paymentDetails: {
      paidAmount: "220.00",
      paymentMode: "Online",
      paymentStatus: "Completed",
      total: "220.00"
    },
    invoiceDetails: {
      invoiceNumber: 1035,
      invoiceAmount: "220.00",
      status: "Generated",
      invoiceDate: "2025-04-28"
    },
    seekerStatus: {
      registration: { status: "Completed", substatus: "Online Completed" },
      payment: { status: "Completed", substatus: "Payment Completed" },
      invoice: { status: "Completed", substatus: "Invoice Generated" },
      travel: { status: "Completed", substatus: "Bus Ticket Booked" },
      logistic: { status: "Completed", substatus: "Security Tools Kit Ready" },
      roomallocation: { status: "Completed", substatus: "Tech Room Allocated" },
      finalStatus: { status: "Completed", substatus: "Ready for Program" }
    }
  },
  4721: {
    errors: ["Late registration fee applicable"],
    programRegistration: {
      programRegistrationId: 2629,
      userId: 4721,
      status: "Offline Payment Pending",
      registerStatus: "Late Registration",
      user: {
        userId: 4721,
        fullName: "Divya Joshi",
        email: "divya.joshi@example.com",
        mobile: "+919012345789",
        createdAt: "2025-04-27T14:15:35.963Z"
      },
      program: {
        name: "Business Analytics Workshop",
        description: "Data Analytics for Business Intelligence",
        startDate: "2025-04-05",
        endDate: "2025-04-08",
        programFee: 160
      }
    },
    user: {
      userId: 4721,
      fullName: "Divya Joshi",
      email: "divya.joshi@example.com",
      mobile: "+919012345789",
      createdAt: "2025-04-27T14:15:35.963Z"
    },
    userDetails: {
      dob: "1992-02-28",
      gender: "female",
      maritalStatus: "single"
    },
    address: {
      country: "India",
      state: "Maharashtra",
      city: "Nagpur"
    },
    rmDetails: {
      fullName: "Amit Joshi",
      email: "amit.joshi@company.com",
      mobile: "+919123456890"
    },
    paymentDetails: {
      paidAmount: "0.00",
      paymentMode: "Offline",
      paymentStatus: "Pending",
      total: "185.00"
    },
    invoiceDetails: {
      invoiceNumber: 1036,
      invoiceAmount: "185.00",
      status: "Pending",
      invoiceDate: "2025-04-27"
    },
    seekerStatus: {
      registration: { status: "Pending", substatus: "Late Registration" },
      payment: { status: "Pending", substatus: "Payment Not Done" },
      invoice: { status: "Pending", substatus: "Invoice Pending" },
      travel: { status: "Not completed", substatus: "Travel Not Started" },
      logistic: { status: "Not completed", substatus: "Logistics Not Started" },
      roomallocation: { status: "Not completed", substatus: "Room Not Allocated" },
      finalStatus: { status: "Pending", substatus: "Payment Required" }
    }
  }
};

// Helper function to get user details by ID
export const getUserDetailsById = (userId: number): UserDetails | null => {
  return mockAllUserDetails[userId] || null;
};

// Helper function to get all user IDs
export const getAllUserIds = (): number[] => {
  return Object.keys(mockAllUserDetails).map(Number);
};

// Helper function to get users by status
export const getUsersByStatus = (status: string): UserDetails[] => {
  return Object.values(mockAllUserDetails).filter(
    user => user.programRegistration.status === status
  );
};

// Helper function to get users by payment mode
export const getUsersByPaymentMode = (paymentMode: string): UserDetails[] => {
  return Object.values(mockAllUserDetails).filter(
    user => user.paymentDetails.paymentMode === paymentMode
  );
};


export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['personalInfo', 'paymentInfo', 'invoiceInfo'],
  rm: ['personalInfo'],
  financeManager: ['paymentInfo', 'invoiceInfo'],
};
