import { AdminKPIDetails } from "../components/MeetingAnalyticsDashboard/Analtyics.modal";
import { contentDateFormat, extractTime } from "../utils/commonFunctions";

export const INCREMENT = "INCREMENT";
export const ABOUT = "About";
export const MOCK_URL =
  "https://mocki.io/v1/061f8c00-b6dc-4df6-88a4-3276e8d029a9";

/**
 * ID threshold for distinguishing between existing (persisted) items and newly created (temporary) items
 * IDs below this threshold are considered existing database records
 * IDs at or above this threshold are considered temporary client-side IDs
 */
export const EXISTING_ID_THRESHOLD = 1000000000000;

export const times = [
  "12:00 AM",
  "12:15 AM",
  "12:30 AM",
  "12:45 AM",
  "01:00 AM",
  "01:15 AM",
  "01:30 AM",
  "01:45 AM",
  "02:00 AM",
  "02:15 AM",
  "02:30 AM",
  "02:45 AM",
  "03:00 AM",
  "03:15 AM",
  "03:30 AM",
  "03:45 AM",
  "04:00 AM",
  "04:15 AM",
  "04:30 AM",
  "04:45 AM",
  "05:00 AM",
  "05:15 AM",
  "05:30 AM",
  "05:45 AM",
  "06:00 AM",
  "06:15 AM",
  "06:30 AM",
  "06:45 AM",
  "07:00 AM",
  "07:15 AM",
  "07:30 AM",
  "07:45 AM",
  "08:00 AM",
  "08:15 AM",
  "08:30 AM",
  "08:45 AM",
  "09:00 AM",
  "09:15 AM",
  "09:30 AM",
  "09:45 AM",
  "10:00 AM",
  "10:15 AM",
  "10:30 AM",
  "10:45 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
  "12:15 PM",
  "12:30 PM",
  "12:45 PM",
  "01:00 PM",
  "01:15 PM",
  "01:30 PM",
  "01:45 PM",
  "02:00 PM",
  "02:15 PM",
  "02:30 PM",
  "02:45 PM",
  "03:00 PM",
  "03:15 PM",
  "03:30 PM",
  "03:45 PM",
  "04:00 PM",
  "04:15 PM",
  "04:30 PM",
  "04:45 PM",
  "05:00 PM",
  "05:15 PM",
  "05:30 PM",
  "05:45 PM",
  "06:00 PM",
  "06:15 PM",
  "06:30 PM",
  "06:45 PM",
  "07:00 PM",
  "07:15 PM",
  "07:30 PM",
  "07:45 PM",
  "08:00 PM",
  "08:15 PM",
  "08:30 PM",
  "08:45 PM",
  "09:00 PM",
  "09:15 PM",
  "09:30 PM",
  "09:45 PM",
  "10:00 PM",
  "10:15 PM",
  "10:30 PM",
  "10:45 PM",
  "11:00 PM",
  "11:15 PM",
  "11:30 PM",
  "11:45 PM",
];

export const durations = [
  "15m",
  "30m",
  "45m",
  "01h",
  "01h 15m",
  "01h 30m",
  "01h 45m",
  "02h",
  "02h 15m",
  "02h 30m",
  "02h 45m",
  "03h",
  "03h 15m",
  "03h 30m",
  "03h 45m",
  "04h",
  "04h 15m",
  "04h 30m",
  "04h 45m",
  "05h",
  "05h 15m",
  "05h 30m",
  "05h 45m",
  "06h",
  "06h 15m",
  "06h 30m",
  "06h 45m",
  "07h",
  "07h 15m",
  "07h 30m",
  "07h 45m",
  "08h",
  "08h 15m",
  "08h 30m",
  "08h 45m",
  "09h",
  "09h 15m",
  "09h 30m",
  "09h 45m",
  "10h",
];

export const panelistMaxValue = 1000;
export const attendeesMaxValue = 3000;

export const allSeekersListColumns = [
  {
    field: "firstName",
    headerName: "First Name",
    width: 180,
    textAlign: "left",
  },
  { field: "lastName", headerName: "Last Name", width: 180, textAlign: "left" },
  { field: "email", headerName: "Email", width: 210, textAlign: "left" },
  { field: "gender", headerName: "Gender", width: 120, textAlign: "center" },
  { field: "age", headerName: "Age", width: 90, textAlign: "center" },
  {
    field: "phoneNumber",
    headerName: "Mobile Number",
    width: 180,
    textAlign: "left",
  },
  { field: "address", headerName: "Location", width: 180, textAlign: "left" },
  // { field: "isInfipath", headerName: "Type of Audience" }
];

