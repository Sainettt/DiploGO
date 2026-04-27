# DiploGO - Idea & Tasks

## Concept
**DiploGO** is a gamified/competitive tool for interactive learning and knowledge testing.
Users can:
1. Create their own topics for learning.
2. Manually write or **generate using AI** questions for the created topics.
3. Participate in gameplay by answering generated questions.
4. Track their progress (via Progress Bar) and build Streaks for daily activity or a sequence of correct answers.
5. Compete (potentially with other players) for the best results.

## Roadmap (Tasks)

### Phase 1: MVP (Minimum Viable Product)
- [x] Basic user registration / authentication.
- [x] Topic CRUD (create, list, delete) — see `api/src/topics/`.
- [x] Interface for manually writing questions — `mobile/app/topic-create/manual.tsx`.
- [ ] Game screen (displaying question, answer options, result).

### Phase 2: AI & Gamification
- [x] AI provider abstraction (`api/src/ai/`) with stub fallback and Anthropic adapter — see `docs/ai-integration.md`.
- [ ] Other providers (OpenAI / Gemini) plugged in via the same `AiProvider` interface.
- [ ] Implementation of the **Streaks** system (user retention).
- [ ] Global Progress Bar for a topic (how well the topic has been learned).
- [ ] Animations and rich UI for the answering process.

### Phase 3: Social & Competitive
- [ ] Leaderboard.
- [ ] Comparing own results with other users.
- [ ] Duels: who can answer more questions in the allotted time.

## Implementation Notes
- The Backend (NestJS) must handle the logic of streak calculation and store answer statistics (who, which question, how much time to think).
- The Mobile App (Expo) should emphasize smooth transition animations between questions, as this is a key element of user retention.
