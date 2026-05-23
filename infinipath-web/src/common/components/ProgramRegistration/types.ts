export interface Question {
  id: number;
  text: string;
  type: string;
  options?: string[];
  required?: boolean;
}

export interface Section {
  id: string;
  title?: string;
  questions: Question[];
  flexDirection: string;
  subSections?: Section[];
  path?: string;
}

export interface StyleProps {
  color: string;
  fontSize: string;
  fontWeight: string;
  textAlign: string;
}

export interface GlobalStyles {
  questions: StyleProps;
  options: StyleProps;
  sections: {
    title: StyleProps;
    flexDirection: string;
  };
}

export interface QuestionCustomStyles {
  [questionId: number]: {
    [key: string]: {
      [property: string]: string;
    };
  };
}

export interface DragItem {
  question: Question;
  fromForm: boolean;
}