export const mockAdminKPIResponse: AdminKPIDetails = {
  platformsUsedByAudience: {
    iOS: 90,
    Android: 320,
    Portal: 140,
    DirectLinks: 60,
  },
  locationInsights: {
    Chennai: 180,
    Bangalore: 170,
    Mumbai: 110,
    Hyderabad: 70,
  },
  genderDistribution: {
    Male: 310,
    Female: 380,
  },
  ageDistribution: {
    ageLessThan18: 40,
    ageBetween19And29: 210,
    ageBetween30And59: 290,
    ageGreaterThan60: 60,
  },
  typeOfAudienceInsights: {
    infinitheist: 360,
    nonInfinitheist: 330,
  },
  registeredInsights: {
    video: {
      registrantCount: 480,
      regDowngradedCount: 18,
      regCancellationsCount: 8,
      dailyStats: {
        Monday: { registrations: 95, downgrades: 4, cancellations: 2 },
      },
    },
    nonVideo: {
      registrantCount: 310,
      regDowngradedCount: 12,
      regCancellationsCount: 6,
      dailyStats: {
        Monday: { registrations: 75, downgrades: 3, cancellations: 1 },
        Tuesday: { registrations: 85, downgrades: 4, cancellations: 2 },
        Wednesday: { registrations: 65, downgrades: 2, cancellations: 2 },
      },
    },
    both: {
      registrantCount: 210,
      regDowngradedCount: 9,
      regCancellationsCount: 4,
      dailyStats: {
        Monday: { registrations: 55, downgrades: 2, cancellations: 1 },
        Tuesday: { registrations: 65, downgrades: 3, cancellations: 1 },
        Wednesday: { registrations: 90, downgrades: 4, cancellations: 2 },
      },
    },
  },
  attendanceInsights: {
    video: {
      absentees: 75,
      attendees: 450,
      lateComers: 30,
      rejoins: 15,
      dropOffs: 20,
      hourlyStats: {
        "10:00 AM": { attendees: 75, lateComers: 2, rejoins: 1, dropOffs: 1 },
        "10:15 AM": { attendees: 65, lateComers: 1, rejoins: 2, dropOffs: 1 },
        "10:30 AM": { attendees: 85, lateComers: 2, rejoins: 2, dropOffs: 3 },
        "10:45 AM": { attendees: 915, lateComers: 21, rejoins: 1, dropOffs: 7 },
        "11:00 AM": {
          attendees: 235,
          lateComers: 12,
          rejoins: 1,
          dropOffs: 24,
        },
        "11:15 AM": {
          attendees: 1450,
          lateComers: 62,
          rejoins: 7,
          dropOffs: 10,
        },
      },
    },
    nonVideo: {
      absentees: 70,
      attendees: 440,
      lateComers: 28,
      rejoins: 16,
      dropOffs: 22,
      hourlyStats: {
        "10:00 AM": { attendees: 72, lateComers: 2, rejoins: 1, dropOffs: 1 },
        "10:15 AM": { attendees: 66, lateComers: 0, rejoins: 1, dropOffs: 1 },
        "10:30 AM": { attendees: 78, lateComers: 2, rejoins: 3, dropOffs: 2 },
        "10:45 AM": { attendees: 92, lateComers: 2, rejoins: 1, dropOffs: 1 },
        "11:00 AM": { attendees: 140, lateComers: 1, rejoins: 1, dropOffs: 1 },
        "11:15 AM": { attendees: 455, lateComers: 1, rejoins: 0, dropOffs: 1 },
        "11:30 AM": { attendees: 490, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "11:45 AM": { attendees: 500, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "12:00 PM": { attendees: 510, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "12:15 PM": { attendees: 520, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "01:30 PM": { attendees: 490, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "01:45 PM": { attendees: 500, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "02:00 PM": { attendees: 510, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "02:15 PM": { attendees: 520, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "02:30 PM": { attendees: 490, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "02:45 PM": { attendees: 500, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "03:00 PM": { attendees: 510, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "03:15 PM": { attendees: 520, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "03:30 PM": { attendees: 490, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "03:45 PM": { attendees: 500, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "04:00 PM": { attendees: 510, lateComers: 2, rejoins: 0, dropOffs: 1 },
        "04:15 PM": { attendees: 520, lateComers: 2, rejoins: 0, dropOffs: 1 },
      },
    },
    both: {
      absentees: 78,
      attendees: 460,
      lateComers: 32,
      rejoins: 17,
      dropOffs: 23,
      hourlyStats: {
        "10:00 AM": { attendees: 76, lateComers: 3, rejoins: 1, dropOffs: 1 },
        "10:15 AM": { attendees: 68, lateComers: 1, rejoins: 2, dropOffs: 2 },
        "10:30 AM": { attendees: 82, lateComers: 2, rejoins: 2, dropOffs: 2 },
        "10:45 AM": { attendees: 91, lateComers: 3, rejoins: 1, dropOffs: 1 },
        "11:00 AM": { attendees: 138, lateComers: 1, rejoins: 1, dropOffs: 2 },
        "11:15 AM": { attendees: 490, lateComers: 2, rejoins: 0, dropOffs: 1 },
      },
    },
  },
  kpidata: {
    VerifiedSeekers: 230,
    NotVerifiedSeekers: 45,
    JoinedAlone: 150,
    JoinedWithOthers: 80,
    Absentees: 78,
    DropOffs: 23,
    Attended: 310,
    NewSeekers: 85,
    Registered: 410,
  },
};

export const KPI_FILTERS = {
  TYPES: {
    ALL: "All",
    VIDEO: "Video",
    NONVIDEO: "NonVideo",
    NON_VIDEO: "Non-Video",
    ABSENTEES: "Absentees",
    DROP_OFFS: "Drop offs",
    NEW_SEEKERS: "New joining",
    TOTAL_ATTENDEES: "Total Attendees",
    LOCATION: "Location",
    GENDER: "Gender",
    AGE: "Age",
    PLATFORM: "Platform",
    BOTH: "Both",
    ATTENDED: "Attended",
    JOINED_ALONE: "Joined alone",
    JOINED_WITH_OTHERS: "Joined with others",
    VERIFIED_SEEKERS: "Verified seekers",
    NOT_VERIFIED_SEEKERS: "Not verified seekers",
    REGISTERED: "Registered",
    LATECOMERS: "lateComer",
    REG_ATTENDANCE: "Reg. Attendances",
  },
  REGISTRATION_TYPE: {
    VIDEO: "Video",
    NON_VIDEO: "Non-Video",
  },
  ATTENDANCE_STATUS: {
    ATTENDED: "Attended",
    ABSENT: "Absent",
    ABSENTEES: "Absentees",
    REGISTERED: "Registered",
    VIDEO_DOWNGRADES: "Video Downgrades",
    DOWNGRADES: "Downgrades",
    CANCELLATIONS: "Cancellations",
    CANCELLATIONS_LOWER: "cancellations",
    CANCELLATION_LOWER: "cancellation",
    DOWNGRADES_LOWER: "downgrades",
    DOWNGRADE_LOWER: "downgrade",
  },
  ATTENDANCE_DETAILS: {
    DROP_OFF: "Drop Offs",
    DROP_OFFS: "Drop Off(s)",
    DROPOFFS: "Drop off(s)",
    REJOIN: "Rejoin",
    REJOINS: "Rejoin(s)",
    NEW_SEEKERS: "New Seekers",
    LATE_COMERS: "Late Comers",
  },
  GENDER_TYPES: {
    MALE: "Male",
    FEMALE: "Female",
  },
  PLATFORM: {
    IOS: "iOS",
    ANDROID: "Android",
    PORTAL: "Portal",
    DIRECT_LINKS: "Direct Links",
    APP: "App",
    APP_LOWER: "app",
    iOS_LOWER: "ios",
    ANDROID_LOWER: "android",
    DIRECT_LINKS_LOWER: "directLinks",
  },
  JOIN_MODE: {
    ALONE: "Self",
    OTHERS: "Others",
  },
  VERIFICATION_STATUS: {
    VERIFIED: "Verified",
    NOT_VERIFIED: "Not Verified",
    NOT_VERIFIED_CAMEL: "notVerified",
    VERIFIED_LOWER: "verified",
    NOT_VERIFIED_LOWER: "not verified",
  },
};

export const FILTER_LABELS = {
  AGE: "Age",
  REGISTRATION_TYPE: "Registration Type",
  GENDER: "Gender",
  PLATFORM: "Platform",
  VERIFICATION_STATUS: "Verification Status",
  LOCATION: "Location",
  ATTENDANCE_STATUS: "Attendance Status",
  ATTENDANCE_DETAILS: "Attendance Details",
  JOIN_MODE: "Join Mode",
  AGE_GROUP: "ageGroup",
  GENDER_LABEL: "gender",
  LOCATION_LABEL: "location",
  ALL: "All",
};

export const TABS = {
  SELECTEDTAB: "selectedTab",
  NESTEDSELECTEDTAB: "nestedTab",
};

export const NESTEDTAB = {
  DRAFTS: "drafts",
  PUBLISHED: "published",
  INTERNAL: "internal",
};

export const SELECTEDTABS = {
  UPCOMING: "upcoming",
  COMPLETED: "completed",
};

export const WEBINARSTATUS = {
  COMPLETED: "completed",
  DRAFT: "draft",
  PUBLISHED: "published",
  INTERNAL: "internalTesting",
};

// "Late Comers", "Rejoin", "Drop Off", "New Seekers"
export const ATTENDANCE_STATUS = {
  LATE_COMERS: "Late Comers",
  REJOIN: "Rejoin",
  DROP_OFF: "Drop Offs",
  NEW_SEEKERS: "New Seekers",
};

export const ERROR_MESSAGES = {
  NO_DATA: "No data",
  PHONE_NUMBER_INVALID: "Phone Number must contain only numeric characters.",
  PHONE_NUMBER_REQUIRED: "phoneNumber is required.",
  PHONE_NUMBER_STRING: "phoneNumber must be a string.",
  INVALID_PHONE_COUNTRY: "Invalid phone number for selected country.",
  INVALID_PHONE_FORMAT: "Invalid phone number format.",
  PHONE_NUMBER_REGISTERED: "Phone Number already registered for this webinar.",
  PHONE_NUMBER_DUPLICATE: "Duplicate phone number found.",
  USER_NOT_EXIST: "User does not exist in system.",
  EMAIL_REQUIRED: "email is required.",
  EMAIL_STRING: "email must be a string.",
  EMAIL_INVALID: "Invalid email format.",
  EMAIL_EXISTS: "Email already exists in system.",
  EMAIL_MISMATCH: "User email mismatch with system.",
  EMAIL_DUPLICATE: "Duplicate email found.",
  REGISTRATION_TYPE_REQUIRED: "registrationType is required.",
  REGISTRATION_TYPE_STRING: "registrationType must be a string.",
  REGISTRATION_TYPE_INVALID: "Registration Type must be P or A.",
  FETCH_FILTER_DATA: "Error fetching filter data",
  FETCH_ROOM_INVENTORY_DATA: "Error fetching room inventory data",
};
export const ERROR_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;


export const REGISTRATION_TYPES = {
  VIDEO: "P",
  NON_VIDEO: "A",
  VIDEOTEXT: "video",
  NONVIDEOTEXT: "non-video",
};

export const BULK_UPLOAD_MESSAGES = {
  SUCCESS: "Bulk registered successfully",
  ERROR: "An error occurred during upload.",
  FETCH_SUCCESS: "Bulk registrations data fetched successfully",
  FETCH_ERROR: "Error fetching bulk registrations data",
};

export const NO_RESULTS = "No results found";
export const NO_FILTERED_DATA =
  "No results found for the selected filter criteria.";
export const NO_DATA =
  "Looks like we don’t have enough data to view Aggregated Analytics.";
export const NO_SESSION_DATA =
  "Looks like we don’t have enough data to view Session Analytics.";
export const SNACKBAR_MESSAGES = "success";
export const NO_REGISTRATION_INSIGHTS = "no data found";
export const NO_ATTENDANCE_INSIGHTS = "no data found";
export const NO_AGE_DATA = "No data found for the selected age group";
export const NO_GENDER_DATA = "No data found";
export const NO_PLATFORM_DATA = "No data found";
export const NO_LOCATION_DATA = "No data found";
export const NO_SEEKER_ENGAGEMENT_DATA = "No data found";
export const NO_SESSION_ENGAGEMENT_DATA = "No data found";
export const KPI_TAB_STATUSES = {
  TOTAL_REGISTRATIONS: "Total Registrations",
  VIDEO: "Video",
  NON_VIDEO: "Non Video",
  DOWNGRADED: "Downgraded",
  BULK_REGISTRATIONS: "Bulk Registrations",
};

export const INSIGHTS_KPI = {
  ALL: "All",
  VIDEO: "Video",
  NON_VIDEO: "Non-Video",
  NONVIDEO: "NonVideo",
  BOTH: "Both",
};

export const INSIGHTS_TYPES = {
  REGISTRATION: "Registrations",
  ATTENDEES: "Attendees",
};

export const INSIGHTS_TYPES_LABELS = {
  REGISTERED: {
    displayLabel: "Registered",
    value: "Registered",
  },
  DOWNGRADES: {
    displayLabel: "Video Downgrade(s)",
    value: "Video Downgrades",
  },
  CANCELLATIONS: {
    displayLabel: "Cancellation(s)",
    value: "Cancellations",
  },
  ATTENDED: { displayLabel: "Attended", value: "Attended" },
  ABSENTEES: { displayLabel: "Absentee", value: "Absentees" },
  DROP_OFF: { displayLabel: "Drop Off(s)", value: "Drop Off(s)" },
  REJOIN: { displayLabel: "Rejoin(s)", value: "Rejoin(s)" },
  LATE_COMERS: { displayLabel: "Late Comer(s)", value: "Late Comers" },
};

export const attendanceMapping: Record<string, string> = {
  attended: "participant",
  absent: "absentee",
  "late comers": "lateComer",
  rejoin: "rejoin",
  "drop off": "dropOff",
  cancellation: "cancellation",
  downgrade: "downgrade",
  "new seekers": "newSeeker",
  "drop offs": "dropOff",
};

// filterConstants.ts
export const AGE_FILTER_OPTIONS = ["<=18", "19 - 29", "30 - 59", ">=60"];
export const REGISTRATION_TYPE_OPTIONS = ["Video", "Non-Video"];
export const REGISTRATION_STATUS_OPTIONS = ["Downgrades", "Cancellations"];
export const GENDER_FILTER_OPTIONS = ["Male", "Female"];
export const PLATFORM_FILTER_OPTIONS = [
  "Portal",
  "Direct Links",
  "iOS",
  "Android",
];
export const VERIFICATION_FILTER_OPTIONS = ["Verified", "Not Verified"];
export const ATTENDANCE_STATUS_OPTIONS = ["Attended", "Absent", "Registered"];
export const ATTENDANCE_DETAILS_OPTIONS = [
  "Late Comers",
  "Rejoin",
  "Drop Offs",
  "New Seekers",
];
export const JOIN_MODE_OPTIONS = ["Self", "Others"];

export const MODAL_TITLES = {
  FILTER_OPTIONS: "Filter Options",
  AGE: "Age",
  REGISTRATION_TYPE: "Registration Type",
  GENDER: "Gender",
  PLATFORM: "Platform",
  VERIFICATION: "Verification",
  ATTENDANCE_STATUS: "Attendance Status",
  ATTENDANCE_DETAILS: "Attendance Details",
  JOIN_MODE: "Join Mode",
  LOCATION: "Location",
  REGISTRATION_STATUS: "Registration Status",
};

export const BUTTON_TEXT = {
  CLEAR: "Clear",
  APPLY: "Apply",
};

export const AGGREGATE_KPI_TEXT = {
  // LATECOMERS: "Late comer(s)",
  // JOINEDALONE:"Joined alone",
  // VERIFEDSEEKERS: "Verified seeker(s)",
  // DROPOFFS: "Drop off(s)",
  // JOINEDWITHOTHERS: "Joined with others",
  // NOTVERIFIEDSEEKER: "Non verified seeker(s)"
  SESSIONS: "Sessions",
  TOTALAUIDENCE: "Total Audience",
  REGISTRATION_ATTENDANCE: "Reg. Attendances",
  LATECOMERS: "lateComer",
  DROPOFFS: "Drop off(s)",
  ABSENTEES: "Absentees",
  NEWJOINERS: "New joining",
  JOINEDWITHOTHERS: "Joined with others",
  NOTUTILISEDVIDEO: "Not Utilised Video",
  VERIFIEDSEEKRS: "Verified seekers",
  NOTVERIFIEDSEEKERS: "Not verified seekers",
  JOINALONE: "Joined alone",
};

export const KPI_TEXT = {
  SESSIONS: "Session(s)",
  TOTALAUIDENCE: "Total Audience",
  REGISTRATION_ATTENDANCE: "Reg. Attendance(s)",
  LATECOMERS: "Late Comer(s)",
  DROPOFFS: "Drop off(s)",
  ABSENTEES: "Absentee",
  NEWJOINERS: "New joiner(s)",
  JOINEDWITHOTHERS: "Joined with other(s)",
  NOTUTILISEDVIDEO: "Not Utilised Video",
  VERIFIEDSEEKRS: "Verified seeker(s)",
  NOTVERIFIEDSEEKERS: "Not verified seeker(s)",
  JOINALONE: "Joined alone",
};
export const LOCATIONS = [
  { value: "Hyderabad", label: "Hyderabad" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Delhi", label: "Delhi" },
  { value: "Bangalore", label: "Bangalore" },
  { value: "Chennai", label: "Chennai" },
  { value: "Kolkata", label: "Kolkata" },
  { value: "Pune", label: "Pune" },
  { value: "Ahmedabad", label: "Ahmedabad" },
  { value: "Jaipur", label: "Jaipur" },
  { value: "Surat", label: "Surat" },
  { value: "Lucknow", label: "Lucknow" },
  { value: "Kanpur", label: "Kanpur" },
  { value: "Nagpur", label: "Nagpur" },
  { value: "Patna", label: "Patna" },
  { value: "Indore", label: "Indore" },
  { value: "Bhopal", label: "Bhopal" },
  { value: "Vadodara", label: "Vadodara" },
  { value: "Ludhiana", label: "Ludhiana" },
  { value: "Agra", label: "Agra" },
  { value: "Varanasi", label: "Varanasi" },
  { value: "Amritsar", label: "Amritsar" },
  { value: "Coimbatore", label: "Coimbatore" },
  { value: "Thiruvananthapuram", label: "Thiruvananthapuram" },
  { value: "Guwahati", label: "Guwahati" },
  { value: "Ranchi", label: "Ranchi" },
  { value: "Other", label: "Other" },
];

export const textConstants = {
  countryCode: "IN",
  withoutVerificationText: "mark attendance without verification",
  withoutVerificationTextStatus: "marked attendance without verification",
  skipFaceVerificationStatus: "attendance marked but not verified",
  attendanceText: "marked attendance with verification",
  markAttendanceWithFace: "with Face ID verification",
  markAttendanceWithoutFace: "without Face ID verification",
  markAttendanceWithOtp: "mark attendance using OTP",
  usingFaceId: "verify using Face ID",
  usingOtp: "verify using OTP",
  usingSkip: "skip for now",
  invalidCodeFirebaseText: "auth/invalid-verification-code",
  sessionExpiredFirebaseText: "auth/code-expired",
  code39: "auth/error-code:-39",
  invalidCodeText: "Invalid OTP. Please enter the one we sent",
  sessionCodeText: "The OTP has expired. Tap 'resend OTP' to get a new one",
  code39Text: "The OTP has expired. Tap 'resend OTP' to get a new one",
  unableValidateFace: "Sorry, we are unable to validate your Face ID",
  cameraNotAccess: "Error accessing the camera, please allow camera access",
  largeImageFile:
    "Image is too large even after compression. Please try again.",
  unableCaptureImage: "Error: Unable to capture image.",
  multipleFaceDetected: "Multiple faces detected",
  deviceSettingAccess:
    "We couldn't access your camera. Please check your device settings or login using different device",
  loginfailedFace: "Login failed, please try with OTP",
  skipNowText: "skip for now",
  tryAgainText: "try again",
  okayText: "okay",
  askFaceSetUp: "Please setup your Face ID",
  faceNotMatch: "Face ID did not match",
  faceMatch: "Successfully updated",
  infinipathRedirectText:
    "Please wait, you are being redirected to infinipath…",
  faceMatchesExist: "Face ID matches with existing an Face ID",
  unableToSetFaceId: "Sorry, we are unable to setup your Face ID",
  skipUnverifiedText: "By clicking skip, you will be marked as ‘unverified’",
  errorText: "Error",
  succesText: "Success",
  unsubscribeText: "Verify your mobile number to delete account",
  unsubscribeMobileText: "Registered mobile number",
  confirmOtpText: "Confirm OTP",
  didntReceiveText: "Didn't receive an OTP?",
  stayTunedText: "Stay tuned for further updates",
  phoneNumberErrorText: "Please enter valid mobile number",
  verifiedSuccessText: "Member verified successfully",
  updatedSuccessfully: "Successfully updated the data",
  joinAsGroupText: "joining as a group",
  joinAloneText: "joining alone",
  myGroupMembersText: "My group members",
  myGroupText: "MY GROUP",
  unableToFindSeekers: "Unable to find seeker",
  searchSeekerPlaceholder: "search seekers",
  changeMobileText: "change your mobile number",
  signInWithface: "Sign in with Face ID if you have already set it up",
  setUpFace: "setup my Face ID",
  enterOtpSentText: "Enter the OTP sent to",
  markAttandanceAndJoin: "mark attendance and join",
  meetingJoin: "join",
  signInWithOtp: "sign in using OTP",
  mobileNumber: "Mobile number",
  deleteAccount: "Delete account",
  termsText: "Terms & Conditions",
  privacyText: "Privacy Policy",
  updateProfile: "Update profile",
  withVerification: "with verification",
  withoutVerification: "without verification",
  sectionListText:
    "This section lists friends/family you've added to your group",
  login: "login",
  joinEnableText: "Join button will be enabled here at",
  countryDefault: "IN",
  serverError: "server_error",
  setUpFaceIdText:
    "Set up your Face ID in the profile session for verifying attendance",
  areYouSureText: "Are you sure you want to remove",
  fromList: "from your list?",
  faceIdNotSetUp: "Face ID is not set up",
  friendsSectionHeading:
    "This section lists friends/family you've added to your group",
  invitePendingHeading: "INVITE PENDING",
  mahatriaRole: "mahatria",
  adminRole: "admin",
  joinInfinipathText: "join infinipath",
  addMembersText: "add new member",
  areYouSureToDelete: "Are you sure you want to continue?",
  noInternet: "Oh no! No internet connection",
  notWorkingText: "We’re sorry, something is not working here",
  retryText: "retry",
  byDeletingAccountText: "Deleting your account will revoke",
  deleteAccountText:
    "access to infinipath and all infinitheism apps (if installed), including your data, progress, and access to exclusive content",
  catchErrorMessage: "Unable to process your request",
  howToVerify: "How do you want to verify?",
  signInusingEmail: "Having trouble?",
  signInusingEmailText: "sign in with your email to get OTP.",
  signInUsingMobile: "Having trouble?",
  signInUsingMobileText: "sign in with your mobile number to get OTP.",
  changeEmailText: "change your email",
  attemptsCompleted: "Your attempts are completed. Please try again.",
  getOtpEmail: "get OTP on email",
  getOtpMobile: "get OTP on mobile",
  paymentConfirmText: "Are you sure that payment is received?",
  resendInvoiceText: "re-send invoice",
  markAsPaymentText: "mark as payment received",
  confirmationTitle: "Confirm the status!"
};

export const KPITYPE = {
  "Drop off(s)": {
    label: "Drop Off count",
    value: "dropOffCount",
  },
  others: {
    label: "Join with others count",
    value: "joinWithOthers",
  },
  "New joining": {
    label: "Webinar Date",
    value: "webinarDate",
  },
  "Reg. Attendances": {
    label: "webinar Attendances count",
    value: "webinarsAttended",
  },
  "Late comers": {
    label: "Late comers count",
    value: "lateComersCount",
  },
  Absentees: {
    label: "Absentees count",
    value: "absenteesCount",
  },
  "Joined with others": {
    label: "Joined with others count",
    value: "joinWithOthersCount",
  },
  "Not Utilised Video": {
    label: "Not Utilised Video count",
    value: "NotUtilisedVideo",
  },
  "Verified Seekers": {
    label: "Verified Seekers count",
    value: "faceVerificationTrueCount",
  },
  "Not Verified Seekers": {
    label: "Not Verified Seekers count",
    value: "faceVerificationFalseCount",
  },
  "Total Audience": {
    label: "Audience",
    value: "totalAudienceCount",
  },
  Sessions: {
    label: "Sessions count",
    value: "sessionsCount",
  },
};

export const mockData = [
  {
    id: 1,
    name: "session 1",
  },
  {
    id: 2,
    name: "session 2",
  },
  {
    id: 3,
    name: "session 3",
  },
  {
    id: 4,
    name: "session 4",
  },
  {
    id: 5,
    name: "session 5",
  },
];

// Update the TABS constant to match NESTEDTAB values
export const questionTabs = {
  draft: "drafts", // Changed from 'Draft' to 'drafts' to match NESTEDTAB
  published: "published",
};

// Add these constants for question status
export const questionStatus = {
  draft: "draft",
  published: "published",
};

// Add this constant for question types
export const typeOptions = [
  { value: "text", label: "Text" },
  { value: "Tel", label: "Telephone" },
  { value: "DOB", label: "Date of birth" },
  { value: "email", label: "Email" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "dropdown", label: "Dropdown" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "file", label: "File" },
  { value: "textarea", label: "Textarea" },
  // { value: "location", label: "Location" },
];

// Add this constant for question types
export const typeConfigMap: Record<string, string[]> = {
  text: [
    "placeholder",
    "minChars",
    "maxChars",
    "validationRule",
    "isMandatory",
    "isDisabled",
  ],
  textarea: [
    "placeholder",
    "minChars",
    "maxChars",
    "validationRule",
    "isMandatory",
    "isDisabled",
  ],
  number: ["minValue", "maxValue", "isMandatory", "isDisabled"],
  date: ["isMandatory", "isDisabled"],
  file: ["isMandatory", "isDisabled"],
  radio: ["enableOtherOption", "isMandatory", "isDisabled"],
  checkbox: ["displayLabel", "enableOtherOption", "isMandatory", "isDisabled"],
  dropdown: ["displayLabel", "isMandatory", "isDisabled"],
  rating: ["displayLabel", "minValue", "maxValue", "isDisabled"],
  "select box with text box": [
    "displayLabel",
    "isMandatory",
    "validationRule",
    "isDisabled",
  ],
  // location: ["displayLabel", "isMandatory"],
  DOB: ["displayLabel", "isMandatory", "isDisabled"],
  email: ["displayLabel", "isMandatory", "isDisabled"],
  Tel: ["displayLabel", "isMandatory", "isDisabled"],
};

// Add validation rule options near your other options constants
export const validationRuleOptions = [
  { value: "onlyNumbers", label: "Only Numbers" },
  { value: "onlyCharacters", label: "Only Characters" },
  {
    value: "alphaNumericWithSpecialChars",
    label: "Alpha Numeric With Special Characters",
  },
  { value: "alphanumeric", label: "Alpha numeric Characters" },
];

// Predefined type options
// export const optionTypeOptions = useMemo(
//   () => [
//     { value: "string", label: "String" },
//     { value: "number", label: "Number" },
//     { value: "boolean", label: "Boolean" },
//   ],
//   [],
// );

export const optionTypeOptions = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
];

export const PLATFORMMAPPING = {
  Portal: { displayName: "Portal", value: "portal" },
  DirectLinks: { displayName: "Direct Links", value: "directlinks" },
  iOS: { displayName: "iOS", value: "ios" },
  Android: { displayName: "Android", value: "android" },
};

export const NO_SESSIONS_DATA = {
  Internal: "No internal sessions",
  External: "No external sessions",
  Drafts: "No draft sessions",
  Published: "No published sessions",
  Completed: "No completed sessions",
};

export const stateGstCodes = [
  { code: '01', state: 'JK', stateName: 'Jammu and Kashmir' },
  { code: '01', state: 'JK', stateName: 'Jammu & Kashmir' },
  { code: '02', state: 'HP', stateName: 'Himachal Pradesh' },
  { code: '03', state: 'PB', stateName: 'Punjab' },
  { code: '04', state: 'CH', stateName: 'Chandigarh' },
  { code: '05', state: 'UK', stateName: 'Uttarakhand' },
  { code: '06', state: 'HR', stateName: 'Haryana' },
  { code: '07', state: 'DL', stateName: 'Delhi' },
  { code: '08', state: 'RJ', stateName: 'Rajasthan' },
  { code: '09', state: 'UP', stateName: 'Uttar Pradesh' },
  { code: '10', state: 'BR', stateName: 'Bihar' },
  { code: '11', state: 'SK', stateName: 'Sikkim' },
  { code: '12', state: 'AR', stateName: 'Arunachal Pradesh' },
  { code: '13', state: 'NL', stateName: 'Nagaland' },
  { code: '14', state: 'MN', stateName: 'Manipur' },
  { code: '15', state: 'MZ', stateName: 'Mizoram' },
  { code: '16', state: 'TR', stateName: 'Tripura' },
  { code: '17', state: 'ML', stateName: 'Meghalaya' },
  { code: '18', state: 'AS', stateName: 'Assam' },
  { code: '19', state: 'WB', stateName: 'West Bengal' },
  { code: '20', state: 'JH', stateName: 'Jharkhand' },
  { code: '21', state: 'OD', stateName: 'Odisha' },
  { code: '22', state: 'CT', stateName: 'Chhattisgarh' },
  { code: '22', state: 'CT', stateName: 'Chattisgarh' },
  { code: '23', state: 'MP', stateName: 'Madhya Pradesh' },
  { code: '24', state: 'GJ', stateName: 'Gujarat' },
  { code: '26', state: 'DD',  stateName: 'Dadra and Nagar Haveli and Daman and Diu'},
  { code: '26', state: 'DD', stateName: 'Dadra & Nagar Haveli'},
  { code: '27', state: 'MH', stateName: 'Maharashtra' },
  { code: '29', state: 'KA', stateName: 'Karnataka' },
  { code: '30', state: 'GA', stateName: 'Goa' },
  { code: '31', state: 'LD', stateName: 'Lakshadweep' },
  { code: '32', state: 'KL', stateName: 'Kerala' },
  { code: '33', state: 'TN', stateName: 'Tamil Nadu' },
  { code: '34', state: 'PY', stateName: 'Puducherry' },
  { code: '34', state: 'PY', stateName: 'Pondicherry' },
  { code: '35', state: 'AN', stateName: 'Andaman & Nicobar' },
  { code: '35', state: 'AN', stateName: 'Andaman and Nicobar Islands' },
  { code: '36', state: 'TG', stateName: 'Telangana' },
  { code: '37', state: 'AP', stateName: 'Andhra Pradesh' },
  { code: '38', state: 'LA', stateName: 'Ladakh' },
  { code: '97', state: 'OT', stateName: 'Other Territory' },
  { code: '99', state: 'CJ', stateName: 'Centre Jurisdiction' },
];

export const FORM_JSON = {
  basic_details: [
    {
      id: 328,
      label: "Full Name",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 2,
        maxCharacters: 100,
        conditionalFields: [],
        validationPattern: "^[a-zA-Z\\s\\.]+$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 329,
      label: "Gender",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: null,
        validationPattern: null,
      },
      status: "published",
      type: "radio",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [
        {
          id: 59,
          option: {
            id: 67,
            name: "female",
            type: "string",
            status: "published",
          },
        },
        {
          id: 60,
          option: {
            id: 68,
            name: "other",
            type: "string",
            status: "published",
          },
        },
        {
          id: 61,
          option: {
            id: 69,
            name: "prefer not to say",
            type: "string",
            status: "published",
          },
        },
        {
          id: 58,
          option: {
            id: 66,
            name: "male",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 330,
      label: "Mobile Number",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 10,
        maxCharacters: 15,
        conditionalFields: [],
        validationPattern: "^[0-9+\\-\\s\\(\\)]+$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 331,
      label: "Email Address",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 5,
        maxCharacters: 100,
        conditionalFields: [],
        validationPattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      },
      status: "published",
      type: "email",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 332,
      label: "Date of Birth",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "date",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 333,
      label: "Infinitheism Contact",
      config: {
        type: "select",
        endPoint: "user?filters=%7B%22role%22%3A%20%221%22%7D",
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "apicall",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 334,
      label: "City",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 2,
        maxCharacters: 50,
        conditionalFields: [],
        validationPattern: "^[a-zA-Z\\s]+$",
      },
      status: "published",
      type: "select",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [
        {
          id: 111,
          option: {
            id: 115,
            name: "Other",
            type: "string",
            status: "published",
          },
        },
        {
          id: 87,
          option: {
            id: 91,
            name: "Hyderabad",
            type: "string",
            status: "published",
          },
        },
        {
          id: 88,
          option: {
            id: 92,
            name: "Mumbai",
            type: "string",
            status: "published",
          },
        },
        {
          id: 89,
          option: {
            id: 93,
            name: "Delhi",
            type: "string",
            status: "published",
          },
        },
        {
          id: 90,
          option: {
            id: 94,
            name: "Bangalore",
            type: "string",
            status: "published",
          },
        },
        {
          id: 91,
          option: {
            id: 95,
            name: "Kolkata",
            type: "string",
            status: "published",
          },
        },
        {
          id: 92,
          option: {
            id: 96,
            name: "Pune",
            type: "string",
            status: "published",
          },
        },
        {
          id: 93,
          option: {
            id: 97,
            name: "Ahmedabad",
            type: "string",
            status: "published",
          },
        },
        {
          id: 94,
          option: {
            id: 98,
            name: "Jaipur",
            type: "string",
            status: "published",
          },
        },
        {
          id: 95,
          option: {
            id: 99,
            name: "Surat",
            type: "string",
            status: "published",
          },
        },
        {
          id: 96,
          option: {
            id: 100,
            name: "Lucknow",
            type: "string",
            status: "published",
          },
        },
        {
          id: 97,
          option: {
            id: 101,
            name: "Kanpur",
            type: "string",
            status: "published",
          },
        },
        {
          id: 98,
          option: {
            id: 102,
            name: "Nagpur",
            type: "string",
            status: "published",
          },
        },
        {
          id: 99,
          option: {
            id: 103,
            name: "Patna",
            type: "string",
            status: "published",
          },
        },
        {
          id: 100,
          option: {
            id: 104,
            name: "Indore",
            type: "string",
            status: "published",
          },
        },
        {
          id: 101,
          option: {
            id: 105,
            name: "Bhopal",
            type: "string",
            status: "published",
          },
        },
        {
          id: 102,
          option: {
            id: 106,
            name: "Vadodara",
            type: "string",
            status: "published",
          },
        },
        {
          id: 103,
          option: {
            id: 107,
            name: "Ludhiana",
            type: "string",
            status: "published",
          },
        },
        {
          id: 104,
          option: {
            id: 108,
            name: "Agra",
            type: "string",
            status: "published",
          },
        },
        {
          id: 105,
          option: {
            id: 109,
            name: "Varanasi",
            type: "string",
            status: "published",
          },
        },
        {
          id: 106,
          option: {
            id: 110,
            name: "Amritsar",
            type: "string",
            status: "published",
          },
        },
        {
          id: 107,
          option: {
            id: 111,
            name: "Coimbatore",
            type: "string",
            status: "published",
          },
        },
        {
          id: 108,
          option: {
            id: 112,
            name: "Thiruvananthapuram",
            type: "string",
            status: "published",
          },
        },
        {
          id: 109,
          option: {
            id: 113,
            name: "Guwahati",
            type: "string",
            status: "published",
          },
        },
        {
          id: 110,
          option: {
            id: 114,
            name: "Ranchi",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 335,
      label: "Preferred Roommate's Name",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: false,
        minCharacter: 2,
        maxCharacters: 50,
        conditionalFields: [],
        validationPattern: "^[a-zA-Z\\s]+$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 336,
      label: "Notes",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: false,
        minCharacter: 0,
        maxCharacters: 500,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "textarea",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 337,
      label: "Terms and Conditions",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "checkbox",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [
        {
          id: 113,
          option: {
            id: 70,
            name: "yes",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 363,
      label: "Session Attendance Confirmation",
      config: {
        required: true,
      },
      status: "published",
      type: "boolean",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [
        {
          id: 82,
          option: {
            id: 70,
            name: "yes",
            type: "string",
            status: "published",
          },
        },
        {
          id: 83,
          option: {
            id: 71,
            name: "no",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 364,
      label: "Program Duration",
      config: {
        required: false,
      },
      status: "published",
      type: "text",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 365,
      label: "Program Frequency",
      config: {
        required: false,
      },
      status: "published",
      type: "text",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 367,
      label: "Emergency Contact Name",
      config: {
        required: true,
      },
      status: "published",
      type: "text",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 368,
      label: "Emergency Contact Number",
      config: {
        required: true,
      },
      status: "published",
      type: "text",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [],
    },
    {
      id: 369,
      label: "Preferred Language",
      config: {
        required: false,
      },
      status: "published",
      type: "select",
      formSection: {
        id: 1,
        name: "Basic Details",
        description: "Section for basic user details",
      },
      questionOptionMaps: [
        {
          id: 86,
          option: {
            id: 90,
            name: "Tamil",
            type: "string",
            status: "published",
          },
        },
        {
          id: 85,
          option: {
            id: 89,
            name: "Hindi",
            type: "string",
            status: "published",
          },
        },
        {
          id: 84,
          option: {
            id: 88,
            name: "English",
            type: "string",
            status: "published",
          },
        },
      ],
    },
  ],
  invoice_details: [
    {
      id: 338,
      label: "Name for Invoice",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 2,
        maxCharacters: 100,
        conditionalFields: [],
        validationPattern: "^[a-zA-Z\\s\\.]+$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [],
    },
    {
      id: 339,
      label: "Email Address for Invoice",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 5,
        maxCharacters: 100,
        conditionalFields: [],
        validationPattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      },
      status: "published",
      type: "email",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [],
    },
    {
      id: 340,
      label: "Registered under Indian GST",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "radio",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [
        {
          id: 62,
          option: {
            id: 70,
            name: "yes",
            type: "string",
            status: "published",
          },
        },
        {
          id: 63,
          option: {
            id: 71,
            name: "no",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 341,
      label: "Address for Invoice",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 10,
        maxCharacters: 300,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "textarea",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [],
    },
    {
      id: 342,
      label: "TDS Applicable",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "radio",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [
        {
          id: 64,
          option: {
            id: 70,
            name: "yes",
            type: "string",
            status: "published",
          },
        },
        {
          id: 65,
          option: {
            id: 71,
            name: "no",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 343,
      label: "TAN Number",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: false,
        minCharacter: 10,
        maxCharacters: 10,
        conditionalFields: [],
        validationPattern: "^[A-Z]{4}[0-9]{5}[A-Z]{1}$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [],
    },
    {
      id: 344,
      label: "Payment Method",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "radio",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [
        {
          id: 66,
          option: {
            id: 72,
            name: "online",
            type: "string",
            status: "published",
          },
        },
        {
          id: 67,
          option: {
            id: 73,
            name: "offline",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 345,
      label: "Amount",
      config: {
        maxValue: 1000000,
        minValue: 1,
        dependsOn: [],
        isRequired: true,
        minCharacter: 1,
        maxCharacters: 10,
        conditionalFields: [],
        validationPattern: "^[0-9]+(\\.[0-9]{1,2})?$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [],
    },
    {
      id: 346,
      label: "Handover Date",
      config: {},
      status: "published",
      type: "date",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [],
    },
    {
      id: 347,
      label: "Handover To",
      config: {},
      status: "published",
      type: "text",
      formSection: {
        id: 2,
        name: "Invoice",
        description: "Section for invoice information",
      },
      questionOptionMaps: [],
    },
  ],
  travel_details: [
    {
      id: 348,
      label: "ID Type",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "select",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [
        {
          id: 68,
          option: {
            id: 74,
            name: "passport",
            type: "string",
            status: "published",
          },
        },
        {
          id: 72,
          option: {
            id: 78,
            name: "pan_card",
            type: "string",
            status: "published",
          },
        },
        {
          id: 71,
          option: {
            id: 77,
            name: "voter_id",
            type: "string",
            status: "published",
          },
        },
        {
          id: 70,
          option: {
            id: 76,
            name: "driving_license",
            type: "string",
            status: "published",
          },
        },
        {
          id: 69,
          option: {
            id: 75,
            name: "aadhar",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 349,
      label: "ID Number",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: 5,
        maxCharacters: 20,
        conditionalFields: [],
        validationPattern: "^[A-Z0-9]+$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 350,
      label: "ID Picture",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: "",
      },
      status: "published",
      type: "file",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 351,
      label: "Your Picture",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "file",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 352,
      label: "T-Shirt Size",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: true,
        minCharacter: null,
        maxCharacters: null,
        conditionalFields: [],
        validationPattern: null,
      },
      status: "published",
      type: "select",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [
        {
          id: 79,
          option: {
            id: 85,
            name: "XXXL",
            type: "string",
            status: "published",
          },
        },
        {
          id: 73,
          option: {
            id: 79,
            name: "XS",
            type: "string",
            status: "published",
          },
        },
        {
          id: 74,
          option: {
            id: 80,
            name: "S",
            type: "string",
            status: "published",
          },
        },
        {
          id: 75,
          option: {
            id: 81,
            name: "M",
            type: "string",
            status: "published",
          },
        },
        {
          id: 76,
          option: {
            id: 82,
            name: "L",
            type: "string",
            status: "published",
          },
        },
        {
          id: 77,
          option: {
            id: 83,
            name: "XL",
            type: "string",
            status: "published",
          },
        },
        {
          id: 78,
          option: {
            id: 84,
            name: "XXL",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 353,
      label: "Travel Details: Update Now/Later",
      config: {},
      status: "published",
      type: "radio",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [
        {
          id: 81,
          option: {
            id: 87,
            name: "later",
            type: "string",
            status: "published",
          },
        },
        {
          id: 80,
          option: {
            id: 86,
            name: "now",
            type: "string",
            status: "published",
          },
        },
      ],
    },
    {
      id: 354,
      label: "Flight: Airline Name",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: false,
        minCharacter: 2,
        maxCharacters: 50,
        conditionalFields: [],
        validationPattern: "^[a-zA-Z\\s]+$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 355,
      label: "Flight: Flight Number",
      config: {
        maxValue: null,
        minValue: null,
        dependsOn: [],
        isRequired: false,
        minCharacter: 3,
        maxCharacters: 10,
        conditionalFields: [],
        validationPattern: "^[A-Z0-9\\-]+$",
      },
      status: "published",
      type: "text",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 356,
      label: "Flight: Arrival Date & Time",
      config: {},
      status: "published",
      type: "date",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 357,
      label: "Flight: Coming From",
      config: {},
      status: "published",
      type: "text",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 358,
      label: "Flight: Airport Pick-up Time",
      config: {},
      status: "published",
      type: "time",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 359,
      label: "Own Transport: Check-in Time",
      config: {},
      status: "published",
      type: "time",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 360,
      label: "Own Transport: Check-in Location",
      config: {},
      status: "published",
      type: "text",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 361,
      label: "City Pickup: Time",
      config: {},
      status: "published",
      type: "time",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
    {
      id: 362,
      label: "City Pickup: Location",
      config: {},
      status: "published",
      type: "text",
      formSection: {
        id: 3,
        name: "Travel Plan & Goodies",
        description: "Section for travel plan details",
      },
      questionOptionMaps: [],
    },
  ],
};

export const PENDING_APPROVAL = "pending_approval";
export const WAIT_LIST = "waitlisted";
export const STATIC_FILTERS = [
  {
    key: "gender",
    label: "Gender",
    type: "checkbox",
    options: [
      { label: "Male", value: "male", checked: true },
      { label: "Female", value: "female", checked: false },
    ],
  },
  {
    key: "age_groups",
    label: "Age",
    type: "checkbox",
    options: [
      { label: "Age (below 20)", value: "below_20", checked: false },
      { label: "Age (20 - 30)", value: "20_30", checked: false },
      { label: "Age (30 - 40)", value: "30_40", checked: false },
      { label: "Age (40 - 50)", value: "40_50", checked: false },
      { label: "Age (50+)", value: "50_plus", checked: false },
    ],
  },

  {
    key: "no_of_hdbs",
    label: "No of HDBs",
    type: "multi", // custom type for your UI to render dropdown + input
    options: [
      { label: ">", value: ">" },
      { label: ">=", value: ">=" },
      { label: "<", value: "<" },
      { label: "<=", value: "<=" },
    ],
    input: {
      type: "number",
      placeholder: "Enter number",
      min: 0,
    },
  },
  {
    key: "locations",
    label: "Location",
    type: "checkbox",
    options: [
      { label: "Chennai", value: "chennai", checked: false },
      { label: "Bangalore", value: "bangalore", checked: false },
      { label: "Ahmedabad", value: "Ahmedabad", checked: false },
      { label: "Hyderabad", value: "hyderabad", checked: false },
      { label: "Pune", value: "Pune", checked: false },
    ],
  },
  {
    key: "payment_status",
    label: "Payment Status",
    type: "checkbox",
    options: [
      { label: "Completed", value: "completed", checked: false },
      { label: "Pending", value: "pending", checked: false },
      { label: "Failed", value: "failed", checked: false },
    ],
  },
  {
    key: "invoice_status",
    label: "Invoice Status",
    type: "checkbox",
    options: [
      { label: "Completed", value: "completed", checked: false },
      { label: "Pending", value: "pending", checked: false },
      { label: "Failed", value: "failed", checked: false },
    ],
  },
  {
    key: "travel_plan",
    label: "Travel Plan",
    type: "checkbox",
    options: [
      { label: "Completed", value: "completed", checked: false },
      { label: "Pending", value: "pending", checked: false },
    ],
  },
  {
    key: "swap_request",
    label: "Swap Requests",
    type: "checkbox",
    options: [
      { label: "Can Shift", value: "canShift", checked: false },
      { label: "Wants Swap", value: "wantsSwap", checked: false },
    ],
  },
];

export const statsData = [
  { value: 196, label: "Registered" },
  { value: 18, label: "HBD 1" },
  { value: 12, label: "HBD 2" },
  { value: "00", label: "HBD 3" },
  { value: 26, label: "MSD 1" },
  { value: 3, label: "MSD 2" },
  { value: 7, label: "YTD" },
  { value: 10, label: "On Hold" },
];

export const mockDataForUser = [
  {
    seekerName: "Anantha Lakshmi",
    profileUrl: "",
    location: "Bangalore",
    noOfHdbs: "03",
    status: "Registered",
    ratingByRm: "4.0",
    travelPlanStatus: "Planned",
    paymentStatus: "Completed",
    gender: "F",
    rmName: "Suresh Kumar",
  },
  {
    seekerName: "Ravi Teja",
    profileUrl: "",
    location: "Hyderabad",
    noOfHdbs: "01",
    status: "On Hold",
    ratingByRm: "3.5",
    travelPlanStatus: "Pending",
    paymentStatus: "Pending",
    gender: "M",
    rmName: "Lakshmi Narayan",
  },
  {
    seekerName: "Priya Sharma",
    profileUrl: "",
    location: "Chennai",
    noOfHdbs: "02",
    status: "Registered",
    ratingByRm: "4.8",
    travelPlanStatus: "Confirmed",
    paymentStatus: "Completed",
    gender: "F",
    rmName: "Meena Gupta",
  },
  {
    seekerName: "Vikram Singh",
    profileUrl: "",
    location: "Delhi",
    noOfHdbs: "04",
    status: "Rejected",
    ratingByRm: "2.0",
    travelPlanStatus: "Cancelled",
    paymentStatus: "Refunded",
    gender: "M",
    rmName: "Ramesh Babu",
  },
  {
    seekerName: "Sunita Rao",
    profileUrl: "",
    location: "Mumbai",
    noOfHdbs: "05",
    status: "Registered",
    ratingByRm: "4.5",
    travelPlanStatus: "Planned",
    paymentStatus: "Completed",
    gender: "F",
    rmName: "Anjali Menon",
  },
  {
    seekerName: "Kiran Kumar",
    profileUrl: "",
    location: "Pune",
    noOfHdbs: "02",
    status: "On Hold",
    ratingByRm: "3.0",
    travelPlanStatus: "Pending",
    paymentStatus: "Pending",
    gender: "M",
    rmName: "Suresh Kumar",
  },
  {
    seekerName: "Meena Iyer",
    profileUrl: "",
    location: "Kolkata",
    noOfHdbs: "01",
    status: "Registered",
    ratingByRm: "4.2",
    travelPlanStatus: "Confirmed",
    paymentStatus: "Completed",
    gender: "F",
    rmName: "Lakshmi Narayan",
  },
  {
    seekerName: "Arjun Reddy",
    profileUrl: "",
    location: "Bangalore",
    noOfHdbs: "03",
    status: "Registered",
    ratingByRm: "2.5",
    travelPlanStatus: "Planned",
    paymentStatus: "Completed",
    gender: "M",
    rmName: "Meena Gupta",
  },
  {
    seekerName: "Divya Patel",
    profileUrl: "",
    location: "Ahmedabad",
    noOfHdbs: "02",
    status: "Rejected",
    ratingByRm: "3.8",
    travelPlanStatus: "Cancelled",
    paymentStatus: "Refunded",
    gender: "F",
    rmName: "Ramesh Babu",
  },
  {
    seekerName: "Sanjay Das",
    profileUrl: "",
    location: "Kolkata",
    noOfHdbs: "01",
    status: "Registered",
    ratingByRm: "4.9",
    travelPlanStatus: "Confirmed",
    paymentStatus: "Completed",
    gender: "M",
    rmName: "Anjali Menon",
  },
];

export const swapTypeOptions = [
  { value: "wants_swap" as const, label: "wants swap" },
  { value: "can_shift" as const, label: "can shift" },
];
export const tab = [
  "All",
  "Seats",
  "Payments",
  "Invoices",
  "Travel & Goodies",
  "Rooms",
];
export const programOptions = [
  { value: "HDB_1", label: "HDB 1" },
  { value: "HDB_2", label: "HDB 2" },
  { value: "HDB_3", label: "HDB 3" },
  { value: "MSD_1", label: "MSD 1" },
  { value: "MSD_new", label: "MSD_new" },
];

export const RATING_KEYS = [
  { label: "Current year's rating", key: "overall", rm_display_name: "RM rating" },
];

export const TEXT_CONSTANTS = {
  NO_DATA: "No data",
  LOCATION_INSIGHTS_TITLE: "Location Insights",
};

export const CHART_COLORS = {
  SNAPSHOT_BLESSED: "#00B0A2",
  SNAPSHOT_REGISTRATIONS: "#8F83FF",
  LOCATION_INSIGHTS: "#40CEFF",
  INVOICE_COMPLETED: "#FFCB29",
  INVOICE_PENDING: "#E9EAEB",
};
export const DASHBOARD_KEYS = {
  PROGRAM_REGISTRATIONS: "programRegistrations",
  DEMOGRAPHICS: "demographics",
  BLESSED_SEEKERS: "blessedSeekers",
  PREFERRED_VS_BLESSED: "preferredVsBlessed",
  DETAILED_DATA: "detailedData",
  PROGRAM_APPROVAL_STATUS: "programApprovalStatus",
  YET_TO_REVIEW: "ratings",
  INVOICE_STATUS: "invoiceStatus",
  LOCATION_INSIGHTS: "location",
  GOODIES_DATA:"goodiesData",
  GOODIES_TSHIRT_DATA:"goodiesTshirt",
GOODIES_JACKET_DATA:"goodiesJacket",
};

export const FACIAL_RECOGNITION = false;
export const errorMessages = {
  firstNameRequired: "Please enter your First name",
  firstNameInvalid: "First name must not contain numbers or special characters",
  firstNameMaxLength: "First name must not exceed 30 characters",
  lastNameRequired: "Please enter your Last name",
  lastNameInvalid: "Last name must not contain numbers or special characters",
  lastNameMaxLength: "Last name must not exceed 30 characters",
  emailRequired: "Please enter your email address",
  emailInvalid: "Please enter a valid email address",
  cityRequired: "Please enter your Location",
  otherCityRequired: "Please enter Other city name",
  phoneRequired: "Please enter valid mobile number",
  phoneNumberNotMatch: "The entered mobile number does not match your account",
  dobRequired: "Date of birth is required",
  dobInvalid: "Please enter a valid Date of birth",
  dobAgeRange: "Age must be between 3 and 100 years",
  genderRequired: "Please select Gender",
  invalidEmail: "Please enter a valid email address",
};

export const LOGIN_TEXT = {
  WELCOME: {
    TEXT: "Welcome to",
  },
  FACE_ID: {
    CAPTION: "capture your face for",
    CAPTION_CONTINUE: "quick authentication",
    SETUP_CAPTION: "Setup Face ID for quick sign in?",
    BUTTONS: {
      SIGN_IN: "sign in using Face ID",
      SIGN_IN_OTP: "sign in using OTP",
      SETUP: "setup Face ID",
      SKIP: "skip for now",
    },
  },
  APP: {
    NAME: "infinipath",
  },
  MOBILE: {
    LABEL: "Mobile number*",
    ENTER_TEXT: "enter your mobile number",
  },
  EMAIL: {
    LABEL: "Email address*",
    ENTER_TEXT: "enter your email address",
  },
  OTP: {
    CONFIRM: "Confirm OTP",
    ENTER: "Enter the OTP sent to",
    CHANGE_MOBILE: "change your mobile number",
    VERIFY: "verify",
    DIDNT_RECEIVE: "Didn't receive?",
    RESEND: "resend OTP",
    RESENDIN: "resend OTP in",
  },
  ERRORS: {
    PHONE_REQUIRED: "Phone number is required",
    INVALID_PHONE: "Invalid phone number",
    USER_NOT_EXIST: "User does not exist, please",
    SIGN_UP: "sign up",
    FETCH_USER: "Failed to fetch user data, please try again later",
    SEND_OTP: "Failed to send the OTP, please try again later",
    UNABLE_TO_SENT: "Unable to send OTP",
    TOO_TEXT: "too",
    MANY_TEXT: "many",
    ERROR_SEND_OTP: "error sending otp",
  },
  BUTTONS: {
    GET_OTP: "get OTP",
    VERIFY: "verify",
  },
  SIGN_IN: {
    WITH_FACE: "sign in using face ID",
    CAPTION_NEW: "Quick & secure sign in with face ID",
  },
  OR: "or",
  CLICK: "Click here to",
  SKIP_FACE_VERIFY: "skipFaceVerify",
  LOGGED_IN: "loggedIn",
  YES: "yes",
  NO: "no",
  SEEKER_DETAILS: "seekerDetails",
  LOGO: "logo",
  SUBMIT: "submit",
  ICON: "icon",
  EMAILSIGNIN: "sign in using email",
  MOBILESIGNIN: "sign in using mobile",
  EMAILPLACEHOLDER: "abc@gmail.com",
} as const;

export enum RecommendationLevel {
  WHOLEHEARTEDLY = "Wholeheartedly",
  AFFIRMATIVELY = "Affirmatively",
  SUPPORTIVELY = "Supportively",
}
export const noData = "No data";

export const RECOMMENDATION_LABELS = {
  RM_REVIEW: "RM Review",
  SEEKER_RATINGS: "Seeker Ratings",
  ADD_REVIEW: "Add review and experience",
  UPDATE_REVIEW: "Update review and experience",
  NO_RATING: TEXT_CONSTANTS.NO_DATA || "No rating",
  OVERALL_RATING: "Overall rating is",
  RECOMMENDATIONS: "Recommendations",
  NOT_RECOMMENDED: "Not recommended",
  NO_COMMENT: "No recommendation comment provided",
};
export function pickUpTimings(
  date: string,
  type: string,
  allocatedProgram: any,
) {
  switch (type) {
    case "city pick up travelPlanOnward":
      return `City Pick-up Time: Buses will depart at 4:00 p.m. ${contentDateFormat(date)} from Ratnadeep, East Marredpally, Secunderabad. `;
    case "city drop travelPlanReturn":
      return `City Drop Time: 5:30 a.m. on ${contentDateFormat(date)} at Ratnadeep, East Marredpally, Secunderabad.`;
    case "own transport travelPlanOnward":
      return `Check-in Time: From ${extractTime(allocatedProgram?.checkinAt)} to  ${extractTime(allocatedProgram?.checkinEndsAt)} on ${contentDateFormat(date)}, at Leonia.`;
    case "own transport travelPlanReturn":
      return `Check-out Time: Latest by ${extractTime(allocatedProgram?.checkoutAt)} on ${contentDateFormat(date)}.`;
    case "flight travelPlanOnward":
      return `Airport Pick-up Time: Pick-up facility will be available at Hyderabad airport from 2:00 p.m. to 9:00 p.m. on  ${contentDateFormat(date)}.`;
    case "flight travelPlanReturn":
      return `Return Date: ${contentDateFormat(date)} Seeker can be dropped back at the Hyderabad airport earliest by 2:45 a.m.
Latest check out from Leonia will be 7:00 a.m.`;
    default:
      return "";
  }
}

export function getProgramKeys(bindingKey: string) {
  const programKeys = {
    "city pick up travelPlanOnward": "startsAt",
    "city drop travelPlanReturn": "endsAt",
    "own transport travelPlanOnward": "checkinAt",
    "own transport travelPlanReturn": "checkoutAt",
    "flight travelPlanOnward": "startsAt",
    "flight travelPlanReturn": "endsAt",
  };
  return programKeys[bindingKey] || "";
}

export const WARNING = "warning";
export const SUCCESS = "success";
export const ERROR = "error";
export const INFO = "info";
export const DEFAULT = "default";
export const CANCEL = "cancel";
export const CONFIRM = "confirm";
export const TOAST_CONFIG = {
  POSITIONS: {
    TOP_RIGHT: "top-right",
    BOTTOM_RIGHT: "bottom-right",
  },
  AUTO_CLOSE: {
    SHORT: 2500,
    LONG: 4000,
  },
  ICON_SIZE: {
    width: 40,
    height: 40,
  },
} as const;

export const WARNING_MESSAGES = {
  VIDEO_LENGTH_EXCEEDED: [
    "Your video is too long.",
    "Please upload one that’s 111 seconds or shorter.",
  ],
  VIDEO_SIZE_EXCEEDED: ["This video is too large.", "Try one under 50MB."],
  API_ERROR: ["This action didn’t go through. Please try again."],
  PAYMENT_ERROR: ["We couldn’t start the payment.Please try again."],
  PAYMNET_COMPLETED: ["Payment already completed."],
  SOMETHING_WENT_WRONG: ["Something went wrong.", "Try again in a moment."],
  FAILED_TO_EXTRACT: [
    "Something went wrong.",
    "Failed to extract details from the document.",
  ],
  UNSUPPORTED_FILE_TYPE: [
    "Unsupported file type. Please use JPG, PNG, or similar.",
  ],
  IMAGE_SIZE_EXCEEDED: ["This image is too large. Try one under 3MB."],
  IMAGE_PROCESSING_FAILED: [
    "We couldn't process your image right now.",
    "Please try a different one or reupload.",
  ],
  ALREADY_BLESSED: [
    "You already blessed for this program. Please fill payment details to proceed.",
  ],
  REJECTED: ["Your request has been placed with mahatria."],
  NOT_AUTHORIZED: [
    "You’re logged in with a different account.",
    "Please switch to the one used for this registration.",
  ],
  CAMERA_AUDIO_ACCESS_BLOCKED: [
    "Camera and audio access are blocked.",
    "Please allow access in your browser settings.",
  ],
  CAMERA_ACCESS_BLOCKED: [
    "Camera access is blocked.",
    "Please allow access in your browser settings.",
  ],
  AUDIO_ACCESS_BLOCKED: [
    "Audio access is blocked.",
    "Please allow access in your browser settings.",
  ],
  NO_VIDEO_RECORDED: ["No video recorded to submit."],
  PROFILE_UPDATE_FAILED: ["Failed to update profile."],
  UNSUPPORTED_VIDEO_TYPE: ["Unsupported file type. Please use video format."],
  REGISTRATION_CLOSED: ["The Registrations are closed."],
  REGISTRATION_NOT_OPENED: ["The Registrations are not opened."],
  SOMETHING_WENT_WRONG_TEXT: "Something went wrong, please try again.",
  PAIR_FAIL_TEXT: "Failed to pair, please try again.",
  SELECT_MAX_TWO_SEEKERS_TEXT: "You can select only two seekers to pair.",
};

export const CANCEL_REGISTRATION_CONSTANTS = {
  HEADER_TITLE: "Cancel Registration",

  LABELS: {
    REASON: "Reason",
    COMMENTS: "Comments",
  },

  BUTTON_TEXT: {
    CLEAR: "clear",
    SAVE: "save",
  },

  ALT_TEXT: {
    SEPARATOR_LINE: "separator line",
    CLOSE: "close",
    FOOTER_LINE: "footer line",
  },

  TEST_IDS: {
    SAVE_BUTTON: "cancel-overlay-save-button",
  },

  REASON_OPTIONS: [
    "Change of Plans",
    "Health Issues",
    "Work Commitments",
    "Family Emergency",
    "Scheduling Conflict",
    "Travel Issues",
  ],
} as const;

// String constants
export const AI_OVERLAY_STRINGS = {
  PLACEHOLDER: "Ask about seekers, programs or stats...",
  SPEAK_ALT: "Speak",
  SEARCH_ALT: "Search",
  LISTENING_MESSAGE: " Listening...",
  WELCOME_MESSAGE: "Explore the questions here.",
  VIEW_ALL_QUESTIONS: " view all questions",
  HEADER_TITLE: "infini AI",
  ERROR_MESSAGES:
    "Speech recognition is not supported in your browser. Please use a modern browser like Chrome, Edge, or Safari.",
  ASK_TITLE: "Ask infini AI",
  ASK_DESCRIPTION: "Get quick answers about seekers, programs, and stats.",
  APOLOGY_MESSAGE: "Sorry, something went wrong",
  DASHBOARD_TITLE: "List of registrations"
};
export const DOWNLOAD_OPTIONS = {
  options: [
    { value: "filtered", label: "Current filtered list" },
    { value: "all", label: "Complete registration list" },
    { value: "id-proofs", label: "Download ID proofs" },
  ],
};

// ID Proof Export Configuration
export const ID_PROOF_EXPORT = {
  POLLING_INTERVAL: 15000, // 15 seconds
  MAX_POLLING_TIME: 3600000, // 60 minutes
  PROGRESS_MILESTONES: [25, 50, 75] as const,
  LOCALSTORAGE_KEY: 'idProofExportJob',
  BULK_ID_PROOFS: 'BULK_ID_PROOFS',
  ID_PROOFS: 'id-proofs',
  STATUS: {
    PENDING: 'pending' as const,
    PROCESSING: 'processing' as const,
    COMPLETED: 'completed' as const,
    FAILED: 'failed' as const,
  },
} as const;

export const baseColors = [
  "#F59E0B", // orange (HDB)
  "#06B6D4", // blue (MSD)
  "#22C55E", // green (ENTRAINMENT)
  "#A21CAF", // purple (TAT)
  "#F43F5E", // pink
  "#F97316", // amber
  "#84CC16", // lime
  "#0EA5E9", // sky
  "#8B5CF6", // violet
  "#EAB308", // yellow
  "#D946EF", // fuchsia
  "#64748B", // slate
  "#F87171", // red
  "#10B981", // emerald
  "#6366F1", // indigo
  "#E11D48", // rose
  "#A3E635", // lime
  "#FACC15", // yellow
  "#F472B6", // pink
  "#38BDF8", // sky
  "#FBBF24", // amber
  "#34D399", // green
  "#818CF8", // indigo
  "#F59E42", // custom orange
  "#3B82F6", // blue
  "#F43F5E", // pink
  "#A21CAF", // purple
  "#22C55E", // green
  "#F59E0B", // orange
  "#06B6D4", // blue
  "#84CC16", // lime
  "#EAB308", // yellow
  "#D946EF", // fuchsia
  "#64748B", // slate
  "#F87171", // red
  "#10B981", // emerald
  "#6366F1", // indigo
  "#E11D48", // rose
  "#A3E635", // lime
  "#FACC15", // yellow
  "#F472B6", // pink
  "#38BDF8", // sky
  "#FBBF24", // amber
  "#34D399", // green
  "#818CF8", // indigo
  "#F59E42",
  "#3B82F6",
];

 export const disabledBindingKeys = [
    "existingProformaInvoice",
  ];
  
  // Roles that can see all fields without disabling
  export const ADMIN_ROLES = ['shoba', 'admin','superadmin'];
  
  // Binding keys that should be disabled for non-admin roles
  export const ROLE_RESTRICTED_BINDING_KEYS = [
    'goodiesTshirtApplicable',
    'goodiesJacketApplicable', 
    'goodiesNotebook',
    'goodiesFlask',
    'goodiesRatriaPillarLeonia'
  ];
export const HDB_LABEL = 'HDBs';
export const ROOM_CATEGORY_ALT_TEXT = {
  PHYSICALLY_CHALLENGED: "Physically Challenged",
  SENIOR_CITIZENS: "Senior Citizens",
  CHILDREN: "Children",
  NORMAL:"normal"
};
export const RESERVED = "RESERVED";
export const ROOM_RESERVATION_MESSAGES = {
  RESERVED_DEFAULT: "This room is reserved",
  RESERVED_FOR:  "This room is reserved for",
};
export const DOWNLOAD_ERRORS = {
  GENERIC: "Failed to download report. Please try again.",
  NO_DATA: "No data available to download.",
  NETWORK: "Network error. Please check your connection and try again.",
  TIMEOUT: "Download request timed out. Please try again.",
};
export const INVALID_SELECTION = "Invalid Selection";