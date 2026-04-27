import { BadRequestException } from '@nestjs/common';
import { QuestionType } from '@prisma/client';
import { AnswerInput, QuestionInput } from './dto/question.dto';

/**
 * Per-type validation. Adding a new question kind is a single new entry here:
 * pick a QuestionType (extend the Prisma enum first), then provide a validator
 * that throws BadRequestException on invalid shape.
 */
type Validator = (q: QuestionInput) => void;

const requireText = (q: QuestionInput) => {
  if (!q.text || !q.text.trim()) {
    throw new BadRequestException('Question text is required');
  }
};

const requireAnswers = (q: QuestionInput, min: number, max?: number) => {
  const len = q.answers?.length ?? 0;
  if (len < min) {
    throw new BadRequestException(
      `Question "${q.text}" needs at least ${min} answers`,
    );
  }
  if (max && len > max) {
    throw new BadRequestException(
      `Question "${q.text}" supports at most ${max} answers`,
    );
  }
};

const correctCount = (answers: AnswerInput[] = []) =>
  answers.filter((a) => a.isCorrect).length;

export const QUESTION_TYPE_VALIDATORS: Record<QuestionType, Validator> = {
  [QuestionType.SINGLE_CHOICE]: (q) => {
    requireText(q);
    requireAnswers(q, 2, 8);
    if (correctCount(q.answers) !== 1) {
      throw new BadRequestException(
        'Single-choice question must have exactly one correct answer',
      );
    }
  },
  [QuestionType.MULTIPLE_CHOICE]: (q) => {
    requireText(q);
    requireAnswers(q, 2, 10);
    if (correctCount(q.answers) < 1) {
      throw new BadRequestException(
        'Multiple-choice question must have at least one correct answer',
      );
    }
  },
  [QuestionType.TRUE_FALSE]: (q) => {
    requireText(q);
    requireAnswers(q, 2, 2);
    if (correctCount(q.answers) !== 1) {
      throw new BadRequestException(
        'True/false question must have exactly one correct answer',
      );
    }
  },
  [QuestionType.OPEN_TEXT]: (q) => {
    requireText(q);
    requireAnswers(q, 1, 1);
    if (!q.answers[0].text?.trim()) {
      throw new BadRequestException('Open-text answer cannot be empty');
    }
  },
};

export function validateQuestion(q: QuestionInput) {
  const validator = QUESTION_TYPE_VALIDATORS[q.type];
  if (!validator) {
    throw new BadRequestException(`Unsupported question type: ${q.type}`);
  }
  validator(q);
}
