import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Difficulty, QuestionType } from '@prisma/client';

export class GenerateQuestionsDto {
  @IsString()
  @MaxLength(120)
  topicTitle!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  sourceText?: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsInt()
  @Min(1)
  @Max(20)
  count!: number;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;
}
