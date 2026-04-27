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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Wand2,
  Check,
} from 'lucide-react-native';
import { ThemeButton } from '../../src/components/ThemeButton';
import { useTopicDraft } from '../../src/topic-types/draftContext';
import {
  QUESTION_TYPES,
  newQuestion,
  type QuestionDraft,
} from '../../src/topic-types/registry';
import { topicsApi, draftsToQuestions } from '../../src/api/topics.api';

export default function TopicCreateManualScreen() {
  const router = useRouter();
  const { draft, setQuestions, reset } = useTopicDraft();
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const typeId = draft.questionType ?? 'SINGLE_CHOICE';
  const typeDef = QUESTION_TYPES[typeId];

  const updateQuestion = (id: string, patch: Partial<QuestionDraft>) => {
    setQuestions(
      draft.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(draft.questions.filter((q) => q.id !== id));
  };

  const addQuestion = () => {
    setQuestions([...draft.questions, newQuestion(typeId)]);
  };

  const handleSave = async () => {
    if (!draft.title.trim()) {
      Alert.alert('Title is missing');
      return;
    }
    if (draft.questions.length === 0) {
      Alert.alert('Add at least one question');
      return;
    }
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
      const msg =
        e?.response?.data?.message ?? e?.message ?? 'Failed to save topic';
      Alert.alert('Error', String(msg));
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
          {draft.title || 'New topic'}
        </Text>
        <Pressable
          onPress={() => setAiOpen(true)}
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: 'rgba(3, 218, 198, 0.15)' }}
        >
          <Wand2 color="#03DAC6" size={14} />
          <Text className="text-[#03DAC6] text-xs font-semibold ml-1">
            AI format
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center mb-4">
            <Text style={{ fontSize: 22, marginRight: 8 }}>{typeDef.emoji}</Text>
            <Text className="text-sm text-[#B3B3B3]">{typeDef.label}</Text>
          </View>

          {draft.questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              index={idx}
              question={q}
              onChange={(patch) => updateQuestion(q.id, patch)}
              onRemove={() => removeQuestion(q.id)}
            />
          ))}

          <Pressable
            onPress={addQuestion}
            className="rounded-xl flex-row items-center justify-center py-3 mt-2"
            style={{
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#BB86FC',
            }}
          >
            <Plus color="#BB86FC" size={18} />
            <Text className="text-[#BB86FC] font-semibold ml-2">
              Add question
            </Text>
          </Pressable>
        </ScrollView>

        <View className="px-6 pb-8 pt-2">
          <ThemeButton
            title={saving ? 'Saving…' : `Save topic (${draft.questions.length})`}
            onPress={handleSave}
            disabled={saving || draft.questions.length === 0}
          />
        </View>
      </KeyboardAvoidingView>

      <AiFormatModal
        visible={aiOpen}
        onClose={() => setAiOpen(false)}
        onResult={(qs) => {
          setQuestions([...draft.questions, ...qs]);
          setAiOpen(false);
        }}
        topicTitle={draft.title}
        typeId={typeId}
      />
    </SafeAreaView>
  );
}

