import seatAllocationActive from "../assets/images/seatAllocationActive.svg";
import outlineFilledSeats from "../assets/images/outline-filled-seat.svg";
import activeExpression from "../assets/images/active-expressions.svg";
import expression from "../assets/images/expressions.svg";
import userCircle from "../assets/images/usercircle.svg";
import profileActive from "../assets/images/profile-active.svg";

export const QUESTION_MODAL_TEXT = {
  FORM: {
    LABELS: {
      QUESTION: "Question",
      TYPE: "Type*",
      OPTION: "Option",
      PLACEHOLDER: "Enter your question",
    },
    BUTTONS: {
      CANCEL: "Cancel",
      SUBMIT: "Submit",
      UPDATE: "Update",
      DUPLICATE: "Duplicate",
      ADD_OPTION: "Add Option",
    },
    SELECT: {
      CATEGORY_PLACEHOLDER: "Select Category",
    },
  },
  ERRORS: {
    OPTION_FETCH: "Error fetching options:",
    QUESTION_SUBMIT: "Error submitting question:",
    QUESTION_OPTION_ASSOCIATION: "Failed to create question-option association",
    QUESTION_CREATE: "Failed to create/update question",
  },
  VALIDATION: {
    REQUIRED_FIELDS: {
      QUESTION: "Question is required",
      TYPE: "Type is required",
    },
  },
};

export const OPTION_MODAL_TEXT = {
  FORM: {
    LABELS: {
      OPTION: "Option*",
      TYPE: "Type*",
      CATEGORY: "Category*",
      OPTION_PLACEHOLDER: "Enter option",
      OTHER_CATEGORY_PLACEHOLDER: "Enter other category",
    },
    BUTTONS: {
      CANCEL: "Cancel",
      SUBMIT: "Submit",
      UPDATE: "Update",
      DUPLICATE: "Duplicate",
    },
    SELECT: {
      CATEGORY_PLACEHOLDER: "Select Category",
    },
  },
  ERRORS: {
    CATEGORY_CREATE: "Failed to create category",
    SUBMIT: "Error submitting:",
  },
  TYPE_OPTIONS: [
    { value: "string", label: "String" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
  ],
  OTHER_VALUE: "Other",
};

// Common form field values
export const COMMON_FORM_FIELDS = {
  STATUS: {
    DRAFT: "draft",
    PUBLISHED: "published",
  },
  TEST_IDS: {
    OPTION_INPUT: "option-input",
    OTHER_CATEGORY_FIELD: "other-category-field",
    OTHER_CATEGORY_INPUT: "other-category-input",
    CANCEL_BUTTON: "cancel-button",
    SUBMIT_BUTTON: "submit-button",
  },
};

export const DEFINED_ROLES = [
  "mahatria",
  "admin",
  "finance_manager",
  "relational_manager",
  "shoba",
  "operational_manger",
  "rm_support",
  "super_admin",
];

export const TDS_APPLICATION_OPTIONS = [
  { value: "", label: "Select option" },
  { value: "base_only", label: "Base amount" },
  {
    value: "base_plus_tax",
    label: "Base amount with tax",
  },
];

export const PAYMENT_STATUSES = {
  MODE: {
    ONLINE: "online",
    OFFLINE: "offline",
  },
  ONLINE_PENDING: {
    value: "online_pending",
    label: "Online pending",
  },
  ONLINE_COMPLETED: {
    value: "online_completed",
    label: "Online completed",
  },
  OFFLINE_PENDING: {
    value: "offline_pending",
    label: "Offline pending",
  },
  OFFLINE_COMPLETED: {
    value: "offline_completed",
    label: "Offline completed",
  },
  FAILED: {
    value: "failed",
    label: "Failed",
  },
};

export const ALLOCATED = "allocated";

export const ApprovalStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  UNDER_REVIEW: "under_review",
  ON_HOLD: "on_hold",
  CANCELLED: "cancelled",
  YTD: "Swap demand",
  HOLD: "Hold",
  REGPENDING: "regPending",
};

export const USER_ROLE_MAHATRIA = "mahatria";
export const USER_ROLE_SHOBA = "shoba";
export const MENU_ID_HDB = "hdb";
export const API_LIMIT_100 = 100;

// User Preference Dropdown Constants
export const USER_PREFERENCE_DROPDOWN = {
  mahatriaChoiceUnallocated: "mahatriaChoiceUnallocated",
  preferencesUnallocated: "preferencesUnallocated",
  mahatriaChoiceBlessed: "mahatriaChoiceBlessed",
  preferencesHeading: "preferences",
  swapPreferencesHeading: "preferences",
  none: "none",
  selectToMove: "Select to move",
  mahatriaChoiceHold: "mahatriaChoiceHold",
  choice: "choice",
};
export const swapRequestPayload = {
  YTD: {
    name: "Swap demand",
    value: "yet-to-decide",
  },
  Hold: {
    name: "Hold",
    value: "hold",
  },
};
export const mousedown = "mousedown";
export const scroll = "scroll";
export const resize = "resize";

export const OVERALL_RATING_LABEL = "Overall rating is";
export const COMMENT_LABEL = "Comment";
export const YET_TO_REVIEW_LABEL = "Yet to review";
export const PASSION_LABEL = "Passion";
export const GROWTH_LABEL = "Growth";
export const INFINITHEIST_LABEL = "Infinitheist";
export const CONTINUITY_LABEL = "Continuity";
export const NO_EXPERIENCE = "No experiences to show";
export const CURRENT_RATING_IS = "Current rating is";

export const RecommendationLevelText = {
  Recommend: "How would you recommend this seeker?",
  WouldYouLikeToRecommend: "Has the seeker been following up with you?",
  FollowUpCount: "How many times has the seeker followed up?",
  Recommendation: "Followup",
  Comments: "Comments",
  RMReview: "RM review",
  rating: "Rating",
};
export const RecommendationText = "recommended";

export const CryptoTrailText = "--1#2@3$4%5^6*";

export const TravelFormText = {
  toastTitle: "Travel Form",
  toastMessage: "Travel form submitted successfully",
  toastType: "success",
};

export const BULKEMAIL = {
  SELECTION: "selection",
  VIEW_SEEKERS: "view seekers",
  TEST_COMMUNICATION: "test communication",
  EMAIL_TRIGGERER: "Email Trigger",
  CANCEL: "cancel",
  CONTINUE: "continue",
  SEND: "send",
  VIEW_SEEKERS_BUTTON: "view seekers",
  SWAP_REQUESTS: "swapRequests",
  SWAP_REQUESTS_LABEL: "SWAP_REQUEST",
  INCLUDE_RM_LABEL: "Include RMs",
  PAYLOAD_THRESHOLD: 200000, // Maximum IDs to send in payload (~5MB limit)
  toastTitle: "Bulk Email",
  CONFIGURATION: "Configuration",
  RECEIVERS_INFO:
    "Communication will be triggered to respective seekers and RMs",
  SELECTION_OPTIONS_TITLE: "Choose a template for communication",
  toastMessage: {
    SUCCESS: "Bulk email sent successfully",
    WARNING: "Error sending bulk email",
    NOSEEKERS: "No seekers found",
    NO_COMMUNICATION_TYPE:
      "Please select at least one communication type (Email or WhatsApp)",
    NO_SEEKERS_TO_SEND: "No seekers found to send communication",
    NO_SEEKERS_SELECTED: "No seekers selected to send communication",
    NO_TEST_USERS: "No test email users found",
    NO_TEST_USERS_SELECTED: "No test email users selected",
    NO_REGISTRATION: "No registration to send bulk emails",
  },
  toastType: { SUCCESS: "success", WARNING: "warning" },
  tableHeaders: {
    NAME: "Name",
    EMAIL: "Email",
    PHONE_NUMBER: "Phone Number",
    MOBILE_NUMBER: "Mobile Number",
  },
  altText: {
    CHECKED: "Checked",
    UNCHECKED: "Unchecked",
    CLOSE: "Close",
    EMAIL_ICON: "email icon",
  },
  tooltipText: {
    SELECT_ALL: "Select all",
    DESELECT_ALL: "Deselect all",
  },
  placeholders: {
    EMPTY_VALUE: "-",
  },
  rowSelection: {
    OF: "of",
    ROW: "row",
    ROWS: "rows",
    SELECTED: "selected",
  },
  communicationTypes: {
    EMAIL: "Email",
    WHATSAPP: "WhatsApp",
    EMAIL_KEY: "email",
    WHATSAPP_KEY: "whatsapp",
  },
  headers: {
    COMMUNICATION_TRIGGER: "Communication Trigger",
    SEEKERS_LIST: "Seekers List",
    TEST_COMMUNICATION_USERS: "Test Communication Users",
  },
  buttons: {
    SEND_COMMUNICATION: "send communication",
    SEND_MAIL: "mail",
    TEST_MAIL: "test mail",
  },
  statuses: {
    SUCCESS: "success",
  },
  fields: {
    CHECKBOX: "checkbox",
    ORG_USR_NAME: "orgUsrName",
    EMAIL: "email",
    PHONE_NUMBER: "phoneNumber",
    SEEKER_NAME: "seekerName",
    BASIC_DETAILS: "basicDetails",
    NUMBER_OF_HDBS: "numberOfHDBs",
    AVERAGE_RATING: "averageRating",
    RM_CONTACT: "rmContact",
  },
  filters: {
    USER_TYPE_ORG: "Org",
  },
  templateKeys: {
    HDB_FIRST_TIMER: "hdb_first_timer",
  },
  filterKeys: {
    NUMBER_OF_HDBS: "numberOfHdbs",
    COMMUNICATION_TEMPLATE_IDS: "communicationTemplateIds",
  },
  selectionModes: {
    ALL: "ALL",
    SELECTED: "SELECTED",
    EXCLUDED: "EXCLUDED",
  },
  values: {
    ZERO: "=0",
    DEFAULT: "default",
    SENT: "sent",
    DASH: "-",
  },
  styles: {
    MIN_HEIGHT: "200px",
    GRID_HEIGHT: "calc(100vh - 445px)",
  },
  inputTypes: {
    RADIO: "radio",
    CHECKBOX: "checkbox",
  },
  params: {
    PROGRAM_ID: "programId",
    PARENT_FILTER: "parentFilter",
    FILTERS: "filters",
    LIMIT: "limit",
    OFFSET: "offset",
    COMMUNICATION_LIST_FOR_TEMPLATE_KEY: "communicationListForTemplateKey",
  },
  filterValues: {
    USER_TYPE_ORG_ARRAY: ["Org"],
  },
  apiFields: {
    USER_TYPE: "userType",
  },
  messages: {
    CANNOT_SEND_EMAILS_REFINE: "Cannot send emails. Please select",
    OR_FEWER_RECIPIENTS: "or fewer recipients, or deselect",
    ERROR_FETCHING_SEEKERS: "Error fetching seekers:",
    ERROR_FETCHING_TEST_USERS: "Error fetching test email users:",
    ERROR_SENDING_BULK_EMAIL: "Error sending bulk email:",
    ERROR_PREPARING_TEST_EMAIL_IDS: "Error preparing test email user IDs:",
    ERROR_FETCHING_ALL_IDS_SELECTED:
      "Error fetching all IDs for selected mode:",
    ERROR_FETCHING_COMMUNICATION_TEMPLATE:
      "Error fetching communication template:",
  },
  colors: {
    ARROW_LEFT_COLOR: "#051B46",
  },
  sizes: {
    ARROW_LEFT_SIZE: 20,
  },
};

export const BUTTONLABELS = {
  SAVE: "save",
  CANCEL: "cancel",
  SUBMIT: "submit",
  UPDATE: "update",
  EDIT: "edit",
  ADD: "add",
  DELETE: "delete",
  DOWNLOAD: "download",
  UPLOAD: "upload",
  CONTINUE: "continue",
  PROCESSING: "Processing...",
};
export const REPORTS = {
  DOWNLOAD_REPORT: "Downloading Report",
  REPORTNAME: "Report Name",
  DOWNLOAD_ID_PROOFS: "Download ID Proofs",
  FOLDER_NAME: "Folder Name",
  FOLDER_NAME_REQUIRED: "Folder name is required",
  REPORT_NAME_REQUIRED: "Report name is required",
  ENTER_FOLDER_NAME: "Enter folder name",
  ENTER_REPORT_NAME: "Enter report name",
  ALPHANUMERIC_HYPHENS_ONLY:
    "Only alphanumeric characters and hyphens are allowed",
  FAILED_DOWNLOAD_ID_PROOFS: "Failed to download ID proofs",
  FAILED_DOWNLOAD_REPORT: "Failed to download report",
  SELECT_PROGRAM_FOLDER: "Select a program to download ID proofs.",
  DOWNLOAD_REPORTS: "Download reports",
  COMPLETE_LIST_NO_FILTERS:
    "Complete list without any filters will be downloaded when you select a report below.",
  FILTERED_LIST_MESSAGE:
    "Seekers that match the applied filters will be downloaded when you select a report below.",
  NO_RECORDS_TO_DOWNLOAD: "No records available to download.",
};

