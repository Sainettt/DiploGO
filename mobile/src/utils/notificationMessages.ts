/**
 * Duolingo-style reminder messages. We schedule one local notification
 * per day for the next N days; each picks a random message from this pool.
 */

export const DAYS_SCHEDULED_AHEAD = 14;

export interface ReminderMessage {
  title: string;
  body: string;
}

const MESSAGES: ReminderMessage[] = [
  { title: "Don't break your streak!", body: 'Just 5 minutes today and your streak stays alive.' },
  { title: 'Your brain misses you', body: 'A tiny lesson now beats an excuse later.' },
  { title: 'Streak in danger', body: 'One quick quiz and you keep the fire burning.' },
  { title: 'Learning time', body: 'The best time was yesterday. The second best is now.' },
  { title: 'Quick question for you', body: 'Can you answer just 3 questions before bed?' },
  { title: 'We saved a spot for you', body: 'Your daily challenge is waiting. Open the app.' },
  { title: "Don't let the owl down", body: 'Keep the momentum going — 5 minutes is enough.' },
  { title: 'Tiny effort, huge progress', body: 'Consistency beats intensity. Tap in for today.' },
  { title: 'Habits are built today', body: 'One more day on the streak makes it easier tomorrow.' },
  { title: 'Your streak needs love', body: 'Open DiploGO and keep climbing.' },
  { title: '5 minutes. That is it.', body: 'A short session now keeps your stats shining.' },
  { title: 'Knowledge check', body: 'Still remember yesterday? Prove it in a quick round.' },
  { title: "Don't lose progress", body: 'Skipping today resets the streak you worked so hard for.' },
  { title: 'Back at it?', body: 'A single session today is all it takes.' },
  { title: 'Future-you will thank you', body: 'Spend 5 minutes studying now — future-you is watching.' },
];

export function getRandomReminderMessage(): ReminderMessage {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}
