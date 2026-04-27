import React, { createContext, useContext, useMemo, useState } from 'react';
import type { QuestionDraft, QuestionTypeId } from './registry';

export type CreationMethod = 'MANUAL' | 'AI';

export interface TopicDraft {
  title: string;
  description?: string;
  method: CreationMethod | null;
  questionType: QuestionTypeId | null;
  questions: QuestionDraft[];
}

interface DraftContextShape {
  draft: TopicDraft;
  set: <K extends keyof TopicDraft>(key: K, value: TopicDraft[K]) => void;
  reset: () => void;
  setQuestions: (q: QuestionDraft[]) => void;
}

const blank = (): TopicDraft => ({
  title: '',
  description: '',
  method: null,
  questionType: null,
  questions: [],
});

const Ctx = createContext<DraftContextShape | null>(null);

export function TopicDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<TopicDraft>(blank);

  const value = useMemo<DraftContextShape>(
    () => ({
      draft,
      set: (key, value) => setDraft((d) => ({ ...d, [key]: value })),
      reset: () => setDraft(blank()),
      setQuestions: (questions) => setDraft((d) => ({ ...d, questions })),
    }),
    [draft],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTopicDraft() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTopicDraft must be used inside TopicDraftProvider');
  return ctx;
}
