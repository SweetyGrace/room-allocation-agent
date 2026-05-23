export interface PrevRating {
  hdbYear: string | null;
  rating: number | null; 
  review: string | null;
  rmContactId: number | null;
  rmContactName: string | null;
}

export interface RegistrationApproval {
  id: number;
  programSession: any;
  userId: number;
  programRegistrationSeqNumber: string | null;
  waitingListSeqNumber: string | null;
  registrationStatus: string;
  basicDetailsStatus: string;
  preferredRoomMate: string | null;
  fullName: string | null;
  gender: string | null;
  mobileNumber: string | null;
  emailAddress: string | null;
  dob: string | null;
  infinitheismContact: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  city: string | null;
  approvals: any;
  allocatedProgram?: any;
  isOrganizationUser?: boolean;
  recommendation?: string;
  isRecommended?:boolean;
  prevRating?: PrevRating
  rmContactUser?: {
    orgUsrName: string | null;
  };
  otherInfinitheismContact?: string | null;
  statusDateTime?: Date | null;
  statusDateTimeLabel?: string | null;
}

export interface Registration {
  id: number;
  program: Program;
  userId: number;
  programRegistrationSeqNumber: string | null;
  waitingListSeqNumber: string | null;
  registrationStatus: string;
  basicDetailsStatus: string;
  registrationDate: string;
  cancellationDate: string | null;
  cancelledBy: string | null;
  rmContact: number;
  preferredRoomMate: string | null;
  fullName: string | null;
  gender: "male" | "female" | "other" | null;
  mobileNumber: string | null;
  emailAddress: string | null;
  dob: string | null;
  infinitheismContact: string | null;
  city: string | null;
  notes: string | null;
  termsAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Program {
  id: number;
  typeId: number;
  name: string;
  code: string | null;
  description: string;
  modeOfOperation: string;
  meta: {
    price: Array<{ [key: string]: number }>;
  };
  noOfSession: number;
}

export interface ApiResponse {
  statusCode: number;
  message: string;
  data: {
    data: { data: RegistrationApproval[] };
    pagination: {
      totalPages: number;
      pageNumber: number;
      pageSize: number;
      totalRecords: number;
      numberOfRecords: number;
    };
  };
}

export interface BlessedResponse {
  statusCode: number;
  message: string;
  data: {
    
  };
}

export interface UserData {
  id: string;
  registrationId: number;
  fullName: string;
  gender: "male" | "female" | "other";
  age: number;
  totalPrograms: number;
  city: string;
  profileImage?: string;
  rating: number;
  lastActiveDate: string;
  completedHDBs: number;
  programPreferences: string[];
  emailAddress: string;
  mobileNumber: string;
  isAssigned: boolean;
  assignedSession?: string;
  swapsRequests?: unknown;
  isDefaulter?: boolean;
  approvalStatus?: string;
  swapRequestId?: number;
}

export interface Session {
  id: string | number;
  name: string;
  type: "HDB" | "MSD" | "OnHold" | "reject";
  level?: number;
  totalSeekers: number;
  maleCount: number;
  femaleCount: number;
  assignedUsers: UserData[];
}

export interface SidebarCounts {
  total: number;
  male: number;
  female: number;
  [key: string]: number;
}

export interface Program {
  id: number;
  programId: number;
  name: string;
  code: string | null;
  description: string;
  startDate: string;
  endDate: string;
  basePrice: string;
  currency: string;
  status: string;
  availableSeats: number;
  type: {
    id: number;
    name: string;
  };
}
export interface Question {
  id: number;
  label: string;
  type: string;
  bindingKey: string;
  config: {
    isRequired?: boolean;
    minCharacter?: number;
    maxCharacters?: number;
    minValue?: number;
    maxValue?: number;
    validationPattern?: string;
    endPoint?: string; // For API calls
    conditionalFields?: number[];
    dependsOn?: {
      questionId: number;
      value: string | number | boolean;
    }[];
  };
  formSection: {
    id: number;
    name: string;
    description: string;
  };
  sectionKey: string;
  questionBindingKey?: string;
  // Old format (will be transformed to this)
  questionOptionMaps: Array<{
    option: {
      id: number;
      name: string;
    };
  }>;
  // New API format (will be transformed to questionOptionMaps)
  optionConfig?: Array<{
    name: string;
    type: string|number|boolean;
    order: number;
    value: string| number | boolean;
  }>;
}
export interface ProgramQuestionMap {
  id: number;
  question: Question;
  registrationLevel: string;
  displayOrder: number;
}
export interface userRegistration {
  id: string;
  program: {
    id: number;
    name: string;
    requiresApproval?: boolean;
    requiresPayment?: boolean;
    involvesTravel?: boolean; // can be removed
    isTravelInvolved?: boolean;
  };
  fullName: string;
  userId?: string | null;

