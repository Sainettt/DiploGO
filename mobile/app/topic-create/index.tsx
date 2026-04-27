import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Edit3, Sparkles } from 'lucide-react-native';
import { ThemeButton } from '../../src/components/ThemeButton';
import { useTopicDraft } from '../../src/topic-types/draftContext';

export default function TopicCreateNameScreen() {
  const router = useRouter();
  const { draft, set } = useTopicDraft();

  const canContinue = draft.title.trim().length > 0 && draft.method !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push('/topic-create/type');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={['top']}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back"
        >
          <ChevronLeft color="#FFFFFF" size={26} />
        </Pressable>
        <Text className="text-base font-semibold text-white ml-2">
          New topic
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-[26px] font-bold text-white mb-2">
            Name your topic
          </Text>
          <Text className="text-sm text-[#B3B3B3] mb-6">
            Pick a short, recognizable title — you'll see it on the home screen.
          </Text>

          <TextInput
            value={draft.title}
            onChangeText={(t) => set('title', t)}
            placeholder="e.g. JavaScript essentials"
            placeholderTextColor="#6B6B6B"
            className="rounded-xl px-4 py-4 text-white"
            style={{ backgroundColor: '#1E1E1E', fontSize: 16 }}
            maxLength={120}
          />

          <Text className="text-xs text-[#6B6B6B] mt-2">
            {draft.title.length}/120
          </Text>

          <Text className="text-base font-semibold text-white mt-8 mb-3">
            How do you want to add questions?
          </Text>

          <MethodCard
            selected={draft.method === 'MANUAL'}
            onPress={() => set('method', 'MANUAL')}
            icon={<Edit3 color="#BB86FC" size={22} />}
            title="Write them myself"
            subtitle="Type each question. AI can clean up pasted notes for you."
          />
          <MethodCard
            selected={draft.method === 'AI'}
            onPress={() => set('method', 'AI')}
            icon={<Sparkles color="#03DAC6" size={22} />}
            title="Generate with AI"
            subtitle="Give a topic or paste source material — AI drafts the questions."
          />
        </ScrollView>

        <View className="px-6 pb-8 pt-2">
          <ThemeButton
            title="Continue"
            onPress={handleContinue}
            style={{ opacity: canContinue ? 1 : 0.4 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MethodCard({
  selected,
  onPress,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl p-4 mb-3 flex-row items-center"
      style={{
        backgroundColor: selected ? '#2A1A3E' : '#1E1E1E',
        borderWidth: 2,
        borderColor: selected ? '#BB86FC' : 'transparent',
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-white text-base font-semibold">{title}</Text>
        <Text className="text-[#B3B3B3] text-xs mt-1">{subtitle}</Text>
      </View>
    </Pressable>
  );
}
