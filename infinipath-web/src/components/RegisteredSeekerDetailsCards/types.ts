export interface Question {
    id: number;
    label: string;
    type: string;
    bindingKey: string;
    config: {
      isDefaultValue: any;
      isDisable: any;
      minYears?: number;
      maxYears?: number;
      isRequired?: boolean;
      minCharacter?: number;
      maxCharacters?: number;
      minValue?: number;
      maxValue?: number;
      validationPattern?: string;
      endPoint?: string; // For API calls
      conditionalFields?: number[];
      prefill?:{
        prefillType:string;
        prefillDateFrom:string;
      }
       mahatriaChoiceConfig?: {
      allowMahatriaChoice: boolean;
      mahatriaChoicetText: string;
    };
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
    };
    formSection: {
      id: number;
      name: string;
      description: string;
    };
    questionOptionMaps: Array<{
      option: {
        id: number;
        name: string;
      };
    }>;
  }
  
  export interface ProgramQuestionMap {
    id: number;
    question: Question;
    registrationLevel: string;
    displayOrder: number;
  }