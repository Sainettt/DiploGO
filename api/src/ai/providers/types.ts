import { Difficulty, QuestionType } from '@prisma/client';

export interface AiAnswerDraft {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface AiQuestionDraft {
  text: string;
  type: QuestionType;
  difficulty?: Difficulty;
  explanation?: string;
  answers: AiAnswerDraft[];
}

export interface GenerateQuestionsParams {
  topicTitle: string;
  sourceText?: string;
  type: QuestionType;
  count: number;
  difficulty?: Difficulty;
  language?: string;
}

export interface FormatRawTextParams {
  rawText: string;
  type: QuestionType;
  topicTitle?: string;
  language?: string;
}

export interface AiProvider {
  readonly name: string;
  generateQuestions(params: GenerateQuestionsParams): Promise<AiQuestionDraft[]>;
  formatRawText(params: FormatRawTextParams): Promise<AiQuestionDraft[]>;
}
