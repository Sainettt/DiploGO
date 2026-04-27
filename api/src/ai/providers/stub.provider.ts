import { Injectable } from '@nestjs/common';
import { QuestionType } from '@prisma/client';
import {
  AiProvider,
  AiQuestionDraft,
  FormatRawTextParams,
  GenerateQuestionsParams,
} from './types';

/**
 * Local fallback used when no AI key is configured. It produces deterministic
 * placeholder questions so the create flow stays usable during development.
 */
@Injectable()
export class StubAiProvider implements AiProvider {
  readonly name = 'stub';

  async generateQuestions(p: GenerateQuestionsParams): Promise<AiQuestionDraft[]> {
    const drafts: AiQuestionDraft[] = [];
    for (let i = 0; i < p.count; i++) {
      drafts.push(this.draft(`${p.topicTitle} — sample question ${i + 1}`, p.type));
    }
    return drafts;
  }

  async formatRawText(p: FormatRawTextParams): Promise<AiQuestionDraft[]> {
    const lines = p.rawText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) return [];
    return lines.slice(0, 20).map((line) => this.draft(line, p.type));
  }

  private draft(text: string, type: QuestionType): AiQuestionDraft {
    switch (type) {
      case QuestionType.TRUE_FALSE:
        return {
          text,
          type,
          answers: [
            { text: 'True', isCorrect: true, order: 0 },
            { text: 'False', isCorrect: false, order: 1 },
          ],
        };
      case QuestionType.OPEN_TEXT:
        return {
          text,
          type,
          answers: [{ text: '', isCorrect: true, order: 0 }],
        };
      case QuestionType.MULTIPLE_CHOICE:
        return {
          text,
          type,
          answers: [
            { text: 'Option A', isCorrect: true, order: 0 },
            { text: 'Option B', isCorrect: true, order: 1 },
            { text: 'Option C', isCorrect: false, order: 2 },
            { text: 'Option D', isCorrect: false, order: 3 },
          ],
        };
      case QuestionType.SINGLE_CHOICE:
      default:
        return {
          text,
          type,
          answers: [
            { text: 'Option A', isCorrect: true, order: 0 },
            { text: 'Option B', isCorrect: false, order: 1 },
            { text: 'Option C', isCorrect: false, order: 2 },
            { text: 'Option D', isCorrect: false, order: 3 },
          ],
        };
    }
  }
}