  programRegistrationSeqNumber?: string | null;
  waitingListSeqNumber?: string | null;
  mobileNumber: string;
  emailAddress: string;
  registrationStatus: string;
  basicDetailsStatus: string;
  registrationDate: string | null;
  travelInfo: any[];
  travelPlans: any[];
  invoiceDetails: any[];
  paymentDetails: any[];
}

export interface ProgramDetails {
  id: number;
  name: string;
  code: string;
  bannerImageUrl?: string;
  description: string;
  basePrice: string;
  currency: string;
  requiresApproval: boolean | null;
  duration: string;
  startDate: string;
  checkinDate: string;
  modeOfOperation: string;
  limitedSeats: boolean;
  type: {
    maxSessionDurationDays: number;
    requiresApproval: boolean;
    requiresPayment: boolean;
    involvesTravel: boolean;
    name: string;
    waitlistApplicable: boolean;
    venue: string;
    meta: {
      price: any;
    };
    isGroupedProgram?: boolean;
  };
  statusMessage?: string;
  groupedPrograms: Program[];
  sessions: Program[];
  programQuestionMaps: ProgramQuestionMap[];
}

export interface User {
  [key: string]: object | string | number | boolean | null | undefined;
}
export interface Seeker {
  name: string;
  gender: string;
  age: number;
  programs: string;
  location: string;
  appliedDate: string;
  hdbLevels: string[];
  completedLevels: Record<string, number>;
  journeyYears: string;
  profileImage: string;
  videoThumbnail: string;
  roommate: {
    name: string;
    preference: string;
  };
  questions: Question[];
  rating: Rating;
  review: string;
  reviewer: string;
  otherInfinitheismContact?: string | null;
  isDefaulter?: boolean;
  user? : User;
  userId?: number;
  defaulterComment?: string | null;
  registrationId?: number | string | null;
  id?: number;
}

export interface Question {
  id: number;
  question: string;
  answer: string;
}

export interface Rating {
  overall: number;
  passion: number;
  growth: number;
  infiniteness: number;
  continuity: number;
}

export interface ProgramResponse {
  type: {
    isGroupedProgram: boolean;
  };
  groupedPrograms?: Array<{
    id: number | string;
    name: string;
  }>;
  sessions?: Array<{
    id: number | string;
    name: string;
  }>;
}

export interface SidebarItemState {
  key: string | null;
  kpiCategory: string | null;
  kpiFilter: string | null;
}

export interface ToolBarProps {
  selectedOption: {
    label: string;
    value: string | number;
    data: any;
  };
  isDropdownOpen: boolean;
  searchText: string;
  searchValue: { open: boolean; value: string };
  sessions: any[];
  setIsDropdownUserList: (value: boolean) => void;
  setSelectedOption: (option: any) => void;
  setDropdownAllocatedSessionId: (id: any) => void;
  setIsDropdownOpen: (value: boolean) => void;
  loadUsers: (
    offset: number,
    reset: boolean,
    appliedFilter: any,
    filter: any,
  ) => void;
  setSelectedSidebarItem: (value: SidebarItemState | string) => void;
  handleDropdownSessionSelect: (session: any) => void;
  setSearchText: (text: string) => void;
  setFinalSearchText: (text: string) => void;
  handleSearch: (query: string) => void;
  setSearchValue: (value: { value: string; open: boolean }) => void;
  isOpenFilter: boolean;
  setIsOpenFilter: (value: boolean) => void;
  isFilterApplied: boolean;
  setAppliedFilters: (filters: any) => void;
  setPaginationProps: (props: any) => void;
  setFilterItem: (filter: any) => void;
  filterItem: any;
  appliedFilters: any;
  sortState: SortState;
  handleSort: (sortKey: string | boolean) => void;
  isSortDropdownOpen: boolean;
  setIsSortDropdownOpen: (value: boolean) => void;
}

export interface SessionOverlayProps {
  session?: Session | null;
  isOpen: boolean;
  onClose: () => void;
  selectedSession: Session | null;
  setSelectedSession: (session: Session | null) => void;
  sessionId?: number;
  users: UserData[];
  handleBless: (user: UserData, sessionId: number, tag: string) => void;
  loading: boolean;
  programId?: number;
  sessiondata?: unknown;
  totalRecords?: number;
  customTitle?: string;
  noSeekerMessage?: React.ReactNode;
  preferredName?: string;
  isCardClicked?: boolean;
  setFlippedUserId?: (id: string | null) => void;
  flippedUserId?: string | null;
  kpiData?: {
    unallocatedCounts: {
      totalUnallocatedCount: number;
      totalMaleCount: number;
      totalFemaleCount: number;
      [key: string]: any; // For any additional fields like .totals, etc.
    };
    unallocatedPrograms: any[]; // Replace 'any' with a specific type if available
    allocatedPrograms: any[]; // Replace 'any' with a specific type if available
    allocatedCounts: Record<string, any>;
    allKpi: Record<string, any>;
    swapRequests: any[];
  };
  fromSessionGrid?: boolean;
  isDropdownUserList?: boolean;
  handleBlessed?: (user: UserData, sessionId: number, tag: string) => void;
  onSeekerSelect?: (selectedUser: UserData) => void;
  excludedUserId?: number | null;
  handleSessionPageChange?: (page: number) => void;
  handleSessionPageSizeChange?: (pageSize: number) => void;
  sessionpaginationProps?: {
    sessionpageSize: number;
    sessiontotalRecords: number;
    sessioncurrentPage: number;
  };
  sessions?: Session[] | null;
  sessionSearchText?: string;
  setSessionSearchText?: (text: string) => void;
  fetchApprovedUsersForSession?: (params: {
    kpiCategory: string;
    kpiFilter: string;
    swapRequests?: string;
    canShift?: string;
  }) => void;
  overlayLoader?: boolean;
  setSelectedFilter?: (filter: { [key: string]: any }) => void;
  selectedFilter?: { [key: string]: any };
  isOverlayFromSessionGrid?: boolean;
  showOverlay?: boolean;
  showBlessCard?: boolean;
}

export interface preferenceSeekersProps {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  setSelectedSession: (session: any) => void;
  sessionId?: string | number;
  users: any[];
  preferredName?: string;
  isCardClicked?: boolean;
  setFlippedUserId?: (id: string | number | null) => void;
  flippedUserId?: string | number | null;
  kpiData?: {
    unallocatedPrograms: Array<{ programId: string | number; programName: string }>;
  };
  isDropdownUserList?: boolean;
  handleBlessed?: (...args: any[]) => void;
  onSeekerSelect?: (user: any) => void;
  excludedUserId?: string | number;
  fromSessionGrid?: boolean;
  handleSessionPageChange?: (page: number) => void;
  handleSessionPageSizeChange?: (size: number) => void;
  sessionpaginationProps?: {
    sessiontotalRecords: number;
    sessionpageSize: number;
    sessioncurrentPage: number;
  };
  sessions?: any[];
  sessionSearchText?: string;
  setSessionSearchText?: (text: string) => void;
  overlayLoader?: boolean;
  setSelectedFilter?: (filter: any) => void;
  selectedFilter?: { [key: string]: any };
  isOverlayFromSessionGrid?: boolean;
  showOverlay?: boolean;
}

export interface SessionGridBlessParams {
  user: UserData;
  session: {
    id: string | number;
    type: string;
  };
  selectedSwapSeeker?: UserData | null;
  handleBlessed?: (
    seekerId: unknown,
    sessionId: number | string,
    swapType: string,
    swapRequestId?: number
  ) => void;
  onBless: (
    user: UserData,
    sessionId: number | string,
    sessionType: string
  ) => void;
}

export interface Session {
  id: string | number;
  name: string;
  type: "HDB" | "MSD" | "OnHold" | "reject";
  assignedUsers: UserData[];
  allocatedCount: number;
  totalSeekers: number;
  totalBeds: number;
  organisationUserCount: number;
}

export interface SessionsGridProps {
  sessions: Session[];
  dragOverSessionId: string | number | null;
  selectedSession: Session | null;
  showOverlay: boolean;
  sessionId: number | null;
  approvedUsers: any[];
  isLoading: boolean;
  programId: string;
  totalRecords: number;
  onDragOver: (e: React.DragEvent, sessionId: string | number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, sessionId: string | number) => void;
  onSessionClick: (session: Session) => void;
  onRemoveFromSession: (user: any, sessionId: string | number) => void;
  onBless: (user: any, sessionId: number, sessionType: string) => void;
  onCloseOverlay: () => void;
  handleBlessed?: (
    user: any,
    sessionId: number,
    sessionType: string,
    swapRequestId: number,
  ) => void;
  selectedSwapSeeker?: UserData | null;
  fetchApprovedUsersForSession?: (session: {
    kpiCategory: string;
    kpiFilter: string;
  }) => void;
  setShowOverlay?: (show: boolean) => void;
  setExcludedUserId?: (id: number | null) => void;
  setCustomTitle?: (title: string) => void;
  setIsCardClicked?: (isClicked: boolean) => void;
  sessionpaginationProps: {
    sessionpageSize: number;
    sessiontotalRecords: number;
    sessioncurrentPage: number;
  };
  handleSessionPageChange?: (page: number) => void;
  handleSessionPageSizeChange?: (pageSize: number) => void;
  setSessionSearchText?: (text: string) => void;
  overlayLoader?: boolean; // Optional prop for overlay loader
  selectedFilter?: { [key: string]: any };
  setSelectedFilter?: (filter: { [key: string]: any }) => void;
  setSelectedSession?: (session: Session | null) => void;
  draggedUser?: UserData | null;
}

export type SortOrder = "ASC" | "DESC";
export type SortOrderLower = "asc" | "desc";

export interface SortState {
  sortKey: string;
  sortOrder: SortOrder;
}

export interface KeyPairValues {
  [key: string]: string | number | boolean | KeyPairValues | KeyPairValues[];
}
