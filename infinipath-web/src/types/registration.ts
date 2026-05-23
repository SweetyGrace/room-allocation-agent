export interface ToastContentProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export interface CustomCloseButtonProps {
  closeToast?: () => void;
}

export interface AlertPopupProps {
  type: string;
  message: string[];
  cancelSwap?: boolean;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: (reason?: string) => void;
  title?: string;
  grayBorder?: boolean;
}

export interface SeekerData {
  id: string;
  programId: string;
  seekerName?: string;
  gender?: string;
  age?: number;
  location?: string;
  profilePictureUrl?: string;
  numberOfHDBs?: number;
  preferredRoomMate?: string;
  appliedOn?: string;
  approvalStatus?: string;
  blessedWith?: string;
  averageRating?: number;
  rmComments?: string;
  recommendation?: string;
  recommendationComments?: string;
  [key: string]: unknown;
}

export interface QuickViewHeader {
  key: string;
  label: string;
  type?: string;
  order?: string;
  primaryKey?: string;
  secondaryKey?: string;
}

export interface FormattedValue {
  display: string | { primary: string; secondary: string };
  hasLineBreak: boolean;
}

export interface QuickViewOverlayProps {
  open: boolean;
  onClose: () => void;
  seekersData?: SeekerData;
  quickViewData?:QuickViewHeader;
}



export interface MarkDefaulterPayload {
  registrationId: number;
  userId: number;
  isDefaulter: boolean;
  comment: string;
}


export interface DefaulterTrackingItem {
  id: string;
  seekerDefaulterId: string;
  userId: number;
  registrationId: string;
  performedBy: number;
  actionType: string;
  comment: string;
  role: string;
  previousIsDefaulter: boolean | null;
  performedSeekerProfileUrl: string;
  newIsDefaulter: boolean;
  previousComment: string | null;
  createdAt: string;
  performedByName: string;
  seekerName: string;
}

export interface DefaulterTrackingSectionProps {
  data: DefaulterTrackingItem[];
  className?: string;
}

export interface EInvoiceErrorProps {
  registrationId: number | string;
  refreshTrigger?: number;
}