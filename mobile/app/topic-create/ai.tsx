import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { ThemeButton } from '../../src/components/ThemeButton';
import { useTopicDraft } from '../../src/topic-types/draftContext';
import { QUESTION_TYPES } from '../../src/topic-types/registry';
import { topicsApi, draftsToQuestions } from '../../src/api/topics.api';

const COUNTS = [3, 5, 10];

export default function TopicCreateAiScreen() {
  const router = useRouter();
  const { draft, setQuestions, reset } = useTopicDraft();
  const [sourceText, setSourceText] = useState('');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const typeId = draft.questionType ?? 'SINGLE_CHOICE';
  const typeDef = QUESTION_TYPES[typeId];

  const generate = async () => {
    if (!draft.title.trim()) {
      Alert.alert('Title is missing');
      return;
    }
    setGenerating(true);
    try {
      const drafts = await topicsApi.generate({
        topicTitle: draft.title,
        sourceText: sourceText.trim() || undefined,
        type: typeId,
        count,
      });
      setQuestions(
        drafts.map((d) => ({
          id: Math.random().toString(36).slice(2, 10),
          text: d.text,
          type: d.type,
          explanation: d.explanation,
          source: 'AI',
          answers: d.answers,
        })),
      );
    } catch (e: any) {
      Alert.alert(
        'AI error',
        e?.response?.data?.message ?? e?.message ?? 'Failed',
      );
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (draft.questions.length === 0) return;
    for (const q of draft.questions) {
      const err = QUESTION_TYPES[q.type].validate(q);
      if (err) {
        Alert.alert('Question invalid', err);
        return;
      }
    }
    setSaving(true);
    try {
      await topicsApi.create({
        title: draft.title.trim(),
        description: draft.description?.trim() || undefined,
        questions: draftsToQuestions(draft.questions),
      });
      reset();
      router.replace('/(tabs)/library');
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message ?? e?.message ?? 'Failed',
      );
    } finally {
      setSaving(false);
    }
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
        <Text className="text-base font-semibold text-white ml-2 flex-1">
          AI generation
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="rounded-2xl p-4 mb-4 flex-row items-center"
            style={{ backgroundColor: '#1E1E1E' }}
          >
            <Sparkles color="#03DAC6" size={20} />
            <Text className="text-[#B3B3B3] text-xs ml-3 flex-1">
              {`${typeDef.emoji} ${typeDef.label} · ${draft.title}`}
            </Text>
          </View>

          <Text className="text-sm text-white font-semibold mb-2">
            Source material (optional)
          </Text>
          <TextInput
            value={sourceText}
            onChangeText={setSourceText}
            placeholder="Paste a chapter, notes, or leave empty"
            placeholderTextColor="#6B6B6B"
            multiline
            style={{
              backgroundColor: '#1E1E1E',
              color: 'white',
              borderRadius: 12,
              padding: 12,
              minHeight: 120,
              textAlignVertical: 'top',
              fontSize: 14,
            }}
          />

          <Text className="text-sm text-white font-semibold mt-5 mb-2">
            How many questions?
          </Text>
          <View className="flex-row" style={{ gap: 8 }}>
            {COUNTS.map((n) => {
              const selected = count === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setCount(n)}
                  className="flex-1 rounded-xl py-3 items-center"
                  style={{
                    backgroundColor: selected ? '#BB86FC' : '#1E1E1E',
                  }}
                >
                  <Text
                    className="font-bold"
                    style={{ color: selected ? '#121212' : '#FFFFFF' }}
                  >
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-6">
            <ThemeButton
              title={generating ? 'Generating…' : 'Generate questions'}
              onPress={generate}
              disabled={generating}
              icon={<Sparkles color="#121212" size={18} />}
            />
          </View>

          {generating && (
            <View className="mt-4 items-center">
              <ActivityIndicator color="#BB86FC" />
            </View>
          )}

          {draft.questions.length > 0 && (
            <View className="mt-6">
              <Text className="text-sm text-white font-semibold mb-3">
                Preview ({draft.questions.length})
              </Text>
              {draft.questions.map((q, idx) => (
                <View
                  key={q.id}
                  className="rounded-xl p-3 mb-2"
                  style={{ backgroundColor: '#1E1E1E' }}
                >
                  <Text className="text-xs text-[#B3B3B3] mb-1">
                    {idx + 1}.
                  </Text>
                  <Text className="text-white text-sm" numberOfLines={3}>
                    {q.text}
                  </Text>
                  <Text className="text-[#03DAC6] text-xs mt-2">
                    {q.answers.filter((a) => a.isCorrect).length} correct ·{' '}
                    {q.answers.length} total
                  </Text>
                </View>
              ))}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/topic-create/manual',
                  })
                }
                className="self-start mt-1"
              >
                <Text className="text-[#BB86FC] text-xs font-semibold">
                  Edit before saving →
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <View className="px-6 pb-8 pt-2">
          <ThemeButton
            title={saving ? 'Saving…' : `Save topic`}
            onPress={save}
            disabled={saving || draft.questions.length === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
