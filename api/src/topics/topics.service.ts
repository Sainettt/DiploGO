import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { FormatTextDto } from './dto/format-text.dto';
import { validateQuestion } from './question-types';

@Injectable()
export class TopicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async create(userId: string, dto: CreateTopicDto) {
    dto.questions.forEach(validateQuestion);

    return this.prisma.topic.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
        difficulty: dto.difficulty,
        questions: {
          create: dto.questions.map((q) => ({
            text: q.text,
            explanation: q.explanation,
            type: q.type,
            difficulty: q.difficulty,
            source: this.toSource(q.source),
            answers: {
              create: q.answers.map((a, i) => ({
                text: a.text,
                isCorrect: a.isCorrect,
                order: a.order ?? i,
              })),
            },
          })),
        },
      },
      include: {
        questions: { include: { answers: true } },
      },
    });
  }

  async list(userId: string) {
    const topics = await this.prisma.topic.findMany({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        color: true,
        difficulty: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { questions: true } },
      },
    });

    return topics.map((t) => ({
      ...t,
      questionCount: t._count.questions,
      _count: undefined,
    }));
  }

  async findOne(userId: string, id: string) {
    const topic = await this.prisma.topic.findFirst({
      where: { id, userId },
      include: {
        questions: {
          where: { isArchived: false },
          orderBy: { createdAt: 'asc' },
          include: { answers: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.topic.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException('Topic not found');
    await this.prisma.topic.delete({ where: { id } });
    return { success: true };
  }

  generateQuestions(dto: GenerateQuestionsDto) {
    return this.ai.generateQuestions(dto);
  }

  formatRawText(dto: FormatTextDto) {
    return this.ai.formatRawText(dto);
  }

  private toSource(s?: string): QuestionSource {
    if (s === 'AI') return QuestionSource.AI;
    if (s === 'IMPORTED') return QuestionSource.IMPORTED;
    return QuestionSource.MANUAL;
  }
}
