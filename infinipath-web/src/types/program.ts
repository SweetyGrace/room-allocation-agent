
export interface SubProgram {
    id: string;
    title: string;
    banner?: File | null;
    description: string;
    startDate?: Date | null;
    endDate?: Date | null;
    modeOfProgram: 'online' | 'offline' | 'hybrid';
    venueAddress: string[];
    customVenue: string;
    isTravelRequired?: 'yes' | 'no';
    isResidential?: 'yes' | 'no';
    isPaymentRequired: 'yes' | 'no';
    currency: string;
    programFee: string;
    isHighlighted?: boolean;
    highlightPhase?: 'fade-in' | 'visible' | 'fade-out';
    showCustomVenue?: boolean;
  }
  
  export interface CurrencyOption {
    value: string;
    label: string;
    symbol: string;
  }


  export interface FormSection {
    id: number;
    name: string;
    description: string;
  }
  
  export interface QuestionOption {
    id: number;
    option: {
      id: number;
      name: string;
      type: string;
    };
  }
  
  export interface Question {
    id: number;
    label: string;
    type: string;
    config: {
      isRequired: boolean;
      minCharacter?: number;
      maxCharacters?: number;
      validationPattern?: string;
      endPoint?: string;
    };
    formSection: FormSection;
    questionOptionMaps: QuestionOption[];
  }
  
  export interface ProgramQuestionMap {
    id: number;
    question: Question;
    displayOrder: number;
  }
  
  // Update the GroupedQuestions interface
  export interface GroupedQuestions {
    sections: Array<{
      sectionName: string;
      questions: ProgramQuestionMap[];
      sectionDisplayOrder: number;
    }>;
  }
  
  export interface ApiOption {
    value: string;
    label: string;
  }
  
  // Update the PublishPayload interface
  export interface PublishPayload {
    programId: number;
    sections: Array<{
      sectionName: string;
      questions: Array<{
        questionId: number;
        displayOrder: number;
      }>;
      sectionDisplayOrder: number;
    }>;
    registrationLevel: string;
    programSessionId: number;
  }
  
  // Add this interface for API response
  export interface ProgramQuestionResponse {
    data: {
      statusCode: number;
      data: any[];
    };
  }

  export interface RatingItem {
    id: number;
    programRegistrationId: string;
    rmId: number;
    ratingKey: string;
    rating: string;
  }
  
  export interface RatingSectionProps {
    ratings: RatingItem[];
    review?: string;
    reviewer?: string;
  }

  export interface LoaderCounts {
  smallLoaderCount: number;
  largeLoaderCount: number;
  mediumLoaderCount: number;
}

export type LoaderType = 'small' | 'medium' | 'large';