export const ID_PROOF_EXPORT_MESSAGES = {
  INITIATED: "Export initiated. Preparing ID proofs...",
  IN_PROGRESS: "Export in progress:",
  COMPLETE: "complete",
  SUCCESS: "ID proofs download initiated successfully.",
  FAILED: "Export Failed",
  FAILED_MESSAGE: "Failed to export ID proofs. Please try again.",
  RESUMING: "Resuming ID proof export...",
  TIMEOUT: "Export polling timeout. Please try again.",
  TITLE: "ID Proof Export",
};

// Console log messages for ID proof export service (dev/debug use)
export const ID_PROOF_EXPORT_LOGS = {
  PAYLOAD: "ID Proof Export Payload:",
  RESPONSE_FULL: "ID Proof Export Response (full object):",
  RESPONSE_STATUS: "Response status:",
  RESPONSE_STATUS_CODE: "Response statusCode:",
  RESPONSE_DATA: "Response data:",
  ERROR_UNDEFINED_RESPONSE: "Response is undefined or null",
  ERROR_NO_RESPONSE: "No response from server",
  ERROR_API_RETURNED: "API returned error. Status:",
  ERROR_FULL_DATA: "Full error data:",
  ERROR_EXTRACTED_MESSAGE: "Extracted error message:",
  ERROR_NO_DATA: "Response data is missing",
  ERROR_INVALID_RESPONSE: "Invalid response from server - no data",
  ERROR_NO_RECORDS: "No records available for download",
  ERROR_NO_RECORDS_MESSAGE: "No records available to download.",
  SUCCESS_RETURN: "Returning success response data",
  ERROR_EXPORT_FAILED: "Failed to initiate ID proof export",
  ERROR_BACKGROUND_EXPORT: "Background export error:",
  ERROR_TIMEOUT: "Export polling timeout. Please try again.",
};

export const DOWNLOAD_MODE = {
  REPORT: "report" as const,
  FOLDER: "folder" as const,
  ID_PROOF: "id-proof" as const,
};
export const UN_BLESSED_FILTER_ID: number[] = [0, 1, 8, 9, 10];

export const textConstant = {
  REGISTRATIONS: "registrations",
  DASHBOARD: "dashboard",
  SEAT_ALLOCATIONS: "seat-allocations",
  PORTAL: "portal",
  ID: "id",
  DESC: "DESC",
  ASC: "ASC",
  LOWER_CASE_DESC: "desc",
  LOWER_CASE_ASC: "asc",
  DISABLEQUEUE: "Queue is disabled",
  DISABLE_SWAP_DEMAND:
    "There is no swap request for this seeker. So, not applicable. ",
  SWAP_DEMAND_TEXT: "Applicable for swap request",
  BLESSED_DATE_KEY: "blessedDate",
  REGISTRATION_DATE_KEY: "registrationDate",
  FAILED_TO_LOAD: "Failed to load program data. Please try again",
  PROGRAM_NOT_FOUND: "Program not found",
  PLEASE_SELECT_PROGRAM: "Please select a program",
  BLESSED_DATE_LABEL: "Blessed Date",
  GO_TO_PROGRAM: "Go to program section",
  REGISTRATION_DATE_LABEL: "Registration Date",
  CANCELLATION_DATE_KEY: "cancelledDate",
  HOLD_DATE_KEY: "holdDate",
  SWAP_DEMAND_DATE_KEY: "swapDemandDate",
  SWAP_REQUEST_DATE_KEY: "swapRequestDate",
  PENDING_DATE_KEY: "pendingDate",
  ALL_STATUS_DATE_KEY: "allStatusDate",
  SWAP_REQUEST_LABEL: "Swap request",
  HDB: "HDB",
  SORT: "Sort",
  COMPLETE_ASC: "ascending",
  COMPLETE_DESC: "descending",
  SORTED_BY: "Sorted by",
  YET_TO_ALLOCATE: "Yet to allocate",
  SEARCH_TEXT: "Search seeker with name, room number, floor",
  SEARCH_SEEKER_TEXT: "Search seeker with name or location",
  SEARCH: "search",
  MIN: "Min",
  MAX: "Max",
  VALUE: "Value",
  MIN_VALUE: "value1",
  MAX_VALUE: "value2",
  PAIR: "Pair",
  EXPRESSIONS: "Expressions",
  EXPRESSIONS_KEY: "EXPRESSIONS",
  DOWNLOAD_REPORT: "download",
  ROOM_ALLOCATION_LABEL: "Room Allocation",
  DEFAULTER: "defaulter",
  UPDATE: "update",
  SEEKER_NAME: "seekerName",
  YES_TEXT: "yes",
  NO_TEXT: "no",
  CONFIRMATION: "confirmation",
  DEFAULTERS_TOTAL: "defaulters_total",
  ALL: "all",
  TOTAL: "Total",
  MAHATRIACHOICE: "mahatria-choice",
  SEEKER_BEHAVIOUR_TEXT: "Seeker Behaviour Monitoring",
  SWAP: "swap",
  SEEKER_DETAILS: "seekerDetails",
  ZERO_TEXT: "00",
  YET_TO_DECIDE: "yet to decide",
  COMMENT_ONLY_KEEP_DEFAULTER: "Comment only (keep seeker as defaulter)",
  REMOVE_FROM_DEFAULTER_LIST: "Remove from defaulter list",
  LARGE: "large",
  HDBS_MSD: "hdbsMsds",
  HDB_ROUTE: "hdb",
};

export const sortOptions = [
  { label: "Name", value: "fullName", initialOrder: "asc" },
  { label: "Age", value: "dob", initialOrder: "asc" },
  { label: "RM Rating", value: "averageRating", initialOrder: "asc" },
  { label: "Number of HDBs", value: "noOfHDBs", initialOrder: "asc" },
  { label: "Status", value: "blessedWithProgram", initialOrder: "asc" },
  { label: "Date", value: "registrationDate", initialOrder: "desc" },
  { label: "Date", value: "blessedDate", initialOrder: "asc" },
  { label: "Date", value: "cancelledDate", initialOrder: "asc" },
  { label: "Date", value: "holdDate", initialOrder: "asc" },
  { label: "Date", value: "swapDemandDate", initialOrder: "asc" },
  { label: "Date", value: "swapRequestDate", initialOrder: "asc" },
  { label: "Date", value: "pendingDate", initialOrder: "asc" },
];
export const LABEL_ANY_HDB_MSD = "Any HDB/MSD";
export const SINGLE_PREFERENCE = "preference";
export const MULTIPLE_PREFERENCES = "preferences";
export const SEEKER_ASSOCIATION = "Seeker’s association with infinitheism";
export const OTHER_EXPERIENCES = "Other experiences";
export const PREFERENCE_LABEL = "Preferences";
export const HDB_MSD_LABEL = "HDB/MSD";

export const QUICK_VIEW_OVERLAY = {
  HEADER_TEXT: "Seeker Details",
  DETAILS_HEADING: "Details",
  QUICK_VIEW_HEADING: "Quick view of seeker",
  NO_DATA_MESSAGE: "No additional details available",
  EXCLUDED_FIELDS: [
    "seekerName",
    "gender",
    "age",
    "location",
    "profilePictureUrl",
    "numberOfHDBs",
    "preferredRoomMate",
    "appliedOn",
  ],
  SINGLE_COLUMN_FIELDS: [
    "rmRating_grouped",
    "rmRecommendation_grouped",
    "swapDemand_grouped",
  ],
  GROUPED_FIELDS: {
    rmRating: {
      primaryKey: "averageRating",
      secondaryKey: "rmComments",
      label: "RM rating",
      groupedKey: "rmRating_grouped",
    },
    rmRecommendation: {
      primaryKey: "recommendation",
      secondaryKey: "recommendationComments",
      label: "RM recommendation",
      groupedKey: "rmRecommendation_grouped",
    },
    swapDemand: {
      primaryKey: "swapDemand",
      secondaryKey: "swapDemandComments",
      label: "Swap demand",
      groupedKey: "swapDemand_grouped",
    },
  },
  STATUS_MAPPING: {
    approvalStatus: {
      pending: "Unassigned",
      rejected: "Hold",
      on_hold: "Swap demand",
    },
  },
  API_CONFIG: {
    LIMIT: 100,
    OFFSET: 0,
  },
  ERROR_MESSAGES: {
    FETCH_ERROR: "Error fetching seeker data:",
  },
};

export const DRAWER_CLOSE_DELAY = {
  SHORT: 200,
  LONG: 300,
};

export const PREVIOUS_RATING_LABEL = " rating is";
export const PREVIOUS_RATING_IS = "previous rating is";
export const PREVIOUS_RATING_IS_LABEL = "Previous rating is";
export const OTHER_CONTACT_PERSON = "Other contact Person";
export const SWAP_REQUEST_LABEL = "swap request";

export const dropDownnJSON = {
  CANCELLED: {
    label: "Cancelled",
    value: "cancelled",
  },
  SWAP_REQUESTS: {
    label: "Swap requests",
    value: "swap requests",
  },
  PENDING: {
    label: "Pending",
    value: "pending",
  },
  ALL: {
    label: "All",
    value: "all",
  },
  UNASSIGNED: {
    label: "Unassigned",
    value: "unassigned",
  },
  BLESSED: {
    label: "Blessed",
    value: "blessed",
  },
  DEFAULTERS: {
    label: "Defaulter",
    value: "defaulter",
  },
};

export const seekerExperiencesText = {
  HEADER_TEXT: "Add seeker experiences",
  UPDATE_HEADER_TEXT: "Update seeker experiences",
  NO_TAGS_MESSAGE: "No experiences to show",
  ERROR_MESSAGE: "Error fetching experiences",
  PLACEHOLDER_TEXT: "Select experiences",
  ADD_MORE: "Add More +",
};
export const PROFILE_IMAGE_ALT_TEXT = "Profile Image";
export const NO_SONG_PREFERENCE = "No song preference";

export const blessContent = {
  CHOOSE: "Choose a program to",
  BLESS: "bless",
  SWAP: "swap",
};

export const DOWNLOAD_ERRORS = {
  GENERIC: "Something went wrong on our end. Please try again later.",
  URL_NOT_FOUND: "Report not found. Please try again later.",
};

export const USER_ACTION_ERRORS = {
  HOLD: "Failed to hold user",
  YTD: "Failed to move user to YTD",
  GENERIC_RETRY: " Please try again.",
  BLESS_FAILED: "Failed to bless user. Please try again.",
  REQUEST_FAILED: "Failed to process request. Please try again.",
  DOWNLOAD_INVOICE_FAILED: "Failed to download invoice.",
};

export const ACTION_LABELS = {
  VIEW_DETAILS: "View details",
  CANCEL_REGISTRATION: "Cancel registration",
  ADD_REVIEW_AND_EXPERIENCE: "Add review and experience",
  UPDATE_REVIEW_AND_EXPERIENCE: "Update review and experience",
  SEND_INVOICE: "Send invoice",
  DOWNLOAD_INVOICE: "Download invoice",
  DOWNLOAD_PROFORMA_INVOICE: "Download proforma invoice",
  EINVOICE_FAILED: "E-invoice Failed",
  BLESS: "Bless",
  HOLD: "Hold",
  YTD: "ytd",
};

export const CONFIRMATION_MESSAGES = {
  MOVE_TO_HOLD: (seekerName: string) =>
    `Are you sure you want to move ${seekerName} to Hold?`,
  MOVE_TO_SWAP_DEMAND: (seekerName: string) =>
    `Are you sure you want to move ${seekerName} to Swap demand?`,
};

export const COMMUNICATION_CATEGORY = {
  HDB_BLESSED: "hdb_blessed",
  HDB_ALL: "hdb_all",
};

export const TOOLTIP_TEXT = {
  EMAIL: "Email",
};

export const TEST_IDS = {
  EXPORT_BUTTON: "export-button",
  EMAIL_ICON: "email-icon",
};

export const ALT_TEXT = {
  EMAIL: "email",
};

export const BLESSING_MAIL = {
  TITLE: "Blessed email",
  SUCCESS: "Blessed email sent successfully",
  ERROR: "Failed to resend the blessed mail",
  INITIATED: "Resending blessed email...",
};
export const UNBLESSED_FILTER_VALUE: string[] = [
  "all",
  "onHold",
  "ytd",
  "cancelled",
  "unassigned",
  "swapRequests",
  "blessed",
];
export type OverlayType =
  | "review"
  | "swap"
  | "quickView"
  | "seekerTag"
  | "cancelSwap"
  | "defaulter"
  | null;

