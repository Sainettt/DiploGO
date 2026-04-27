import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ThemeButton } from '../../src/components/ThemeButton';
import { useTopicDraft } from '../../src/topic-types/draftContext';
import {
  QUESTION_TYPE_LIST,
  newQuestion,
  type QuestionTypeId,
} from '../../src/topic-types/registry';

export default function TopicCreateTypeScreen() {
  const router = useRouter();
  const { draft, set, setQuestions } = useTopicDraft();

  const select = (id: QuestionTypeId) => set('questionType', id);

  const handleContinue = () => {
    if (!draft.questionType) return;

    if (draft.method === 'MANUAL' && draft.questions.length === 0) {
      setQuestions([newQuestion(draft.questionType)]);
    }

    router.push(
      draft.method === 'AI' ? '/topic-create/ai' : '/topic-create/manual',
    );
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
          Question format
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[26px] font-bold text-white mb-2">
          Pick a format
        </Text>
        <Text className="text-sm text-[#B3B3B3] mb-6">
          You can mix more later — for now we'll create one batch.
        </Text>

        {QUESTION_TYPE_LIST.map((type) => {
          const selected = draft.questionType === type.id;
          return (
            <Pressable
              key={type.id}
              onPress={() => select(type.id)}
              className="rounded-xl p-4 mb-3 flex-row items-center"
              style={{
                backgroundColor: selected ? '#2A1A3E' : '#1E1E1E',
                borderWidth: 2,
                borderColor: selected ? '#BB86FC' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 12 }}>
                {type.emoji}
              </Text>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  {type.label}
                </Text>
                <Text className="text-[#B3B3B3] text-xs mt-1">
                  {type.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="px-6 pb-8 pt-2">
        <ThemeButton
          title="Continue"
          onPress={handleContinue}
          style={{ opacity: draft.questionType ? 1 : 0.4 }}
        />
      </View>
    </SafeAreaView>
  );
}
