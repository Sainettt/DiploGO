import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QuestionType } from '@prisma/client';
import {
  AiProvider,
  AiQuestionDraft,
  FormatRawTextParams,
  GenerateQuestionsParams,
} from './types';

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
}

/**
 * Anthropic-backed provider. Uses raw HTTP to /v1/messages so we don't need
 * to add @anthropic-ai/sdk as a hard dependency. Enable by setting:
 *   AI_PROVIDER=anthropic
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   ANTHROPIC_MODEL=claude-sonnet-4-6 (optional, default below)
 */
@Injectable()
export class AnthropicAiProvider implements AiProvider {
  readonly name = 'anthropic';
  private readonly logger = new Logger(AnthropicAiProvider.name);
  private readonly apiKey = process.env.ANTHROPIC_API_KEY ?? '';
  private readonly model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
  private readonly endpoint = 'https://api.anthropic.com/v1/messages';

  async generateQuestions(p: GenerateQuestionsParams): Promise<AiQuestionDraft[]> {
    const prompt = `You are an assistant that builds study questions for a learning app.
Topic: ${p.topicTitle}
${p.sourceText ? `Source material:\n${p.sourceText}\n` : ''}Generate ${p.count} ${p.type} questions${p.difficulty ? ` of ${p.difficulty} difficulty` : ''}${p.language ? ` in ${p.language}` : ''}.
${this.formatGuide(p.type)}
Respond ONLY with a JSON array of questions matching this shape:
${this.schemaExample(p.type)}`;

    return this.call(prompt, p.type);
  }

  async formatRawText(p: FormatRawTextParams): Promise<AiQuestionDraft[]> {
    const prompt = `The user pasted raw study notes${p.topicTitle ? ` for topic "${p.topicTitle}"` : ''}.
Convert the notes into clean ${p.type} questions${p.language ? ` in ${p.language}` : ''}.
${this.formatGuide(p.type)}
Raw input:
"""
${p.rawText}
"""
Respond ONLY with a JSON array matching this shape:
${this.schemaExample(p.type)}`;

    return this.call(prompt, p.type);
  }

  private async call(prompt: string, type: QuestionType): Promise<AiQuestionDraft[]> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('ANTHROPIC_API_KEY is not set');
    }

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    }).catch((err) => {
      this.logger.error('Anthropic request failed', err);
      throw new InternalServerErrorException('AI request failed');
    });

    const data = (await res.json()) as AnthropicMessageResponse;
    if (!res.ok) {
      this.logger.error('Anthropic error', data?.error);
      throw new InternalServerErrorException(
        data?.error?.message ?? 'AI request rejected',
      );
    }

    const text = data.content?.find((b) => b.type === 'text')?.text ?? '';
    return this.parseJsonArray(text, type);
  }

  private parseJsonArray(text: string, type: QuestionType): AiQuestionDraft[] {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) {
      throw new InternalServerErrorException('AI response missing JSON');
    }
    const slice = text.slice(start, end + 1);
    let parsed: unknown;
    try {
      parsed = JSON.parse(slice);
    } catch {
      throw new InternalServerErrorException('AI response is not valid JSON');
    }
    if (!Array.isArray(parsed)) {
      throw new InternalServerErrorException('AI response is not an array');
    }
    return parsed.map((q: any, i: number) => ({
      text: String(q.text ?? ''),
      type,
      explanation: q.explanation ? String(q.explanation) : undefined,
      answers: Array.isArray(q.answers)
        ? q.answers.map((a: any, j: number) => ({
            text: String(a.text ?? ''),
            isCorrect: Boolean(a.isCorrect),
            order: Number.isInteger(a.order) ? a.order : j,
          }))
        : [],
    }));
  }

  private formatGuide(type: QuestionType): string {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return 'Each question must have 4 answers; exactly one isCorrect=true.';
      case QuestionType.MULTIPLE_CHOICE:
        return 'Each question must have 4-6 answers; one OR MORE isCorrect=true.';
      case QuestionType.TRUE_FALSE:
        return 'Each question must have exactly 2 answers: "True" and "False"; exactly one isCorrect=true.';
      case QuestionType.OPEN_TEXT:
        return 'Each question must have ONE answer object — the canonical correct text — with isCorrect=true.';
    }
  }

  private schemaExample(type: QuestionType): string {
    if (type === QuestionType.OPEN_TEXT) {
      return `[{"text": "...", "explanation": "(optional)", "answers": [{"text": "canonical answer", "isCorrect": true, "order": 0}]}]`;
    }
    return `[{"text": "...", "explanation": "(optional)", "answers": [{"text": "...", "isCorrect": true, "order": 0}]}]`;
  }
}
