import { Stack } from 'expo-router';
import { TopicDraftProvider } from '../../src/topic-types/draftContext';

export default function TopicCreateLayout() {
  return (
    <TopicDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121212' },
        }}
      />
    </TopicDraftProvider>
  );
}