export const CANCEL_SWAP = {
  TITLE: "Cancel swap request",
  SUCCESS_MESSAGE: "Swap request cancelled successfully",
  SUCCESS_TYPE: "success",
  ERROR_TYPE: "warning",
  ERROR_MESSAGE: "Failed to cancel swap request. Please try again.",
  INPUT_LABEL: "Reason *",
  ACTIONS: {
    CANCEL: "cancel",
    EDIT: "edit",
  },
  CONFIRM_MESSAGE: (seekerName: string) => {
    return `Are you sure you want to cancel ${seekerName}'s Swap Request?`;
  },
};

export const SWAP_REQUEST_TITLE = {
  SWAP_REQUEST: "Swap request",
  UPDATE_SWAP_REQUEST: "Update swap request",
  CANCEL_SWAP_REQUEST: "Cancel swap request",
};
export const EXCLUDED_LABELS = [
  "HDB 1",
  "MSD 1",
  "MSD 2",
  "HDB 2",
  "HDB 3",
  "Mahatria Choice",
];
export const TOOLTIP_LABELS = {
  SWAP: "Swap Requests",
  ROOMMATE_PREFERENCE: "Roommate Preference",
  TOTAL: "All",
  MALE: "Male",
  FEMALE: "Female",
};

export const SECTION_KEYS = {
  MAHATRIA: "FS_MAHATRIAQUESTIONS",
  BASIC_DETAILS: "FS_BASICDETAILS",
  PAYMENTSECTION: "FS_PAYMENTINVOICE",
  TRAVELSECTION: "FS_TRAVELPLAN",
};

export const SECTION_NAME = {
  TRAVELSECTION: "Travel Plan",
  PAYMENTSECTION: "Payment & Invoice",
};

export const MODE = {
  PAYMENT: "paymentMode",
};

export const STATUSES = {
  PENDING: "pending",
  Done: "done",
  INPROGRESS: "inprogress",
  NOT_STARTED: "not_started",
  COMPLETED: "completed",
};
export const REGISTRATION_STATUSES = {
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  PENDING: "pending",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
};
export const PREFERRED_ROOMMATE_MESSAGES = {
  HEADER: "Seekers named",
  NO_MATCHES: "No matching seekers found for",
};

export const HEADERTABS = {
  DASHBOARD: "dashboard",
  REGISTRATIONS: "registrations",
  SEAT_ALLOCATIONS: "seat-allocations",
  DRAFTS: "drafts",
  ROOM_ALLOCATION: "room-allocation",
  EXPRESSIONS: "expressions",
};

export const DROPDOWNFILTERS = {
  pending: {
    kpiFilter: "regPending",
    kpiCategory: "registrations",
  },
};
export const DROPDOWNFILTER_SIDEBARITEMS = {
  pending: {
    total: "pending_total",
  },
};
export const QUICK_VIEW_HEADERS = {
  swapPreference: "swapPreference",
  swapDemand: "swapDemand",
};

export const STEPPER_STATUSES = {
  COMPLETED: "completed",
  PENDING: "pending",
  NOT_STARTED: "not started",
};
export const SWAP_DEMAND_LABEL = "Swap Demand";
export const DEFAULTER_HEADING = "Seeker Behaviour Deviations";

export const startWithIn = "Starts within 10 days";

export const pdf_viewer = "PDF Viewer";

export const FILTER_TYPES = {
  CHECKBOX: "checkbox",
  RADIO: "radio",
  DROPDOWN: "dropdown",
  DATE_RANGE: "date-range",
  RANGE: "range",
  MULTI: "multi",
  DATE_TIME_RANGE: "date-time-range",
  DATE: "date",
  INPUT_TYPE: "input",
};
export const NO_OF_HDBS = "Number of HDBs";

export const PROGRAM_ID = "programId";

export const PROGRAM_TYPE = {
  HDB_MSD_KEY: "PT_HDBMSD",
  HDB_MSD_LABEL: "HDB/MSD",
  INVOICE_LABEL: "Invoice",
  INFINIPATH_KEY: "PT_INFINIPATH",
  TAT_KEY: "PT_TAT",
  TAT_VALUE: "TAT",
  ENTRAINMENT_KEY: "PT_ENTRAINMENT",
  SESSION_LABEL: "session",
  SUB_PROGRAM_LABEL: "sub-program",
};

export const PROGRAM_TYPE_TABS: Record<string, string[]> = {
  PT_HDBMSD: [
    HEADERTABS.DASHBOARD,
    HEADERTABS.SEAT_ALLOCATIONS,
    HEADERTABS.REGISTRATIONS,
    HEADERTABS.DRAFTS,
    HEADERTABS.ROOM_ALLOCATION,
    HEADERTABS.EXPRESSIONS,
  ],
  PT_TAT: [
    HEADERTABS.REGISTRATIONS,
  ],
  PT_ENTRAINMENT: [
    HEADERTABS.REGISTRATIONS,
    HEADERTABS.ROOM_ALLOCATION,
    HEADERTABS.EXPRESSIONS,
  ],
};
export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_PAGE_NUMBER = 1;
export const TEXT = "text";
export const VIDEO = "video";
export const RECORD_TYPE = {
  VIDEO: "video",
  MESSAGE: "message",
};

export const NAVIGATION = {
  PROFILE: "/admin/profile",
  DASHBOARD: "/admin/hdb-dashboard",
};

export const LOCAL_STORAGE_KEYS = {
  HDB_ACTIVE_TAB: "hdb_active_tab",
  SUB_PROGRAM_ID: "sub_program_id",
  SELECTED_SUB_PROGRAM: "selected_sub_program",
  LAST_VISITED_PROGRAM_ID: "lastVisitedProgramId",
  PROGRAM_TYPE_KEY: "programTypeKey",
  PROGRAM_ID: "programId",
};

export const INFINI_RECORDS_PAGINATION_API = "seeker-program-experience";
export const HEART_FELT_Message = "Expressions from seekers";
export const SEEKER_EXPERIENCES = "Seeker experiences";
export const SEEKER_VIEWED_UPDATE_ERROR_MSG = "Failed to update status.";
export const UNABLE_TO_LOAD_SEEKER_EXP = "Unable to load seeker experiences.";
export const UNABLE_TO_LOAD =
  "Unable to load program. Please select a program first.";
export const VIEWED = "viewed";
export const WATCH = "watch";
export const READ = "read";
export const BROWSER_DONT_CONTAIN_VIDEOTAG =
  "Your browser does not support the video tag.";
export const NO_SEEKER_FOUND = "No seeker expressions found!";
export const SEARCH_NAME_PLACEHOLDER = "Search seeker with name";
export const DATE_PLACEHOLDER = "Date Placeholder";
export const SELECT_SEEKER_TO_VIEW =
  "Select a seeker to view their expressions.";
export const NO_SEEKERS_FOUND_SEARCH = "No seekers found for your search";
export const NO_SEEKER_FOUND_SEARCH_VALUE = (searchValue: string) =>
  `No seeker named "${searchValue}" found`;
export const HEARTFELT_MESSAGE_FROM = (
  seekerName: string,
  programName: string,
) => `${seekerName} shared their journey in ${programName}`;
export const FROM_LABEL = "From";
export const ENTER_LABEL = "Enter";
export const MAKE_DEFAULTER_QUESTION =
  "Would you like to mark this seeker as a defaulter?";
export const UPDATE_QUESTION = "What would you like to update?";
export const ENTER_REASON_PLACEHOLDER = "Enter your reason...";

export const ACTION_TYPE = {
  MARKED: "MARKED",
  UPDATED_COMMENT: "UPDATED_COMMENT",
};

export const ACTION_TYPE_LABELS = {
  MARKED: "Marked as Defaulter",
  UPDATED_COMMENT: "Updated Comment",
  UNMARKED: "Unmarked as Defaulter",
  MARK: "Mark as Defaulter",
  UNMARK_DEFAULTER: "Unmark Defaulter",
};

export const ROLE_DISPLAY_MAPPING: Record<string, string> = {
  relational_manager: "RM",
  shoba: "Coordinator",
};

interface MenuItem {
  id: string;
  text: string;
  selectedImageSrc: string;
  unselectedImageSrc: string;
  route: string;
}

export const ITEM_TYPES = {
  USER: "USER",
};
export const GENDER_MALE = "M";
export const GENDER_FEMALE = "F";

export const menuItems: Array<MenuItem> = [
  {
    id: "seatAllocation",
    text: "Seat Allocation",
    selectedImageSrc: seatAllocationActive,
    unselectedImageSrc: outlineFilledSeats,
    route: "seat-allocations",
  },
  {
    id: "expressions",
    text: "Expressions",
    selectedImageSrc: activeExpression,
    unselectedImageSrc: expression,
    route: "expressions",
  },
  {
    id: "myProfile",
    text: "Profile",
    selectedImageSrc: profileActive,
    unselectedImageSrc: userCircle,
    route: "/admin/profile",
  },
  // {
  //   id : "logout",
  //   text : "Log out",
  //   selectedImageSrc : "",
  //   unselectedImageSrc : logout,
  //   route : ""
  // }
];
export const ALL = "ALL";
export const OPTIONS_SELECTED = "options selected";

export const DEFAULT_COLOR = "#3B82F6";
export const DEFAULT_BORDER_WIDTH = 1;
export const STACKED_STACK_ID = "default";
export const RESEND_EMAIL = "Resend blessed email";

export const CSS_CLASSES = {
  CONTENT_CONTAINER: "contentContainer",
  CONTENT_CONTAINER_WITH_SIDEBAR: "contentContainerWithFixedSidebar",
  MAHATRIA_FLOW_BG: "mahatriaFlowBg",
  LAYOUT_CONTAINER: "layoutContainer",
};

export const INFINIPATH_SEEKERS_LIST = {
  FIELDS: {
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    ENCRYPTED_EMAIL: "encryptedEmail",
    GENDER: "gender",
    DOB: "dob",
    ENCRYPTED_PHONE: "encryptedPhoneNumber",
    ADDRESS: "address",
  },
  COLUMNS: {
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    EMAIL: "Email",
    GENDER: "Gender",
    AGE: "Age",
    MOBILE_NUMBER: "Mobile Number",
    LOCATION: "Location",
  },
  LABELS: {
    TOTAL_SEEKERS: "Total Seekers -",
  },
  PLACEHOLDERS: {
    SEARCH: "Search seeker with name or mobile number",
  },
  TOOLTIPS: {
    SEARCH: "Search",
  },
  ERRORS: {
    FETCH_DATA: "Error fetching data",
  },
  VALUES: {
    OTHER: "other",
    DASH: "-",
  },
};

export const MAKE_DEFAULTER_QUESTIONS = [
  {
    question: MAKE_DEFAULTER_QUESTION,
    yesText: textConstant.YES_TEXT,
    noText: textConstant.NO_TEXT,
  },
];

export const UPDATE_DEFAULTER_QUESTIONS = [
  {
    question: UPDATE_QUESTION,
    yesText: textConstant.COMMENT_ONLY_KEEP_DEFAULTER,
    noText: textConstant.REMOVE_FROM_DEFAULTER_LIST,
  },
];

export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const HEADER_TABS = {
  DASHBOARD: "Dashboard",
  REGISTRATIONS: "Registrations",
  SEAT_ALLOCATIONS: "Seat Allocations",
  DRAFTS: "Drafts",
  ROOM_ALLOCATION: "room-allocation",
  EXPRESSIONS: "expressions",
};

export const MENU_ACTION_KEYS = {
  UNMARK_DEFAULTER: "UNMARK_DEFAULTER",
  MARK_DEFAULTER: "MARK_DEFAULTER",
  CANCEL_SWAP_REQUEST: "CANCEL_SWAP_REQUEST",
};
export const ReviewOverlayText = {
  ERRORS: {
    UPDATE_FAILED_TITLE: "Update Failed",
    REVIEW_AND_EXPERIENCE_FAILED:
      "Failed to update review and seeker experience section",
    REVIEW_SECTION_FAILED: "Failed to update review section",
    EXPERIENCE_SECTION_FAILED: "Failed to update seeker experience section",
    UNEXPECTED_ERROR: "An unexpected error occurred while updating",
  },
};

