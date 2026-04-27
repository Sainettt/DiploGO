/**
 * Question-type registry for the mobile app.
 *
 * Adding a new type is a 3-step change:
 *   1. Extend the Prisma enum `QuestionType` and run a migration.
 *   2. Add a validator in `api/src/topics/question-types.ts`.
 *   3. Add a new entry below — `defaultDraft` returns the empty draft and
 *      `validate` mirrors the backend rule so the user gets local feedback.
 *
 * The Manual editor reads this registry to render the right form.
 */

export type QuestionTypeId =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'OPEN_TEXT';

export interface AnswerDraft {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuestionDraft {
  id: string;
  text: string;
  type: QuestionTypeId;
  explanation?: string;
  answers: AnswerDraft[];
  source?: 'MANUAL' | 'AI';
}

export interface QuestionTypeDef {
  id: QuestionTypeId;
  label: string;
  description: string;
  emoji: string;
  /** Whether the user can mark more than one answer correct. */
  multipleCorrect: boolean;
  /** Whether the user edits answer rows (false for OPEN_TEXT). */
  editableAnswers: boolean;
  /** Hard limits — UI prevents the user from going outside these. */
  minAnswers: number;
  maxAnswers: number;
  defaultDraft: () => Omit<QuestionDraft, 'id'>;
  validate: (q: QuestionDraft) => string | null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const correctCount = (answers: AnswerDraft[]) =>
  answers.filter((a) => a.isCorrect).length;

export const QUESTION_TYPES: Record<QuestionTypeId, QuestionTypeDef> = {
  SINGLE_CHOICE: {
    id: 'SINGLE_CHOICE',
    label: 'Single choice',
    description: 'A, B, C, D… one correct',
    emoji: '🔘',
    multipleCorrect: false,
    editableAnswers: true,
    minAnswers: 2,
    maxAnswers: 8,
    defaultDraft: () => ({
      text: '',
      type: 'SINGLE_CHOICE',
      answers: [
        { text: '', isCorrect: true, order: 0 },
        { text: '', isCorrect: false, order: 1 },
        { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 },
      ],
    }),
    validate: (q) => {
      if (!q.text.trim()) return 'Question text is empty';
      if (q.answers.some((a) => !a.text.trim())) return 'All options must be filled';
      if (correctCount(q.answers) !== 1) return 'Exactly one option must be correct';
      return null;
    },
  },

  MULTIPLE_CHOICE: {
    id: 'MULTIPLE_CHOICE',
    label: 'Multiple choice',
    description: 'A, B, C, D… several correct',
    emoji: '☑️',
    multipleCorrect: true,
    editableAnswers: true,
    minAnswers: 2,
    maxAnswers: 10,
    defaultDraft: () => ({
      text: '',
      type: 'MULTIPLE_CHOICE',
      answers: [
        { text: '', isCorrect: true, order: 0 },
        { text: '', isCorrect: true, order: 1 },
        { text: '', isCorrect: false, order: 2 },
        { text: '', isCorrect: false, order: 3 },
      ],
    }),
    validate: (q) => {
      if (!q.text.trim()) return 'Question text is empty';
      if (q.answers.some((a) => !a.text.trim())) return 'All options must be filled';
      if (correctCount(q.answers) < 1) return 'At least one option must be correct';
      return null;
    },
  },

  TRUE_FALSE: {
    id: 'TRUE_FALSE',
    label: 'True / False',
    description: 'Two fixed options',
    emoji: '✅',
    multipleCorrect: false,
    editableAnswers: false,
    minAnswers: 2,
    maxAnswers: 2,
    defaultDraft: () => ({
      text: '',
      type: 'TRUE_FALSE',
      answers: [
        { text: 'True', isCorrect: true, order: 0 },
        { text: 'False', isCorrect: false, order: 1 },
      ],
    }),
    validate: (q) => {
      if (!q.text.trim()) return 'Question text is empty';
      if (correctCount(q.answers) !== 1) return 'Choose True or False';
      return null;
    },
  },

  OPEN_TEXT: {
    id: 'OPEN_TEXT',
    label: 'Open text',
    description: 'Short or long written answer',
    emoji: '✍️',
    multipleCorrect: false,
    editableAnswers: false,
    minAnswers: 1,
    maxAnswers: 1,
    defaultDraft: () => ({
      text: '',
      type: 'OPEN_TEXT',
      answers: [{ text: '', isCorrect: true, order: 0 }],
    }),
    validate: (q) => {
      if (!q.text.trim()) return 'Question text is empty';
      if (!q.answers[0]?.text.trim()) return 'Reference answer is empty';
      return null;
    },
  },
};

export const QUESTION_TYPE_LIST: QuestionTypeDef[] = Object.values(QUESTION_TYPES);

export function newQuestion(type: QuestionTypeId): QuestionDraft {
  return { id: uid(), ...QUESTION_TYPES[type].defaultDraft() };
}