function QuestionCard({
  index,
  question,
  onChange,
  onRemove,
}: {
  index: number;
  question: QuestionDraft;
  onChange: (patch: Partial<QuestionDraft>) => void;
  onRemove: () => void;
}) {
  const def = QUESTION_TYPES[question.type];

  const updateAnswer = (
    i: number,
    patch: Partial<QuestionDraft['answers'][number]>,
  ) => {
    const next = question.answers.map((a, j) =>
      j === i ? { ...a, ...patch } : a,
    );
    onChange({ answers: next });
  };

  const toggleCorrect = (i: number) => {
    if (def.multipleCorrect || question.type === 'OPEN_TEXT') {
      updateAnswer(i, { isCorrect: !question.answers[i].isCorrect });
    } else {
      onChange({
        answers: question.answers.map((a, j) => ({
          ...a,
          isCorrect: j === i,
        })),
      });
    }
  };

  const addOption = () => {
    if (question.answers.length >= def.maxAnswers) return;
    onChange({
      answers: [
        ...question.answers,
        { text: '', isCorrect: false, order: question.answers.length },
      ],
    });
  };

  const removeOption = (i: number) => {
    if (question.answers.length <= def.minAnswers) return;
    onChange({
      answers: question.answers
        .filter((_, j) => j !== i)
        .map((a, j) => ({ ...a, order: j })),
    });
  };

  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: '#1E1E1E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs uppercase tracking-wider text-[#B3B3B3]">
          Question {index + 1}
        </Text>
        <Pressable onPress={onRemove} hitSlop={10}>
          <Trash2 color="#CF6679" size={16} />
        </Pressable>
      </View>

      <TextInput
        value={question.text}
        onChangeText={(t) => onChange({ text: t })}
        placeholder="Enter question text"
        placeholderTextColor="#6B6B6B"
        multiline
        className="text-white"
        style={{
          backgroundColor: '#121212',
          borderRadius: 12,
          padding: 12,
          fontSize: 15,
          minHeight: 60,
          textAlignVertical: 'top',
        }}
      />

      <View className="mt-3">
        {question.type === 'OPEN_TEXT' ? (
          <View>
            <Text className="text-xs text-[#B3B3B3] mb-2">
              Reference answer
            </Text>
            <TextInput
              value={question.answers[0]?.text ?? ''}
              onChangeText={(t) => updateAnswer(0, { text: t })}
              placeholder="The correct/expected answer"
              placeholderTextColor="#6B6B6B"
              multiline
              className="text-white"
              style={{
                backgroundColor: '#121212',
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                minHeight: 50,
                textAlignVertical: 'top',
              }}
            />
          </View>
        ) : (
          question.answers.map((a, i) => (
            <View key={i} className="flex-row items-center mt-2">
              <Pressable
                onPress={() => toggleCorrect(i)}
                hitSlop={8}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: def.multipleCorrect ? 6 : 12,
                  borderWidth: 2,
                  borderColor: a.isCorrect ? '#03DAC6' : '#6B6B6B',
                  backgroundColor: a.isCorrect ? '#03DAC6' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                {a.isCorrect && <Check color="#121212" size={14} />}
              </Pressable>
              {def.editableAnswers ? (
                <TextInput
                  value={a.text}
                  onChangeText={(t) => updateAnswer(i, { text: t })}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  placeholderTextColor="#6B6B6B"
                  className="flex-1 text-white"
                  style={{
                    backgroundColor: '#121212',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 14,
                  }}
                />
              ) : (
                <Text className="flex-1 text-white text-sm">{a.text}</Text>
              )}
              {def.editableAnswers &&
                question.answers.length > def.minAnswers && (
                  <Pressable
                    onPress={() => removeOption(i)}
                    hitSlop={8}
                    style={{ marginLeft: 8 }}
                  >
                    <Trash2 color="#6B6B6B" size={16} />
                  </Pressable>
                )}
            </View>
          ))
        )}

        {def.editableAnswers && question.answers.length < def.maxAnswers && (
          <Pressable
            onPress={addOption}
            className="flex-row items-center mt-3"
          >
            <Plus color="#BB86FC" size={14} />
            <Text className="text-[#BB86FC] text-xs font-semibold ml-1">
              Add option
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function AiFormatModal({
  visible,
  onClose,
  onResult,
  topicTitle,
  typeId,
}: {
  visible: boolean;
  onClose: () => void;
  onResult: (qs: QuestionDraft[]) => void;
  topicTitle: string;
  typeId: QuestionDraft['type'];
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const drafts = await topicsApi.format({
        rawText: text,
        type: typeId,
        topicTitle: topicTitle || undefined,
      });
      const mapped: QuestionDraft[] = drafts.map((d) => ({
        id: Math.random().toString(36).slice(2, 10),
        text: d.text,
        type: d.type,
        explanation: d.explanation,
        source: 'AI',
        answers: d.answers,
      }));
      setText('');
      onResult(mapped);
    } catch (e: any) {
      Alert.alert(
        'AI error',
        e?.response?.data?.message ?? e?.message ?? 'Failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1E1E1E',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: 36,
        }}
      >
        <Text className="text-white text-lg font-bold mb-1">
          Format raw notes
        </Text>
        <Text className="text-[#B3B3B3] text-xs mb-4">
          Paste notes — AI converts them into clean questions of the chosen
          format.
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Paste your notes…"
          placeholderTextColor="#6B6B6B"
          multiline
          style={{
            backgroundColor: '#121212',
            color: 'white',
            borderRadius: 12,
            padding: 12,
            minHeight: 120,
            textAlignVertical: 'top',
            fontSize: 14,
          }}
        />
        <View className="flex-row mt-4" style={{ gap: 8 }}>
          <View style={{ flex: 1 }}>
            <ThemeButton title="Cancel" onPress={onClose} variant="outline" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemeButton
              title={loading ? 'Working…' : 'Format'}
              onPress={run}
              disabled={loading || !text.trim()}
            />
          </View>
        </View>
        {loading && (
          <ActivityIndicator
            color="#BB86FC"
            style={{ position: 'absolute', top: 24, right: 20 }}
          />
        )}
      </View>
    </Modal>
  );
}