// Add Program Constants
export const ADD_PROGRAM_TEXT = {
  STEPS: {
    PROGRAM_BASICS: "Program Basics",
    SCHEDULES_LOGISTICS: "Schedules & Logistics",
  },
  SUCCESS: {
    CHECKMARK: "✓",
    TITLE: "Program Created Successfully!",
    MESSAGE: (programName: string) => `Your program "${programName}" has been created and is ready for configuration.`,
    BUTTON: "Create Another Program",
  },
  BUTTONS: {
    BACK_TO_PROGRAM_TYPES: "Back to Program Types",
    BACK: "Back",
    NEXT: "Next",
    CREATE_PROGRAM: "Create Program",
  },
  LABELS: {
    PROGRAM_NAME: "Program Name *",
    PROGRAM_CODE: "Program Code *",
    MODE_OF_OPERATION: "Mode of Operation *",
    PROGRAM_START_DATE: "Program Start Date *",
    PROGRAM_START_TIME: "Program Start Time *",
    PROGRAM_END_DATE: "Program End Date *",
    PROGRAM_END_TIME: "Program End Time *",
    PAYMENT_REQUIRED: "Payment Required",
    RESIDENTIAL: "Is Residential",
    TRAVEL_INVOLVED: "Travel Involved",
    TOTAL_BED_COUNT: "Total Bed Count *",
    HELPLINE_NUMBER: "Helpline Number *",
    EMAIL_SENDER_NAME: "Email Sender Name *",
    EMAIL_SENDER_ADDRESS: "Email Sender Address *",
    EMAIL_BCC_NAME: "BCC Name",
    EMAIL_BCC_ADDRESS: "BCC Email Address",
    VENUE_NAME_IN_EMAILS: "Venue Name in Emails *",
    REGISTRATION_START_DATE: "Registration Start Date *",
    REGISTRATION_START_TIME: "Registration Start Time *",
    REGISTRATION_END_DATE: "Registration End Date *",
    REGISTRATION_END_TIME: "Registration End Time *",
    REQUIRES_APPROVAL: "Requires Approval",
    HAS_SEAT_LIMIT: "Has Seat Limit",
    MAX_SEATS: "Maximum Seats *",
    HAS_WAITLIST: "Has Waitlist",
    WAITLIST_TRIGGER_COUNT: "Waitlist Trigger Count *",
    VENUE: "Venue *",
    PRICE: "Price *",
    FIRST_PRICE: "First Price *",
    SECOND_PRICE: "Second Price *",
    GST_PERCENTAGE: "GST Percentage *",
    CURRENCY: "Currency *",
    TDS_PERCENT: "TDS Percent *",
    TDS_APPLICABILITY: "TDS Applicability *",
    SGST: "SGST *",
    CGST: "CGST *",
    IGST: "IGST *",
    INVOICE_SENDER_NAME: "Invoice Sender Name *",
    PAN: "PAN *",
    GSTIN: "GSTIN *",
    CIN: "CIN *",
    INVOICE_ADDRESS: "Invoice Address *",
    SESSION_NAME: "Session Name",
    SESSION_START_DATE: "Start Date *",
    SESSION_END_DATE: "End Date *",
    SESSION_START_TIME: "Start Time *",
    SESSION_END_TIME: "End Time *",
    SESSION_CHECKIN_TIME: "Check-in Time *",
    SESSION_CHECKOUT_TIME: "Check-out Time *",
  },
  SECTIONS: {
    SELECTED_SESSIONS: "Selected Sessions",
    PROGRAM_DETAILS: "Program Details",
    PAYMENT_CONFIGURATION: "Payment Configuration",
    REGISTRATION_SETTINGS: "Registration Settings",
    TAX_INVOICE_INFORMATION: "Tax & Invoice Information",
    SESSION_SCHEDULE: "Session Schedule",
  },
  MODE_OPTIONS: {
    ONLINE: "online",
    OFFLINE: "offline",
    HYBRID: "hybrid",
    ONLINE_LABEL: "Online",
    OFFLINE_LABEL: "Offline",
    HYBRID_LABEL: "Hybrid",
  },
  CURRENCY_OPTIONS: {
    INR: "INR",
    USD: "USD",
    EUR: "EUR",
  },
  TDS_OPTIONS: {
    BASE_ONLY: "base_only",
    BASE_PLUS_TAX: "base_plus_tax",
    BASE_ONLY_LABEL: "Base Only",
    BASE_PLUS_TAX_LABEL: "Base Plus Tax",
  }
};
export const CHOOSE_TEMPLATE_TEXT = {
  MESSAGES: {
    PAGE_TITLE: "Choose Template",
    SELECT_TEMPLATE_PREFIX: "Select a template for ",
    NO_TEMPLATES_PREFIX: "No templates available for ",
    BACK_ALT: "Back",
    UPDATED_PREFIX: "Updated: ",
  },
  ERRORS: {
    NO_TEMPLATES_FOUND: "No templates found in response",
    FETCH_ERROR: "Error fetching templates:",
  },
};

export const ADD_PROGRAM_PAGE_TEXT = {
  VALIDATION: {
    PROGRAM_NAME_REQUIRED: "Program name is required",
    PROGRAM_CODE_REQUIRED: "Program code is required",
    PROGRAM_CODE_MIN: "Program code must be at least 3 characters",
    PROGRAM_CODE_MAX: "Program code must be 50 characters or less",
    PROGRAM_CODE_FORMAT: "Only uppercase letters, numbers, underscores, hyphens, and % allowed. Cannot start or end with those special characters.",
    PROGRAM_CODE_TAKEN: "This program code is already in use",
    PROGRAM_CODE_CHECKING: "Checking availability...",
    PROGRAM_CODE_AVAILABLE: "This code is available",
    SUB_PROGRAM_CODE_REQUIRED: "Sub-program code is required",
    SUB_PROGRAM_CODE_MIN: "Code must be at least 3 characters",
    SUB_PROGRAM_CODE_MAX: "Code must be 50 characters or less",
    SUB_PROGRAM_CODE_FORMAT: "Only uppercase letters, numbers, underscores, hyphens, and % allowed. Cannot start or end with those special characters.",
    SUB_PROGRAM_CODE_UNIQUE: "Sub-program code must be unique within this program",
    START_DATE_REQUIRED: "Start date is required",
    END_DATE_REQUIRED: "End date is required",
    END_DATE_AFTER_START: "End date must be after or same as start date",
    HDB_FEE_REQUIRED: "HDB Fee is required",
    MSD_FEE_REQUIRED: "MSD Fee is required",
    REGISTRATION_START_REQUIRED: "Registration start date is required",
    REGISTRATION_START_BEFORE_PROGRAM:
      "Registration start date must be before program start date",
    REGISTRATION_END_AFTER_START:
      "Registration end date must be after registration start date",
    REGISTRATION_END_TIME_AFTER_START:
      "Registration end time must be after registration start time",
    REGISTRATION_END_REQUIRED: "Registration end date is required",
    TDS_LIMIT_NUMBER: "TDS limit must be a number",
    TDS_LIMIT_NEGATIVE: "TDS limit cannot be negative",
    TDS_LIMIT_EXCEED: "TDS limit cannot exceed 100%",
    TDS_LIMIT_REQUIRED: "TDS limit is required",
    CGST_LIMIT_NUMBER: "CGST limit must be a number",
    CGST_LIMIT_NEGATIVE: "CGST limit cannot be negative",
    CGST_LIMIT_EXCEED: "CGST limit cannot exceed 100%",
    CGST_LIMIT_REQUIRED: "CGST limit is required",
    SGST_LIMIT_NUMBER: "SGST limit must be a number",
    SGST_LIMIT_NEGATIVE: "SGST limit cannot be negative",
    SGST_LIMIT_EXCEED: "SGST limit cannot exceed 100%",
    SGST_LIMIT_REQUIRED: "SGST limit is required",
    IGST_LIMIT_NUMBER: "IGST limit must be a number",
    IGST_LIMIT_NEGATIVE: "IGST limit cannot be negative",
    IGST_LIMIT_EXCEED: "IGST limit cannot exceed 100%",
    IGST_LIMIT_REQUIRED: "IGST limit is required",
    TDS_APPLICABLE_REQUIRED: "TDS applicable selection is required",
    NAME_IN_INVOICE_REQUIRED: "Name in invoice is required",
    ADDRESS_REQUIRED: "Address is required",
    INVALID_PAN_FORMAT: "Invalid PAN format (e.g. ABCDE1234F)",
    PAN_REQUIRED: "PAN is required",
    PAN_LENGTH: "PAN must be exactly 10 characters.",
    GSTIN_LENGTH: "GSTIN must be exactly 15 characters",
    INVALID_GSTIN_FORMAT: "Invalid GSTIN format. Example: 27ABCDE1234F1Z5",
    GSTIN_REQUIRED: "GSTIN is required",
    CIN_LENGTH: "CIN must be exactly 21 characters.",
    INVALID_CIN_FORMAT: "Invalid CIN format. Example: L12345MH2000PLC123456",
    CIN_REQUIRED: "CIN is required",
    HELP_LINE_REQUIRED: "Help line number is required",
    EMAIL_SENDER_NAME_REQUIRED: "Email sender name is required",
    EMAIL_SENDER_NAME_MIN: "Email sender name must be 3 characters",
    EMAIL_SENDER_ADDRESS_REQUIRED: "Email sender address is required",
    EMAIL_SENDER_ADDRESS_INVALID: "Please enter a valid email address",
    EMAIL_BCC_NAME_MIN: "BCC name must be at least 3 characters",
    EMAIL_BCC_ADDRESS_INVALID: "Please enter a valid BCC email address",
    VENUE_NAME_EMAIL_REQUIRED: "Venue name in email is required",
    VENUE_NAME_EMAIL_MIN: "Venue name in email must be 3 characters",
    CHILD_MIN_AGE_NUMBER: "Child min age must be a number",
    CHILD_MIN_AGE_NEGATIVE: "Child min age cannot be negative",
    CHILD_MIN_AGE_EXCEED: "Child min age cannot exceed 18",
    CHILD_MAX_AGE_NUMBER: "Child Maximum Age must be a number",
    CHILD_MAX_AGE_NEGATIVE: "Child Maximum Age cannot be negative",
    ELDER_MIN_AGE_NUMBER: "Elder Minimum Age must be a number",
    ELDER_MIN_AGE_NEGATIVE: "Elder Minimum Age cannot be negative",
    ELDER_MAX_AGE_NUMBER: "Elder max age must be a number",
    ELDER_MAX_AGE_MIN: "Elder max age must be at least 18",
    ELDER_MAX_AGE_EXCEED: "Elder max age cannot exceed 120",
    CURRENCY_REQUIRED: "Currency is required",
    WAITLIST_TRIGGER_LESS_THAN_SEATS:
      "Waitlist trigger must be less than total seats",
    WAITLIST_TRIGGER_REQUIRED: "Waitlist trigger count is required",
    AT_LEAST_ONE_VENUE: "At least one venue is required",
    SESSION_NAME_REQUIRED: "Session name is required",
    MODE_OF_OPERATION_REQUIRED: "Mode of operation is required",
    MODE_OF_SESSION_VALUES: "Mode of session must be one of: Online, Offline, or Hybrid",
    SEAT_LIMIT_REQUIRED: "Seat limit is required",
    PROGRAM_START_DATE_REQUIRED: "Program start date is required",
    PROGRAM_START_DATE_IN_PAST: "Sub-program start date cannot be in the past",
    PROGRAM_START_DATE_BEFORE_MAIN: "Sub-program start date must be within the program date range",
    PROGRAM_END_DATE_AFTER_MAIN: "Sub-program end date must be within the program date range",
    PROGRAM_START_TIME_AFTER_PREV: "Sub-program start time must be after the previous sub-program's end time",
    PROGRAM_START_TIME_REQUIRED: "Sub-program start time is required",
    PROGRAM_END_DATE_AFTER_START:
      "Program end date must be after on program start date",
    PROGRAM_END_DATE_REQUIRED: "Program end date is required",
    PROGRAM_END_TIME_REQUIRED: "Sub-program end time is required",
    CHECKIN_START_DATE_REQUIRED: "Check-in start date is required",
    CHECKIN_START_AFTER_PROGRAM_START:
      "Check-in start date must be after program start date",
    CHECKIN_START_BEFORE_PROGRAM_END:
      "Check-in start date must be before or same as program end date",
    CHECKIN_START_TIME_REQUIRED: "Check-in start time is required",
    CHECKIN_END_DATE_AFTER_START:
      "Check-in end date must be after check-in start date",
    CHECKIN_END_BEFORE_PROGRAM_END:
      "Check-in end date must be before or same as program end date",
    CHECKIN_END_DATE_REQUIRED: "Check-in end date is required",
    CHECKIN_END_TIME_REQUIRED: "Check-in end time is required",
    CHECKIN_END_TIME_AFTER_START:
      "Check-in end time must be after check-in start time",
    CHECKOUT_START_DATE_REQUIRED: "Check-out start date is required",
    CHECKOUT_START_BEFORE_PROGRAM_END:
      "Check-out start date must be before or same as program end date",
    CHECKOUT_START_TIME_REQUIRED: "Check-out start time is required",
    CHECKOUT_START_TIME_AFTER_PROGRAM_END:
      "Check-out start time must be after sub-program end time",
    CHECKOUT_END_AFTER_START:
      "Check-out end date must be after check-out start date",
    CHECKOUT_END_AFTER_PROGRAM_END:
      "Check-out end date must be after program end date",
    CHECKOUT_END_DATE_REQUIRED: "Check-out end date is required",
    CHECKOUT_END_TIME_REQUIRED: "Check-out end time is required",
    CHECKOUT_END_TIME_AFTER_START:
      "Check-out end time must be after check-out start time",
    PROGRAM_END_TIME_AFTER_START:
      "Program end time must be after program start time",
    AT_LEAST_ONE_SESSION: "At least one session is required",
    FIRST_PRICE_REQUIRED: "First price is required",
    SECOND_PRICE_REQUIRED: "Second price is required",
    PRICE_REQUIRED: "Price is required",
    REGISTRATION_START_TIME_REQUIRED: "Registration start time is required",
    REGISTRATION_END_TIME_REQUIRED: "Registration end time is required",
    MAX_SEATS_REQUIRED: "Maximum seats is required",
    VENUE_REQUIRED_OFFLINE: "Venue is required for offline programs",
    TOTAL_BED_COUNT_REQUIRED_RESIDENTIAL: "Total bed count is required for residential programs",
    SESSION_START_DATE_REQUIRED: "Start date is required",
    SESSION_END_DATE_REQUIRED: "End date is required",
    SESSION_START_TIME_REQUIRED: "Start time is required",
    SESSION_END_TIME_REQUIRED: "End time is required",
    SESSION_CHECKIN_TIME_REQUIRED: "Check-in time is required",
    SESSION_CHECKOUT_TIME_REQUIRED: "Check-out time is required",
    SESSION_TYPE_REQUIRED: "Session type is required",
    SESSION_PRICE_REQUIRED: "Session price is required",
    SESSION_PRICE_NUMBER: "Session price must be a number",
    SESSION_PRICE_NEGATIVE: "Session price cannot be negative",
    END_DATE_ON_OR_AFTER_START: "End date must be on or after start date",
    CHECKIN_END_AFTER_CHECKIN_START: "Check-in end must be after check-in start",
    CHECKOUT_AFTER_CHECKIN_START: "Check-out must be after check-in start",
    CHECKOUT_END_AFTER_CHECKOUT_START: "Check-out end must be after check-out start",
    MODE_OF_PROGRAM_REQUIRED: "Mode of program is required",
    PROGRAM_STRUCTURE_REQUIRED: "Program structure is required",
  },
  ERRORS: {
    PROGRAM_TYPE_ID_REQUIRED: "Program type ID is required",
    FETCH_PROGRAM_TYPE_FAILED:
      "Failed to fetch program type details, please try again later.",
    UPDATE_NO_DATA:
      "Error: Cannot update - program data not loaded. Please try again.",
    UPDATE_NO_ID:
      "Error: Cannot update - program ID is missing. Please try again.",
    FETCH_QUESTIONS_FAILED: "Failed to fetch questions",
    FILE_UPLOAD_FAILED: "File upload failed. Please try again.",
    VALIDATION_ERRORS:
      "Please fix validation errors before updating. Check console for details.",
    PROGRAM_UPDATE_FAILED:
      "Failed to update program. Please check console for details.",
    PROGRAM_CREATE_FAILED:
      "Failed to create program. Please check console for details.",
    SEAT_LIMIT_DECREASE_NOT_ALLOWED:
      "For published programs, seat limit can only be increased, not decreased.",
    NO_PROGRAM_DATA: "No program data found",
    NO_PROGRAM_TYPE_DETAILS: "No program type details found",
    GENERIC_ERROR_TITLE: "Error",
    UPLOAD_ERROR_TITLE: "Upload Error",
    NO_SUB_PROGRAMS: "Please add at least one sub-program before saving.",
    NO_SESSIONS: "Please add at least one session before saving.",
    SESSION_COUNT_MISMATCH: (declared: number, actual: number) =>
      `Number of sessions declared (${declared}) does not match the sessions added (${actual}). Please add or remove sessions accordingly.`,
    SUB_PROGRAM_COUNT_MISMATCH: (declared: number, actual: number) =>
      `Number of sub-programs declared (${declared}) does not match the sub-programs added (${actual}). Please add or remove sub-programs accordingly.`,
  },
  UI: {
    UPDATE_PROGRAM: "Update program",
    CREATE_PROGRAM: "Create program",
    SETUP_INTRO: "Let's begin setting up your",
    PROGRAM_SUFFIX: "program,",
    DEFAULT_SEEKER: "Seeker",
    DEFAULT_SECTION_NAME: "General Information",
    DEFAULT_SECTION_SUBTITLE: "Please fill out the following information",
    ADD_CUSTOM_VENUE: "Add Custom Venue",
    ACTION_UPDATE: "update",
    ACTION_CREATE: "create",
    ACTION_CONTINUE: "continue",
    ACTION_UPDATE_PROGRAM: "Update Program",
    CANCEL: "Cancel",
    CUSTOM_VENUE_MODAL_TITLE: "Adding a Custom Venue",
    CUSTOM_VENUE_MODAL_MESSAGE: "Enter the Venue Address",
  },
  DEFAULT_SESSIONS: {
    HDB_1_TITLE: "HDB 1",
    HDB_1_DESC: "Higher Deeper Beyond Session 1",
    HDB_2_TITLE: "HDB 2",
    HDB_2_DESC: "Higher Deeper Beyond Session 2",
    HDB_3_TITLE: "HDB 3",
    HDB_3_DESC: "Higher Deeper Beyond Session 3",
    MSD_1_TITLE: "MSD 1",
    MSD_1_DESC: "Higher Deeper Beyond Session 4",
    MSD_2_TITLE: "MSD 2",
    MSD_2_DESC: "Higher Deeper Beyond Session 5",
  },
  SCREEN_STATES: {
    SUCCESS: "success",
    PROGRAM_TYPES: "programTypes",
  },
  VALUES: {
    SESSION_PREFIX: "Session ",
    FREQUENCY_YEARLY: "yearly",
    STATUS_DRAFT: "draft",
    STATUS_SCHEDULED: "scheduled",
    REGISTRATION_LEVEL_PROGRAM: "program",
    ADDRESS_TYPE_BILLING: "billing_address",
    SUB_PROGRAM_TYPE_HDB: "PST_HDB",
    DEFAULT_CHECKIN_TIME: "09:00",
    DEFAULT_CHECKOUT_TIME: "18:00",
    TIMESTAMP_MILLIS_SUFFIX: ":00.000Z",
    TIMESTAMP_SECONDS_SUFFIX: ":00Z",
    LOADER_TYPE_LARGE: "large",
    LOADER_TYPE_SMALL: "small",
    LOCAL_STORAGE_SEEKER_DETAILS: "seekerDetails",
    VALIDATION_MODE_ON_BLUR: "onBlur",
    COMPONENT_TYPE_FORM: "form",
    BANNER_INPUT_ID: "banner-upload-input",
  },
  NOTIFY: {
    SUCCESS_TITLE: "Success",
    SUCCESS_TYPE: "success",
    VALIDATION_ERROR_TITLE: "Validation Error",
  },
};

