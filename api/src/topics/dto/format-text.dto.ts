import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { QuestionType } from '@prisma/client';

export class FormatTextDto {
  @IsString()
  @MaxLength(8000)
  rawText!: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  topicTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;
}
