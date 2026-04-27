import { Injectable, Logger } from '@nestjs/common';
import { StubAiProvider } from './providers/stub.provider';
import { AnthropicAiProvider } from './providers/anthropic.provider';
import {
  AiProvider,
  AiQuestionDraft,
  FormatRawTextParams,
  GenerateQuestionsParams,
} from './providers/types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;

  constructor(
    private readonly stub: StubAiProvider,
    private readonly anthropic: AnthropicAiProvider,
  ) {
    const choice = (process.env.AI_PROVIDER ?? '').toLowerCase();
    if (choice === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      this.provider = anthropic;
    } else {
      this.provider = stub;
    }
    this.logger.log(`AI provider: ${this.provider.name}`);
  }

  generateQuestions(params: GenerateQuestionsParams): Promise<AiQuestionDraft[]> {
    return this.provider.generateQuestions(params);
  }

  formatRawText(params: FormatRawTextParams): Promise<AiQuestionDraft[]> {
    return this.provider.formatRawText(params);
  }
}