export const PROGRAM_DETAILS_FORM_TEXT = {
  FIELD_NAMES: {
    // Program Details Fields
    PROGRAM_NAME: 'programName' as const,
    PROGRAM_CODE: 'programCode' as const,
    DESCRIPTION: 'description' as const,
    MODE_OF_PROGRAM: 'modeOfProgram' as const,
    IS_RESIDENTIAL: 'isResendential' as const,
    VENUE_ADDRESS: 'venueAddress' as const,
    TOTAL_BED_COUNT: 'totalBedCount' as const,
    HAS_SEAT_LIMIT: 'hasSeatLimit' as const,
    SEAT_LIMIT: 'seatLimit' as const,
    HAS_WAITLIST: 'hasWaitlist' as const,
    WAITLIST_TRIGGER_COUNT: 'waitlistTriggerCount' as const,
    START_DATE: 'startDate' as const,
    END_DATE: 'endDate' as const,
    REGISTRATION_START_DATE: 'registrationStartDate' as const,
    REGISTRATION_END_DATE: 'registrationEndDate' as const,
    APPROVAL_REQUIRED: 'approvalRequired' as const,
    HDB_FEE: 'hdbFee' as const,
    MSD_FEE: 'msdFee' as const,
    CHILD_MIN_AGE: 'childMinAge' as const,
    ELDER_MAX_AGE: 'elderMaxAge' as const,
    HELP_LINE_NUMBER: 'helpLineNumber' as const,
    EMAIL_SENDER_NAME: 'emailSenderName' as const,
    EMAIL_SENDER_ADDRESS: 'emailSenderAddress' as const,
    EMAIL_BCC_NAME: 'emailBccName' as const,
    EMAIL_BCC_ADDRESS: 'emailBccAddress' as const,
    VENUE_NAME_IN_EMAIL: 'venueNameInEmail' as const,
  },
  SECTIONS: {
    PROGRAM_DETAILS: 'programDetails' as const,
    SUB_PROGRAMS: 'subPrograms' as const,
  },
  VALIDATION: {
    PROGRAM_NAME_REQUIRED: "Program name is required",
    PROGRAM_CODE_REQUIRED: "Program code is required",
    DESCRIPTION_MIN_LENGTH: "Description should be at least 10 characters",
    START_DATE_REQUIRED: "Start date is required",
    END_DATE_REQUIRED: "End date is required",
    MODE_REQUIRED: "Please select a mode",
    VENUE_REQUIRED: "venue is required",
    VENUE_NOT_SELECTED: "venue is not selected",
    REGISTRATION_START_DATE_REQUIRED: "Registration start date is required",
    REGISTRATION_START_TIME_REQUIRED: "Registration start time is required",
    REGISTRATION_END_DATE_REQUIRED: "Registration end date is required",
    REGISTRATION_END_TIME_REQUIRED: "Registration end time is required",
    CHILD_MIN_AGE_NEGATIVE: "Child min age cannot be negative",
    CHILD_MIN_AGE_EXCEED: "Child min age cannot exceed 18",
    ELDER_MAX_AGE_MIN: "Elder max age must be at least 18",
    ELDER_MAX_AGE_EXCEED: "Elder max age cannot exceed 120",
  },
  UI: {
    SECTION_TITLE: "Program details",
    SECTION_SUBTITLE:
      "We'll start with the program details — Give it a name, describe its essence, and set the foundation.",
    PROGRAM_NAME_LABEL: "What's the program called?",
    PROGRAM_CODE_LABEL: "Program Code",
    DESCRIPTION_LABEL: "Add description of the program",
    DESCRIPTION_PLACEHOLDER:
      "What is this program all about? Share its core intention and unique value.",
    MODE_LABEL: "What is mode of program?",
    RESIDENTIAL_LABEL: "Is this residential program?",
    VENUE_LABEL: "Venue",
    TOTAL_BED_COUNT_LABEL: "Total bed count",
    SEAT_LIMIT_LABEL: "Is there a limit on participants?",
    WAITLIST_LABEL: "Enable waitlist when full?",
    TRIGGER_COUNT_LABEL: "Trigger count",
    PROGRAM_DATES_LABEL: "Program start and end dates",
    DATE_RANGE_PLACEHOLDER: "Select program date range",
    REGISTRATION_START_LABEL: "Registration start date & time",
    REGISTRATION_END_LABEL: "Registration end date & time",
    APPROVAL_LABEL: "Do you need to approve Registration?",
    CHILD_MIN_AGE_LABEL: "Child minimum age",
    ELDER_MAX_AGE_LABEL: "Elder maximum age",
    HELP_LINE_LABEL: "Help line number",
    EMAIL_SENDER_LABEL: "Name of the emails sender",
    EMAIL_SENDER_ADDRESS_LABEL: "Email Sender Address",
    EMAIL_BCC_NAME_LABEL: "BCC Name",
    EMAIL_BCC_ADDRESS_LABEL: "BCC Email Address",
    VENUE_IN_EMAIL_LABEL: "Name of the venue in email",
    CURRENCY_LABEL: "Select the currency for the program fee",
    HDB_FEE_LABEL: "Enter HDB Fee",
    MSD_FEE_LABEL: "Enter MSD Fee",
    NUMBER_OF_SEATS_LABEL: "Number of seats",
    YES: "Yes",
    NO: "No",
    ONLINE: "Online",
    OFFLINE: "Offline",
    HYBRID: "Hybrid",
    LIMIT_PARTICIPANTS: "Limit participants",
    UNLIMITED_PARTICIPANTS: "Unlimited participants",
    YES_ALLOW_WAITLIST: "Yes, allow waitlist",
    NO_WAITLIST: "No Waitlist",
    YES_REQUIRE_APPROVAL: "Yes, require approval",
    NO_APPROVAL_NEEDED: "No approval needed",
    ADD_CUSTOM_VENUE: "Add Custom Venue",
    OTHER: "Other",
    ADD_SESSION: " Add Session",
    SESSION: "Session",
  },
  PLACEHOLDERS: {
    PROGRAM_NAME: "HDB -25",
    PROGRAM_CODE: "HDB2026",
    DESCRIPTION_PLACEHOLDER:
      "What is this program all about? Share its core intention and unique value.",
    CHILD_AGE: "12",
    ELDER_AGE: "60",
    HELP_LINE: "1234567890",
    EMAIL_SENDER: "infinitheism",
    EMAIL_SENDER_ADDRESS: "Enter email sender address",
    EMAIL_BCC_NAME: "Enter BCC name (optional)",
    EMAIL_BCC_ADDRESS: "Enter BCC email address (optional)",
    VENUE_IN_EMAIL: "Leonia Holistic Destination",
    BED_COUNT: "Enter bed count",
    SEAT_COUNT: "Enter Seats",
    TRIGGER_COUNT: "Enter Count",
    SELECT_VENUE: "Select the venue",
    ENTER_FEE: "Enter Fee",
  },
  VALUES: {
    CURRENCY_INR: "INR (₹)",
    HDB_MSD_IDENTIFIER: "HDB/MSD",
    DATE_FORMAT: "dd MMM yyyy",
    PLACEMENT_BOTTOM_START: "bottomStart",
    WIDTH_FULL: "105%",
    SEEKER_DETAILS_KEY: "seekerDetails",
    // Radio button values
    YES_VALUE: "yes",
    NO_VALUE: "no",
    // Mode of program values
    ONLINE_VALUE: "online",
    OFFLINE_VALUE: "offline",
    HYBRID_VALUE: "hybrid",
    // Program type identifier
    HDB_VALUE: "HDB",
  },
};

