export interface Question {
  id: string;
  number: number;
  text: string;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface AnswerData {
  text: string | null;
  loading: boolean;
  error: string | null;
}

export interface AnswerState {
  [questionId: string]: AnswerData;
}