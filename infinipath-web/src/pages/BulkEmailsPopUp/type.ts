import { GridColDef } from "@mui/x-data-grid";

export interface BulkEmailsPopupProps {
    open: boolean;
    onClose: () => void;
    bulkEmailUrlData: { programId?: number; subProgramId?: number; parentFilter?: string; filters?: { kpiFilter?: string; kpiCategory?: string; [key: string]: any } };
    headers?: GridColDef[];
    loading?: boolean;
    programKey?: string;
    kpiFilter?: string;
}

export interface RadioType {
    value: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string
}

export interface EmailTriggerOption {
    id: string;
    category: string;
    templateName: string;
    programId: string;
    templateKey: string;
    communicationTypes: string[]; // Array of available communication types: ['email', 'whatsapp']
    templateIds: { [key: string]: string }; // Map of communicationType to template ID
}