// Form Builder Constants
export const API_ENDPOINTS = [
  {
    label: "RM List",
    value: "user?filters=%7B%22role%22%3A%20%226%22%7D&limit=1000",
    type: "user",
    requiresCategory: false,
  },
  {
    label: "Relation List",
    value: "lookup-data/all",
    type: "lookup",
    category: "RELATION",
    requiresCategory: false,
  },
  {
    label: "Airline List",
    value: "lookup-data/all",
    type: "lookup",
    category: "AIRLINE",
    requiresCategory: false,
  },
  {
    label: "Country List",
    value: "lookup-data/all",
    type: "lookup",
    category: "COUNTRY",
    requiresCategory: false,
  },
  {
    label: "State List",
    value: "lookup-data/all",
    type: "lookup",
    category: "STATE",
    requiresCategory: false,
  },
  {
    label: "City List",
    value: "lookup-data/all",
    type: "lookup",
    category: "CITY_NAME",
    requiresCategory: false,
  },
   {
    label: "Bank List",
    value: "lookup-data/all",
    type: "lookup",
    category: "BANK_NAME",
    requiresCategory: false,
  },
];

// MultiQuestion Display Label Type Options
export const DISPLAY_LABEL_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "slider", label: "Slider" },
];

// Define which validation fields apply to which display types
export const DISPLAY_TYPE_VALIDATION_FIELDS: { [key: string]: string[] } = {
  text: ['minCharacter', 'maxCharacters'],
  textarea: ['minCharacter', 'maxCharacters'],
  slider: ['minValue', 'maxValue'],
};

// Form Builder UI Text Constants
export const FORM_BUILDER_TEXT = {
  LABELS: {
    LABEL_NAME: "Label Name*",
    FIELD_TYPE: "Field Type*",
    PLACEHOLDER: "Placeholder",
    OPTIONS_MANAGER: "Options Manager (comma separated)",
    OPTIONS_COMMA_SEPARATED: "Options (comma separated)",
    DEPENDS_ON: "Depends On",
    DEPENDS_ON_VALUE: "Depends On Value",
    DEPENDS_ON_TYPE: "Depends On Type",
    OPERATOR: "Operator",
    MIN_VALUE: "Min Value",
    MAX_VALUE: "Max Value",
    VALUE: "Value",
    DATE_CONDITION_TYPE: "Date Condition Type",
    MIN_DATE: "Min Date",
    MAX_DATE: "Max Date",
    MIN_VALUE_VARIABLE: "Min Value Variable (Age Condition)",
    MAX_VALUE_VARIABLE: "Max Value Variable (Age Condition)",
    MIN_DATE_REFERENCE: "Min Date Reference",
    MAX_DATE_REFERENCE: "Max Date Reference",
    PREFILL_FROM: "Prefill From",
    MARK_AS_REQUIRED: "mark as required",
    CONFIGURE_SUB_FIELDS: "Configure Sub-Fields",
    KEY_UNIQUE_IDENTIFIER: "Key (Unique Identifier)*",
    LABEL_SHOWN_TO_SEEKER: "Label (shown to seeker) - Optional",
    DISPLAY_ORDER: "Display Order",
    SUB_SECTION_NAME: "Sub-section Name",
    MINIMUM_CHARACTERS: "Minimum Characters",
    MAXIMUM_CHARACTERS: "Maximum Characters",
    VALIDATION_PATTERN: "Validation Pattern (Regex)",
    MINIMUM_VALUE: "Minimum Value",
    MAXIMUM_VALUE: "Maximum Value",
    EMAIL_PATTERN: "Email Pattern (Regex)",
    MAXIMUM_FILE_SIZE: "Maximum File Size (MB)",
    ALLOWED_FILE_TYPES: "Allowed File Types",
    PATTERN_ERROR_MESSAGE: "Pattern Error Message",
    HELPER_TEXT: "Helper Text",
    CUSTOM_FILE_EXTENSIONS: "Custom File Extensions",
    YEAR_OFFSET: "Year Offset (Minimum Year)",
    MAX_YEAR_OFFSET: "Max Year Offset",
    SELECT_PLACEHOLDER: "Select Placeholder",
    API_LIST_TYPE: "API List Type",
    DATE_VALIDATION_TYPE: "Date Validation Type",
    START_DATE: "Start Date",
    END_DATE: "End Date",
    CUSTOM_CONDITION_TYPE: "Custom Condition Type",
    REFERENCE_DATE_FIELD: "Reference Date Field",
    CUSTOM_PAST_VALUE: "Custom Past Value",
    CUSTOM_FUTURE_VALUE: "Custom Future Value",
    UNIT: "Unit",
    STARTING_YEAR: "Starting Year (Year Offset)",
    ENDING_YEAR: "Ending Year (Max Year Offset)",
  },
  PLACEHOLDERS: {
    ENTER_PLACEHOLDER: "Enter placeholder text",
    ENTER_OPTIONS: "Enter options (e.g. Option1,Option2,Option3)",
    SELECT_QUESTION: "Select question",
    SELECT_VALUES: "Select values",
    SELECT_OPERATOR: "Select operator",
    SELECT_CONDITION_TYPE: "Select condition type",
    SELECT_FIELD_TYPE: "Select field type",
    ENTER_MIN_VALUE: "Enter minimum value",
    ENTER_MAX_VALUE: "Enter maximum value",
    ENTER_VALUE: "Enter value",
    ENTER_VALUE_TO_MATCH: "Enter the value to match",
    SELECT_MIN_DATE: "Select min date",
    SELECT_MAX_DATE: "Select max date",
    SELECT_MIN_DATE_REFERENCE: "Select min date reference",
    SELECT_MAX_DATE_REFERENCE: "Select max date reference",
    SELECT_BEHAVIOR: "Select behavior",
    SELECT_QUESTION_TO_PREFILL: "Select question to prefill from",
    KEY_EXAMPLE: "e.g., song_1, preference_1",
    LABEL_EXAMPLE: "e.g., Song 1, Enter song 1 (leave empty for no label)",
    MIN_AGE_VARIABLE_EXAMPLE: "e.g., childMaxAge or 17",
    MAX_AGE_VARIABLE_EXAMPLE: "e.g., elderMinAge or 60",
    ENTER_SUB_SECTION_NAME: "Enter sub-section name",
    MOVE_TO_SUBSECTION: "Move to sub-section...",
  },
  BUTTONS: {
    ADD_FIELD: "add field",
    ADD_SUB_SECTION: "add sub-section",
    ADD_SUB_FIELD: "add sub-field",
    DELETE_SUB_SECTION: "Delete Sub-section",
    MOVE_OUT_OF_SUB_SECTION: "Move out of sub-section",
    REMOVE: "Remove",
    ADD_ANOTHER_DEPENDS_ON: "Add Another Depends On",
    ADD_DEPENDS_ON: "Add Depends On",
    CANCEL: "Cancel",
    CREATE: "Create",
    CHANGE_BANNER: "change banner",
    ADD_SECTION: "add section",
    ONE_COLUMN: "1 Column",
    TWO_COLUMN: "2 Column",
  },
  MESSAGES: {
    VALIDATION_HINT: "Enter options separated by commas. For example: Option1,Option2,Option3",
    NO_QUESTIONS_IN_SUBSECTION: "No questions in this sub-section. Use \"add field\" button above or move questions here using the dropdown.",
    CONDITION_LABEL: "Condition",
    SUB_FIELD_LABEL: "Sub-Field",
    CHOOSE_AGE_CONDITION: "Choose how to define the age condition for this dependency",
    ENTER_MIN_AGE_VARIABLE: "Enter a variable name or number for minimum age threshold",
    ENTER_MAX_AGE_VARIABLE: "Enter a variable name or number for maximum age threshold. Field will show when age < min OR age > max",
    SELECT_MIN_AGE_REFERENCE: "Select the program date to use as minimum age reference",
    SELECT_MAX_AGE_REFERENCE: "Select the program date to use as maximum age reference. Field will show when age based on date < min OR > max",
    FIELD_SHOWS_WHEN_VALUE_MATCHES: "This field will show when the selected question has this specific value",
    FIELD_VISIBLE_WHEN_MATCHES: "Field will be visible only when the condition matches",
    FIELD_HIDDEN_WHEN_MATCHES: "Field will be hidden when the condition matches",
    FIELD_ENABLED_WHEN_MATCHES: "Field will be enabled (editable) when the condition matches",
    FIELD_DISABLED_WHEN_MATCHES: "Field will be disabled (read-only) when the condition matches",
    FIELD_PREFILL_AUTO: "Field will be automatically filled with value from the selected question",
    SELECT_PAST_DATE_REFERENCE: "Select the program date to use as past date reference",
    SELECT_FUTURE_DATE_REFERENCE: "Select the program date to use as future date reference",
  },
  VALIDATION_HINTS: {
    FILE_EXTENSIONS: "Enter file extensions separated by commas (include the dot)",
    MIN_YEAR: "Set the minimum year that can be selected",
    MAX_YEAR_OFFSET: "Set the offset from current year (0 = current year, 1 = next year, etc.)",
    STARTING_YEAR: "The earliest year that can be selected (e.g., 1995 for years since Infinitheism began)",
    ENDING_YEAR_OFFSET: "Offset from current year: 0 = current year, -1 = last year, 1 = next year",
    API_LIST_TYPE: "Select the type of data list to fetch from the API",
    DATE_VALIDATION_TYPE: "Choose whether to use program dates or custom values for validation",
    PAST_DATE_VALIDATION: "Enter a number (years in past) or variable name for past date validation",
    FUTURE_DATE_VALIDATION: "Enter a number (years in future) or variable name for future date validation",
  },
  OPERATORS: {
    EQUALS: "Equals (=)",
    LESS_THAN: "Less Than (<)",
    GREATER_THAN: "Greater Than (>)",
    LESS_THAN_OR_EQUAL: "Less Than or Equal (<=)",
    GREATER_THAN_OR_EQUAL: "Greater Than or Equal (>=)",
    RANGE: "Range (between)",
  },
  DATE_CONDITION_TYPES: {
    CUSTOM: "Custom Date Range",
    PAST: "Past Date",
    FUTURE: "Future Date",
    TODAY: "Today",
    CUSTOM_VARIABLE: "Custom (Variable or Number)",
    PROGRAM_DATE_RANGE: "Program Date Range",
  },
  DEPENDS_ON_TYPES: {
    SHOW: "Show (when value matches)",
    HIDE: "Hide (when value matches)",
    ENABLE: "Enable (when value matches)",
    DISABLE: "Disable (when value matches)",
    PREFILL: "Prefill (copy value from another field)",
  },
  DATE_REFERENCES: {
    REGISTRATION_START: "Registration Start Date",
    REGISTRATION_END: "Registration End Date",
    PROGRAM_START: "Program Start Date",
    PROGRAM_END: "Program End Date",
    ELDER_MAX_AGE: "Elder Max Age",
    CHILD_MIN_AGE: "Child Min Age",
  },
  FIELD_COUNT: {
    SINGULAR: "field",
    PLURAL: "fields",
  },
  MODAL: {
    CREATE_SUB_SECTION: "Create Sub-section",
  },
  DEFAULT_VALUES: {
    NEW_FIELD: "New Field",
    NEW_SECTION: "New Section",
  },
  VALIDATION_MESSAGES: {
    HELPER_TEXT_INFO: "Informational text displayed below the field to guide users",
  },
  TOGGLES: {
    ENABLE_ADVANCED_VALIDATION: "Enable Advanced Validation",
    ALLOW_DECIMALS: "Allow Decimals",
    ALLOW_MAHATRIA_CHOICE: "Allow Mahatria Choice",
    ALLOW_PAST_YEARS: "Allow Past Years",
    ALLOW_FUTURE_YEARS: "Allow Future Years",
    ALLOW_PAST_DATES: "Allow Past Dates",
    ALLOW_FUTURE_DATES: "Allow Future Dates",
  },
  FILE_TYPE_OPTIONS: {
    IMAGES: "Images",
    VIDEOS: "Videos",
    PROFILE: "Profile",
  },
  UI: {
    HEADING: "Configure registration form",
  },
};

