export interface Program {
    id: number;
    programId: number;
    name: string;
    code: string;
    description: string;
    startDate: string;
    endDate: string;
    basePrice: string;
    currency: string;
    status: string;
    availableSeats: number;
    duration: string;
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
      minYears?: number;
      maxYears?: number;
      isRequired?: boolean;
      minCharacter?: number;
      maxCharacters?: number;
      minValue?: number;
      maxValue?: number;
      validationPattern?: string;
      // endPoint?: string; // For API calls
      apiUrl?: string;
      category?: string;
      conditionalFields?: number[];
      showDialog?: {
        type: string;
        isShow: boolean | string;
        imageName: string | null;
        contentType: string | null;
        dialogueContent: string | null;
      } | null;
      dependsOn?: {
        questionId: number;
        value: string | number | boolean;
      }[];
      validationConfig?: {
        validationPattern: patternObj[];
      dependentBindingKey: string;
      }
      patternErrorMsg: string;
    };
    formSection: {
      id: number;
      name: string;
      description: string;
    };
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
      type: string | number | boolean;
      order: number;
      value: string | number | boolean;
    }>;
  }

  export interface patternObj {
    length?: number;
    pattern?: number;
    validateif?: string;
  }
  export interface FormResponse {
    [key: string]: any;
  }
  
  export interface ProgramQuestionMap {
    id: number;
    question: Question;
    registrationLevel: string;
    displayOrder: number;
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
    startsAt?: string;
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
    sessions: Program[];
    programQuestionMaps: ProgramQuestionMap[];
    groupedPrograms: Program[];
  }

  export interface GroupedQuestion {
    [key: number]: string;
  }

  export interface StepperItem {
  label: string;
  componentType: 'horizontal_stepper' | 'section' | 'payment' | 'swap' | 'ratings';
  sectionName?: string;
  status?: 'active' | 'completed' | 'warning' | 'pending' | 'not_started';
  show?: boolean;
}

export interface FileUploadPayload {
  fileName: string;
  contentType: string;
  userId: string | undefined;
  imageType?: string;
}