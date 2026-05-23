import { CategoryResponse, Option } from "./question";

// Export the schema and option type interface
export interface OptionFormData {
  name: string;
  type: string;
  category: string;
  otherCategory?: string;
  otherType?: string;
}

export interface categorySelectOption {
  id: number;
  name: string;
}

export interface CategoryOption {
  value: string | number;
  label: string;
}

export interface AddOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: OptionFormData) => void;
  editingOption: Option | null;
  categories: CategoryResponse;
  fetchCategories: () => Promise<void>;
  isDuplicating?: boolean;
}

export interface OptionMap {
    option: {
      id: number;
      createdAt: string;
      updatedAt: string;
    };
  }


  