export const FORM_BUILDER_DEFAULTS = {
  SECTION_NAME: "General Information",
  SECTION_DESCRIPTION: "Please fill out the following information",
  PROGRAM: "program",
};

export const BANNER_UPLOAD_TEXT = {
  UPLOAD_ACTION: "upload banner here",
  SHOULD_CHECK_DIMENSIONS: true,
  CHANGE_BANNER_ACTION: "change banner",
  UPLOAD_INSTRUCTIONS: "Please upload your banner image (JPG, JPEG, PNG) or animation (GIF, MP4, WEBM) (max size: 10MB, recommended: 1200x400px for images, allowed width: 1000-1400px, allowed height: 300-600px for images).",
  CHANGE_BANNER_INSTRUCTIONS: "Replace the current banner with a new image (JPG, JPEG, PNG) or animation (GIF, MP4, WEBM) (max size: 10MB, recommended: 1200x400px for images, allowed width: 1000-1400px, allowed height: 300-600px for images).",
  MAX_SIZE_MB: 10,
  RECOMMENDED_WIDTH: 1200,
  RECOMMENDED_HEIGHT: 400,
  MIN_WIDTH: 1000,
  MAX_WIDTH: 1400,
  MIN_HEIGHT: 300,
  MAX_HEIGHT: 600,
  ALLOWED_FORMATS: ["JPG", "JPEG", "PNG", "GIF", "MP4", "WEBM"],
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"],
  PLACEHOLDER_TEXT: "Upload banner image",
  CHANGE_BANNER_PLACEHOLDER: "Change banner image",
  BANNER_UPLOADED_TEXT: "Banner uploaded successfully",
  NO_BANNER_PLACEHOLDER: "No Banner",
  ERROR_MESSAGES: {
    INVALID_FORMAT: "Please upload a valid JPG, JPEG, or PNG image",
    FILE_TOO_LARGE: "File size exceeds 10MB limit",
    UPLOAD_FAILED: "Banner upload failed. Please try again.",
    CHANGE_FAILED: "Failed to change banner. Please try again.",
    BANNER_REQUIRED: "Banner image is required. Please upload a banner before continuing.",
  },
  SUCCESS_MESSAGES: {
    BANNER_UPLOADED: "Banner uploaded successfully",
    BANNER_CHANGED: "Banner changed successfully",
  },
};

export const UPLOAD_TYPE = {
  BANNER: "banner",
  OTHER: "other",
};

export const ANIMATION_MIME_TYPES = ["image/gif", "video/mp4", "video/webm"];

export const YUP_TEST_IDS = {
  UNIQUE_CODE: 'unique-code',
  END_TIME_AFTER_START_TIME: 'end-time-after-start-time',
  SUB_PROGRAM_START_WITHIN_RANGE: 'sub-program-start-within-range',
  SUB_PROGRAM_END_WITHIN_RANGE: 'sub-program-end-within-range',
  START_TIME_AFTER_PREV_END: 'start-time-after-prev-end-time',
  PROGRAM_END_TIME_AFTER_START: 'program-end-time-after-start',
  CHECKIN_END_TIME_AFTER_START: 'checkin-end-time-after-start',
  CHECKOUT_START_TIME_AFTER_PROGRAM_END: 'checkout-start-time-after-program-end',
  CHECKOUT_END_TIME_AFTER_START: 'checkout-end-time-after-start',
  // Same-day time ordering tests for CUSTOM program date overrides
  END_TIME_AFTER_START_SAME_DAY: 'end-time-after-start-same-day',
  REG_END_TIME_AFTER_START_SAME_DAY: 'reg-end-time-after-start-same-day',
  CHECKIN_END_TIME_AFTER_CHECKIN_START_SAME_DAY: 'checkin-end-time-after-checkin-start-same-day',
  CHECKOUT_TIME_AFTER_CHECKIN_SAME_DAY: 'checkout-time-after-checkin-same-day',
  CHECKOUT_END_TIME_AFTER_CHECKOUT_START_SAME_DAY: 'checkout-end-time-after-checkout-start-same-day',
  // Same-day time ordering tests for CUSTOM sub-program date overrides
  SUB_ENDS_AT_AFTER_STARTS_AT_SAME_DAY: 'sub-ends-at-after-starts-at-same-day',
  SUB_CHECKIN_END_AFTER_START_SAME_DAY: 'sub-checkin-end-after-start-same-day',
  SUB_CHECKOUT_AFTER_CHECKIN_SAME_DAY: 'sub-checkout-after-checkin-same-day',
  SUB_CHECKOUT_END_AFTER_CHECKOUT_START_SAME_DAY: 'sub-checkout-end-after-checkout-start-same-day',
};

export const FIELD_VALIDATION_MESSAGES = {
  REQUIRED: (label: string) => `${label} is required`,
  MUST_BE_EMAIL: (label: string) => `${label} must be a valid email`,
  MUST_BE_NUMBER: (label: string) => `${label} must be a number`,
  MUST_BE_URL: (label: string) => `${label} must be a valid URL`,
  FORMAT_INVALID: (label: string) => `${label} format is invalid`,
  START_DATE_REQUIRED: (label: string) => `${label} start date is required`,
  END_DATE_REQUIRED: (label: string) => `${label} end date is required`,
  DATE_REQUIRED: (label: string) => `${label} date is required`,
  TIME_REQUIRED: (label: string) => `${label} time is required`,
  MIN_LENGTH: (label: string, min: number) => `${label} must be at least ${min} characters`,
  MAX_LENGTH: (label: string, max: number) => `${label} must be at most ${max} characters`,
  AT_LEAST: (label: string, min: number) => `${label} must be at least ${min}`,
  AT_MOST: (label: string, max: number) => `${label} must be at most ${max}`,
};

export const IMAGE_UPLOAD_DEFAULTS = {
  ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png'],
  MAX_FILE_SIZE_KB: 2048,
};

export const IMAGE_UPLOAD_ERRORS = {
  INVALID_FORMAT: (labels: string) => `Only ${labels} images are allowed`,
  FILE_TOO_LARGE: (label: string) => `File size must not exceed ${label}`,
  MIN_WIDTH: (min: number, got: number) => `Image width must be at least ${min}px (got ${got}px)`,
  MAX_WIDTH: (max: number, got: number) => `Image width must not exceed ${max}px (got ${got}px)`,
  MIN_HEIGHT: (min: number, got: number) => `Image height must be at least ${min}px (got ${got}px)`,
  MAX_HEIGHT: (max: number, got: number) => `Image height must not exceed ${max}px (got ${got}px)`,
  DIMENSION_READ_FAILED: 'Could not verify image dimensions',
};

export const PUBLISH_MODAL_TEXT = {
  ACCESS_TYPE_PUBLIC: "Public",
  ACCESS_TYPE_RESTRICTED: "Restricted",
  ACCESS_TYPE_INTERNAL: "Internal",
  DIALOG_TITLE_SELECT_USERS: "Select Users",
  DIALOG_TITLE_PUBLISH_PROGRAM: "Publish Program",
  DIALOG_TITLE_PREVIEW_MODE: " (Preview Mode)",
  BUTTON_CANCEL: "cancel",
  BUTTON_BACK: "back",
  BUTTON_PUBLISH: "publish program",
  BUTTON_SELECT_USERS: "select users",
  BUTTON_APPLY_FILTER: "Apply",
  BUTTON_CLEAR_FILTER: "Clear",
  LABEL_SELECT_ACCESS_TYPE: "Select Access Type",
  LABEL_DELETE_EXISTING_REGISTRATIONS: "Delete existing registrations",
  LABEL_DELETE_EXISTING_REGISTRATIONS_DESC: "When users are removed from access, delete their registrations too",
  LABEL_SELECT_USERS_DESC: "Click below to select users who will have access to this program",
  LABEL_FILTER_USERS: "Filter Users",
  LABEL_SEARCH_USERS: "Search by name or email",
  LABEL_AGE: "Age",
  LABEL_GENDER: "Gender",
  LABEL_USER_TYPE: "User Type",
  ALERT_PUBLIC: "Published to all users.",
  ALERT_INTERNAL: "Internal published to some people, later can be published. Select users who will have access.",
  ALERT_RESTRICTED: "Published to some people. Select users who will have access.",
  USER_SELECTED_COUNT: (selected: number, total: number) => `${selected} user(s) selected out of ${total}`,
  CHECKBOX_ALT_CHECKED: "Checked",
  CHECKBOX_ALT_UNCHECKED: "Unchecked",
  CHECKBOX_TITLE_SELECT_ALL: "Select All",
  CHECKBOX_TITLE_DESELECT_ALL: "Deselect All",
  GRID_HEADER_ID: "ID",
  GRID_HEADER_NAME: "Name",
  GRID_HEADER_EMAIL: "Email",
  GRID_HEADER_COUNTRY_CODE: "Country Code",
  GRID_HEADER_PHONE: "Phone",
  GRID_HEADER_USER_TYPE: "User Type",
  GRID_HEADER_GENDER: "Gender",
  GRID_HEADER_AGE: "Age",
  ALT_SEARCH: "search",
  ALT_CLEAR: "clear",
  ALT_FILTER: "filter",
  STATUS_INTERNAL: "internal",
  STATUS_DRAFT: "draft",
  INTERNAL_STATUS_CAPITALIZED: "Internal",
  DRAFT_STATUS_CAPITALIZED: "Draft",
  STATUS_PUBLISHED: "published",
  ACCESS_SCOPE_VIEW_AND_REGISTER: "VIEW_AND_REGISTER",
};

export const USER_TYPE_FILTER_OPTIONS = ["Seeker", "Org"];

// Dynamic Sub-Programs Section Text Constants
export const DYNAMIC_SUB_PROGRAMS_TEXT = {
  SECTION: {
    TITLE: "Sessions / Sub-Programs",
    SUBTITLE: "Configure individual sessions for this program",
    // Conditional titles based on program type
    getTitleByType: (programType: string) => {
      if (programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION) return 'Sessions';
      if (programType === PROGRAM_TYPE_NAMES.CUSTOM_GROUPED) return 'Sub-Programs';
      return 'Sub-Programs';
    },
    getSubtitleByType: (programType: string) => {
      if (programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION)
        return 'Configure individual sessions for this program';
      return 'Configure sub-programs for this program';
    },
  },
  BUTTONS: {
    ADD_SESSION: "Add Session",
    ADD_SUB_PROGRAM: "Add Sub-Program",
    getAddButtonText: (programType: string) => {
      if (programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION) return 'Add Session';
      return 'Add Sub-Program';
    },
    CANCEL: "Cancel",
    DELETE: "Delete",
  },
  LABELS: {
    SESSION: "Session",
    SUB_PROGRAM: "Sub-Program",
    getLabel: (programType: string) => {
      if (programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION) return 'Session';
      return 'Sub-Program';
    },
  },
  DIALOG: {
    DELETE_TITLE: "Delete Session",
    DELETE_MESSAGE: "Are you sure you want to delete this session?",
    getDeleteTitle: (programType: string) => {
      if (programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION) return 'Delete Session';
      return 'Delete Sub-Program';
    },
    getDeleteMessage: (programType: string) => {
      const label = (programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION) ? PROGRAM_TYPE.SESSION_LABEL : PROGRAM_TYPE.SUB_PROGRAM_LABEL;
      return `Are you sure you want to delete this ${label}?`;
    },
  },
  EMPTY_STATE: {
    MESSAGE: 'No sessions added yet. Click "Add Session" to create your first session.',
    getMessageByType: (programType: string) => {
      const isSession = programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION;
      const label = isSession ? PROGRAM_TYPE.SESSION_LABEL : PROGRAM_TYPE.SUB_PROGRAM_LABEL;
      const buttonText = isSession ? 'Add Session' : 'Add Sub-Program';
      return `No ${label}s added yet. Click "${buttonText}" to create your first ${label}.`;
    },
  },
  ARIA: {
    DELETE_SESSION: "Delete session",
    getDeleteAriaLabel: (programType: string) => {
      const label = (programType === PROGRAM_TYPE.TAT_VALUE || programType === PROGRAM_TYPE_NAMES.CUSTOM_SESSION) ? PROGRAM_TYPE.SESSION_LABEL : PROGRAM_TYPE.SUB_PROGRAM_LABEL;
      return `Delete ${label}`;
    },
  },
};

