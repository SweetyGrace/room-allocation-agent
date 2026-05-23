export interface BorderButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
}
export interface CheckboxWithTextProps {
    text: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface DashboardHeaderProps {
  title?: string;
  onSearch: (value: string) => void; 
  setSearchPopup?: (value: boolean) => void;
  onClick?: () => void;
  errors?: number;
  totalDataLength?: number;
  appliedFilters?: any;
  dashboardClassname?: string;
  enableFilter?: boolean;
  enableExport?: boolean; 
  onExport?: () => void;
  searchValue: {
    value: string;
    open: boolean;
  };
  filterPills?: React.ReactNode;
  setSearchValue?: (value: { value: string; open: boolean }) => void;
  onFilterClick?: () => void;
  onSearchValueChange: (val: string) => void;
  activeTab?: number;
  onEmailClick?: () => void;
  communicationCategory?: string;
  setSelectedOption?: (option: "filtered" | "all") => void;
  selectedOptions?: "filtered" | "all" | "download";
  handleDownload?: (reportName: string, selectedReport?: string) => void;
  isDraftsPage?: boolean;
  viewList?: any[];
  onBulkIdProofs?: () => void;
  idProofDataAvailable?: boolean;
}
export interface HeadingSubheadingProps {
  subheading: string;
  mainHeading: string;
  additionalClassName?: string;
  handleClick?: () => void;
  isActive?: boolean; 
  index?: number;
  totalLength?: number;
}
export interface ImageAndTextProps {
  image: string;
  text: string;
  additionalClassName?: string;
  additionalTextClassName?: string;
  handleContainerClick?: () => void;
  handleImageClick?: () => void;
  className?: string;
  hoverImage?: string;
}

// ADD: Interface for roommate overlay state
export interface RoommateOverlayState {
  isOpen: boolean;
  preferredName: string;
  seekerId: number;
  user?: User; // User object or empty object
}
export interface PreferredRoommateOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  preferredName: string;
  seekerId?: number | string;
  programId: number;
  subProgramId?: number;
  setToastState: (state: { open: boolean; message: string }) => void;
  roommateOverlayDetails?: RoommateOverlayState;
  setCheckReload: React.Dispatch<React.SetStateAction<boolean>>;
  setSeekerLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SeekerData {
  id: number;
  fullName: string;
  profileUrl: string;
  gender: string;
  dob: string;
  city: string;
  otherCityName?: string;
  preferredRoomMate?: string;
  pairCode?: string;
}
export interface KPIData {
  type: string;
  label: string;
  count: number;
  key: string;
}
export interface SortItem {
  key: string;
  order: "asc" | "desc";
}
export interface User {
  [x: string]: any;
  id: string;
  name: string;
  age: number;
  city: string;
  profile: string | null;
  gender: string;
  preferredRoomMate?: string | null;
  programRegistrationId?: number | string;
  isPaired?: boolean;
  pairCode?: number | null;
  registrationPairId?: number | null;
  offsetNumber?: number;
  roomAllocationId?: string | number;
  userId?: string;
  roomId?: string;
  noOfHDBs?: number;
  departureDatetime?: string;
  rmName?: string;
}
export interface SelectedFilters {
  floor: string[];
  roomStatus: string[];
  gender: string[];
  age: string[];
  location: string[];
  roomType: string[];
}
export interface SeekersFilters {
  gender: string[];
  age: string[];
  location: string[];
}
export interface Room {
  floor: string;
  roomId: string;
  capacity: number;
  roomInventoryId: number;
  occupants: { id: string; value: User | null; bedId: number; }[];
  isChecked: boolean;
  remainingOccupancy: number;
  programId: string | number;
  subProgramId?: string | number | undefined;
  offsetNumber?: number;
  roomCategory?: string;
  isReserved?: boolean;
  roomStatus?: string;
  reservedFor?: string;
}
export interface OccupantSlotProps {
  occupantId: string;
  occupant: User | null;
  roomvalue: Room;
  roomOffset: number | undefined;
  onDropUser: (user: User, occupantId: string, roomInfo?: Room) => void;
  onCheckboxChange: (
    isChecked: boolean,
    occupant: User | null,
    roomId: string,
    offsetNumber:number,
  ) => void;
  roomId: string;
  clear: boolean;
  isClicked: boolean;
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
  ispairHighlight: boolean;
  setIsPairHighlight: React.Dispatch<React.SetStateAction<boolean>>;
  setToastState: React.Dispatch<React.SetStateAction<{ message: string; open: boolean }>>;
  onShowAllMatches: (preferredName: string, seekerId: string | number) => void;
  isOverlayOpen: boolean;
}
export interface RoomProps {
  room: Room;
  onDropUser: (user: User, occupantId: string | null, roomInfo?: Room) => void;
  onCheckboxChange: (
    isChecked: boolean,
    occupant: User | null,
    roomId: string,
  ) => void;
  clear: boolean;
  setClear: React.Dispatch<React.SetStateAction<boolean>>;
  isChecked: any;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckReload: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckedOccupants: React.Dispatch<React.SetStateAction<User[]>>;
  programId: string | number;
  subProgramId?: string | number | undefined;
  setToastState: React.Dispatch<React.SetStateAction<{ message: string; open: boolean }>>;
  onShowAllMatches: (preferredName: string, seekerId: string | number) => void;
  checkedOccupants: User[];
  isOverlayOpen: boolean;
  setSelectedSeekers: React.Dispatch<React.SetStateAction<User[]>>;
  fetchRoomData: (isLoader: boolean) => void;
  fetchApi: (isLoader: boolean) => void;
  setSeekerOffset: React.Dispatch<React.SetStateAction<number>>;
  setRoomOffset: React.Dispatch<React.SetStateAction<number>>;
  roomOffset: number;
}
export interface UsersListProps {
  users: User[];
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  onDropUser: (user: User, occupantId: string | null, roomInfo?: Room) => void;
  userListRef: React.RefObject<HTMLDivElement>;
  handleUserListScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckReload: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSeekers: User[];
  setSelectedSeekers: React.Dispatch<React.SetStateAction<User[]>>;
  setToastState: React.Dispatch<
    React.SetStateAction<{ message: string; open: boolean }>
  >;
  dataLength: number;
  seekersFilters: SeekersFilters;
  setSeekersFilters: React.Dispatch<React.SetStateAction<SeekersFilters>>;
  subProgramId?: string | undefined;
  sortState: { key: string; order: "asc" | "desc" } | null;
  setSortState: React.Dispatch<React.SetStateAction<{ key: string; order: "asc" | "desc" } | null>>;
  onShowAllMatches?: (user: User, preferredName: string, seekerId: string | number) => void;
  isOverlayOpen: boolean;
  programEndsAt?: string;
  setSkipRoom: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface PairedUsersProps {
  user1: User;
  user2: User;
  selectedSeekers: User[];
  setSelectedSeekers: React.Dispatch<React.SetStateAction<User[]>>;
  pairCodes: number[];
  setCheckReload: (check: boolean) => void;
  setToastState: (state: any) => void;
  users: User[];
  index: number;
  onShowAllMatches?: (preferredName: string, seekerId: string | number) => void;
  isOverlayOpen: boolean;
  setSkipRoom: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface UserComponentProps {
  user: User;
  setSelectedSeekers: React.Dispatch<React.SetStateAction<User[]>>;
  selectedSeekers: User[];
  pairCodes: Array<number>;
  index: number;
  users: User[];
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckReload: React.Dispatch<React.SetStateAction<boolean>>;
  setToastState: React.Dispatch<
    React.SetStateAction<{ message: string; open: boolean }>
  >;
  dataLength: number;
  onShowAllMatches?: (preferredName: string, seekerId: string | number) => void;
  isOverlayOpen: boolean;
}
export interface FilterConfig {
  key: string;
  label: string;
  type: string;
  sortable: boolean;
  filterable: boolean;
  order: number;
  options?: Array<{ value: string; label: string }>;
}

export interface FilterDropdownsProps {
  filters: FilterConfig[];
  onFilterChange?: (filters: { [key: string]: string }) => void;
}

