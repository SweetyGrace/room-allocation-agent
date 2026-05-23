export interface CardData {
  createdAt: string;
  id: number;
  message?: string;
  firstName: string;
  lastName: string;
  mediaType: "video" | "message";
  mediaUrl: string | null;
  profileIcon: string;
  isPrivate: boolean;
  isViewed: boolean;
  allocatedProgramName?: string;
  allocatedProgramId?: number;
  index?: number;
}

export interface SeekerExperienceProps {
  allocatedProgramId?: number | null;
  isProgramDataReady?: boolean;
}
export interface SeekerMessageProps {
  open: boolean;
  onClose: () => void;
  messages: CardData[];
  newRecordsCount: number;
  handleNewMessagesClick?: () => void;
  isLoading?: boolean;
  handleLoadMoreData?: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  totalRecordCount: number;
  searchString: string; // The input value (what user is typing)
  activeSearchString: string; // The confirmed search value (after Enter)
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onMarkMessageViewed?: (message: CardData, onComplete?: () => void) => void;
}