// Form Field Types
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  RADIO: 'radio',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  DATERANGE: 'daterange',
  DATETIME: 'datetime',
  CREATABLE_SELECT: 'creatableSelect',
  IMAGE_UPLOAD: 'imageUpload',
  DATE: 'date',
  TIME: 'time',
} as const;

// Form Field Names
export const FORM_FIELD_NAMES = {
  PROGRAM_NAME: 'programName',
  PROGRAM_CODE: 'programCode',
  DESCRIPTION: 'description',
  MODE_OF_PROGRAM: 'modeOfProgram',
  CURRENCY: 'currency',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  REGISTRATION_START_DATE: 'registrationStartDate',
  REGISTRATION_END_DATE: 'registrationEndDate',
  REGISTRATION_START_TIME: 'registrationStartTime',
  REGISTRATION_END_TIME: 'registrationEndTime',
  IS_RESIDENTIAL: 'isResendential',
  VENUE_ADDRESS: 'venueAddress',
  TOTAL_BED_COUNT: 'totalBedCount',
  HAS_SEAT_LIMIT: 'hasSeatLimit',
  SEAT_LIMIT: 'seatLimit',
  HAS_WAITLIST: 'hasWaitlist',
  WAITLIST_TRIGGER_COUNT: 'waitlistTriggerCount',
  APPROVAL_REQUIRED: 'approvalRequired',
  IS_PAYMENT_REQUIRED: 'isPaymentRequired',
  PROGRAM_FEE: 'programFee',
  HDB_FEE: 'hdbFee',
  MSD_FEE: 'msdFee',
  CHILD_MIN_AGE: 'childMinAge',
  ELDER_MAX_AGE: 'elderMaxAge',
  HELP_LINE_NUMBER: 'helpLineNumber',
  EMAIL_SENDER_NAME: 'emailSenderName',
  EMAIL_SENDER_ADDRESS: 'emailSenderAddress',
  EMAIL_BCC_NAME: 'emailBccName',
  EMAIL_BCC_ADDRESS: 'emailBccAddress',
  VENUE_NAME_IN_EMAIL: 'venueNameInEmail',
  TDS_LIMIT: 'tdsLimit',
  TDS_APPLICABLE_TO: 'tdsApplicableTo',
  CGST_LIMIT: 'cgstLimit',
  SGST_LIMIT: 'sgstLimit',
  IGST_LIMIT: 'igstLimit',
  NAME_IN_INVOICE: 'nameInInvoice',
  ADDRESS: 'address',
  PAN: 'pan',
  GSTIN: 'gstin',
  CIN: 'cin',
  SUB_PROGRAMS: 'subPrograms',
  SUB_PROGRAM_CODE: 'code',
  BANNER: 'banner',
  BANNER_IMAGE_URL: 'bannerImageUrl',
  BANNER_ANIMATION_URL: 'bannerAnimationUrl',
  PROGRAM_START_DATE: 'programStartDate',
  PROGRAM_END_DATE: 'programEndDate',
  PROGRAM_START_TIME: 'programStartTime',
  PROGRAM_END_TIME: 'programEndTime',
  CHECK_IN_START_DATE: 'checkInStartDate',
  CHECK_IN_START_TIME: 'checkInStartTime',
  CHECK_IN_END_DATE: 'checkInEndDate',
  CHECK_IN_END_TIME: 'checkInEndTime',
  CHECK_OUT_START_DATE: 'checkOutStartDate',
  CHECK_OUT_START_TIME: 'checkOutStartTime',
  CHECK_OUT_END_DATE: 'checkOutEndDate',
  CHECK_OUT_END_TIME: 'checkOutEndTime',
  TITLE: 'title',
  TOTAL_SEATS: 'totalSeats',
  GST_PERCENTAGE: 'gstPercentage',
  SESSION_PRICE: 'sessionPrice',
  VENUE: 'venue',
  MODE_OF_OPERATION: 'modeOfOperation',
  HAS_CHECKIN_CHECKOUT: 'hasCheckinCheckout',
  CHECKIN_AT: 'checkinAt',
  CHECKIN_AT_TIME: 'checkinAtTime',
  CHECKIN_ENDS_AT: 'checkinEndsAt',
  CHECKIN_ENDS_AT_TIME: 'checkinEndsAtTime',
  CHECKOUT_AT: 'checkoutAt',
  CHECKOUT_AT_TIME: 'checkoutAtTime',
  CHECKOUT_ENDS_AT: 'checkoutEndsAt',
  CHECKOUT_ENDS_AT_TIME: 'checkoutEndsAtTime',
  IS_TRAVEL_INVOLVED: 'isTravelInvolved',
  IS_RESIDENCE_REQUIRED: 'isResidenceRequired',
  SAME_ONLINE_DETAILS_FOR_ALL: 'sameOnlineDetailsForAll',
  SAME_VENUE_FOR_ALL: 'sameVenueForAll',
  SESSION_TYPE: 'sessionType',
  PROGRAM_STRUCTURE: 'programStructure',
  NO_OF_SESSION: 'noOfSession',
  NO_OF_SUB_PROGRAMS: 'noOfSubPrograms',
  STARTS_AT: 'startsAt',
  STARTS_AT_TIME: 'startsAtTime',
  ENDS_AT: 'endsAt',
  ENDS_AT_TIME: 'endsAtTime',
} as const;

export const CODE_FORMAT_REGEX = /^[A-Z0-9][A-Z0-9_%\-]*[A-Z0-9]$|^[A-Z0-9]{1}$/; // eslint-disable-line no-useless-escape

// Program Type Names
export const PROGRAM_TYPE_NAMES = {
  HDB: 'HDB',
  TAT: 'TAT',
  ENTRAINMENT: 'Entrainment',
  MSD: 'MSD',
  ENTRAINMENT_UPPER: 'ENTRAINMENT',
  CUSTOM: 'CUSTOM',
  CUSTOM_SESSION: 'CUSTOM_session',
  CUSTOM_GROUPED: 'CUSTOM_grouped',
} as const;

export const PROGRAM_STRUCTURE_VALUES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  GROUPED: 'grouped',
} as const;

// Mode of Program Values
export const MODE_OF_PROGRAM_VALUES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HYBRID: 'hybrid',
} as const;

// Yes/No Values
export const YES_NO_VALUES = {
  YES: 'yes',
  NO: 'no',
} as const;

// Currency Values
export const CURRENCY_VALUES = {
  INR: 'INR',
  USD: 'USD',
  EUR: 'EUR',
} as const;

// Program Status Values
export const PROGRAM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  ACTIVE: 'active',
} as const;

// Online Type Values
export const ONLINE_TYPE_VALUES = {
  MEETING: 'meeting',
  WEBINAR: 'webinar',
  LIVE_STREAM: 'live_stream',
} as const;

// Program Labels and Formatting
export const PROGRAM_LABELS = {
  SUB_PROGRAM: 'Sub-program',
  SESSION: 'Session',
  SESSION_LOWERCASE: 'session',
  DESCRIPTION_SUFFIX: 'description',
  YEAR_SEPARATOR: '–', // En-dash for year ranges like 2026–27
  CODE_SEPARATOR: '_', // Underscore for program codes
} as const;

// Warning and Error Messages
export const WARNING_MESSAGES = {
  PROGRAM_CONFIG_NOT_FOUND: 'Program type config not found for:',
  AVAILABLE_TYPES: 'Available types:',
} as const;

// UI Color Palette Constants
export const UI_COLORS = {
  PRIMARY: '#051B46',
  SECONDARY: '#1859B4',
  WARNING: '#E28619',
  BORDER_DEFAULT: '#C9C9C9',
  BORDER_HOVER: '#8A8A8A',
  BACKGROUND_DISABLED: '#f6f6f6',
  WHITE: '#fff',
  SCROLLBAR_THUMB: '#D9D9D9',
  SCROLLBAR_THUMB_HOVER: '#555',
  BLACK: '#051b46',
} as const;

// Common Dimensions Constants
export const UI_DIMENSIONS = {
  FONT_SIZE: {
    SMALL: 16,
    MEDIUM: 26,
  },
  HEIGHT: {
    INPUT: 40,
    BUTTON: 40,
  },
  WIDTH: {
    FULL: '100%',
    INPUT_MEDIUM: 317,
    INPUT_LARGE: 400,
  },
  BORDER_RADIUS: {
    STANDARD: '8px',
    LEFT_ONLY: '8px 0px 0px 8px',
    RIGHT_ONLY: '0px 8px 8px 0px',
  },
  SCROLLBAR: {
    WIDTH: '4px',
    BORDER_RADIUS: '10px',
  },
} as const;

// Date and Time Format Constants
export const DATE_TIME_FORMATS = {
  DATE_DISPLAY: 'EEEE, dd-MMM-yyyy',
  TIME_12_HOUR: 'hh:mm aaa',
  MONTH_PLACEHOLDER: 'MMM',
  DATE_SHORT: 'dd MMM yyyy',
} as const;

// Session Type Values
export const SESSION_TYPES = {
  HDB: 'ST_HDB',
} as const;

// Common Default Values
export const DEFAULT_VALUES = {
  TIME: {
    START: '09:00',
    END: '18:00',
    DEFAULT_CHECKIN: '09:00',
    DEFAULT_CHECKOUT: '18:00',
    START_FULL: '09:00:00',
    END_FULL: '18:00:00',
  },
  TEXT: {
    PROGRAM_TITLE: 'Program Title',
    VENUE: 'Venue',
    TOTAL_PAYABLE: 'Total Payable',
    HDB_FEE_LABEL: 'HDB Fee',
    MSD_FEE_LABEL: 'MSD Fee',
    DAYS: 'days',
    TO: 'To',
  },
} as const;

// Common Placeholders
export const COMMON_PLACEHOLDERS = {
  ENTER_SUB_PROGRAM_NAME: 'Enter sub-program name',
  ENTER_PROGRAM_NAME: 'Enter program name',
  WHAT_IS_SUB_PROGRAM_ABOUT: 'What is this sub-program about?',
  SELECT_VENUE: 'Select the venue',
  ENTER_FEE: 'Enter Fee',
} as const;

// Error Messages for Components
export const COMPONENT_ERRORS = {
  DATE_PICKER_ERROR: 'Date picker error:',
  CHECKING_DATE: 'Checking date:',
} as const;

// Sub Program Constants
export const SUB_PROGRAM_TEXT = {
  TITLES: {
    WHAT_IS_CALLED: 'What\'s this sub-program called?',
    ADD_DESCRIPTION: 'Add description for the sub-program',
    PROGRAM_START_DATE_TIME: 'Program start date & time',
    PROGRAM_END_DATE_TIME: 'Program end date & time',
    CHECKIN_START_DATE_TIME: 'Check-in starts date & time',
    CHECKIN_END_DATE_TIME: 'Check-in ends date & time',
    CHECKOUT_START_DATE_TIME: 'Check-out starts date & time',
    CHECKOUT_END_DATE_TIME: 'Check-out ends date & time',
    MODE_OF_OPERATION: 'What is mode of sub-program?',
    RESIDENTIAL_PROGRAM: 'Is this residential program?',
    VENUE_SELECTION: 'Where will the sub-program be held?',
    CURRENCY_FOR_FEE: 'Currency for the sub-program fee',
    ENTER_SUB_PROGRAM_FEE: 'Enter sub-program fee',
  },
  SCHEDULER: {
    HEADING: 'Sub-Program Scheduler',
    NO_SESSIONS_AVAILABLE: 'No sessions available',
    NO_SESSIONS_ADDED: 'No sessions added yet. Click "Add Session" to create your first session.',
  },
} as const;

// Currency Symbols
export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  INR_HTML: '&#8377;',
} as const;

export const CUSTOM_PROGRAM_LIMITS = {
  MAX_SESSIONS: 15,
  MAX_SUB_PROGRAMS: 15,
} as const;

export const ONLINE_DETAIL_FIELDS = [
  'onlineType', 'meetingLink', 'meetingId', 'meetingPassword',
  'webinarLink', 'webinarId', 'webinarPassword', 'panelistLink', 'registrationLink',
  'streamUrl', 'backupStreamUrl', 'chatUrl',
] as const;

export const VENUE_FIELDS = ['venue', 'venueNameInEmail'] as const;

export const CREATABLE_ADD_KEY = '__add_other__';

export const ALL_PREFILL_PARENT_FIELDS = [...ONLINE_DETAIL_FIELDS, ...VENUE_FIELDS] as const;
