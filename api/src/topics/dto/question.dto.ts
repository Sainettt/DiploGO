import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Difficulty, QuestionType } from '@prisma/client';

export class AnswerInput {
  @IsString()
  @MaxLength(500)
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsInt()
  @Min(0)
  order!: number;
}

export class QuestionInput {
  @IsString()
  @MaxLength(2000)
  text!: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string;

  @IsOptional()
  @IsString()
  source?: 'MANUAL' | 'AI' | 'IMPORTED';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerInput)
  answers!: AnswerInput[];
}
