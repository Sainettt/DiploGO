import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { StubAiProvider } from './providers/stub.provider';
import { AnthropicAiProvider } from './providers/anthropic.provider';

@Module({
  providers: [AiService, StubAiProvider, AnthropicAiProvider],
  exports: [AiService],
})
export class AiModule {}
