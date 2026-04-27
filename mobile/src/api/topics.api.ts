import { apiClient } from './api.client';
import type { QuestionTypeId, QuestionDraft } from '../topic-types/registry';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface TopicSummary {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  difficulty: Difficulty;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicPayload {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  difficulty?: Difficulty;
  questions: Array<{
    text: string;
    type: QuestionTypeId;
    explanation?: string;
    source?: 'MANUAL' | 'AI';
    answers: Array<{ text: string; isCorrect: boolean; order: number }>;
  }>;
}

export interface AiQuestionDraft {
  text: string;
  type: QuestionTypeId;
  explanation?: string;
  answers: Array<{ text: string; isCorrect: boolean; order: number }>;
}

export const topicsApi = {
  list: async (): Promise<TopicSummary[]> => {
    const { data } = await apiClient.get('/topics');
    return data;
  },

  create: async (payload: CreateTopicPayload) => {
    const { data } = await apiClient.post('/topics', payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/topics/${id}`);
    return data;
  },

  generate: async (input: {
    topicTitle: string;
    sourceText?: string;
    type: QuestionTypeId;
    count: number;
    difficulty?: Difficulty;
    language?: string;
  }): Promise<AiQuestionDraft[]> => {
    const { data } = await apiClient.post('/topics/ai/generate', input);
    return data;
  },

  format: async (input: {
    rawText: string;
    type: QuestionTypeId;
    topicTitle?: string;
    language?: string;
  }): Promise<AiQuestionDraft[]> => {
    const { data } = await apiClient.post('/topics/ai/format', input);
    return data;
  },
};

export function draftsToQuestions(drafts: QuestionDraft[]) {
  return drafts.map((q) => ({
    text: q.text,
    type: q.type,
    explanation: q.explanation,
    source: q.source ?? 'MANUAL',
    answers: q.answers.map((a, i) => ({
      text: a.text,
      isCorrect: a.isCorrect,
      order: a.order ?? i,
    })),
  }));
}
