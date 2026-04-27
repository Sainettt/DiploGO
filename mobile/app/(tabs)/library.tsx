import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Library as LibraryIcon, Plus, FileQuestion } from 'lucide-react-native';
import { topicsApi, type TopicSummary } from '../../src/api/topics.api';

const FAB_HEIGHT = 56;
const FAB_OFFSET = 24;

export default function LibraryScreen() {
  const router = useRouter();
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fabScale = React.useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    try {
      const data = await topicsApi.list();
      setTopics(data);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onPressFabIn = () =>
    Animated.spring(fabScale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressFabOut = () =>
    Animated.spring(fabScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={['top']}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">Topic Library</Text>
        <Text className="text-sm text-[#B3B3B3] mt-1">
          Create and manage your topics
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#BB86FC" />
        </View>
      ) : topics.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#BB86FC"
            />
          }
        >
          <View className="items-center px-8">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: 'rgba(187, 134, 252, 0.15)' }}
            >
              <LibraryIcon color="#BB86FC" size={36} />
            </View>
            <Text className="text-lg font-semibold text-white text-center">
              No topics yet
            </Text>
            <Text className="text-sm text-[#B3B3B3] text-center mt-2">
              Tap the + button to create your first topic.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: FAB_HEIGHT + FAB_OFFSET * 2,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#BB86FC"
            />
          }
        >
          {topics.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/topic/${t.id}` as any)}
              className="rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                backgroundColor: '#1E1E1E',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{
                  backgroundColor: t.color ?? 'rgba(187, 134, 252, 0.18)',
                }}
              >
                <Text style={{ fontSize: 24 }}>{t.icon ?? '📚'}</Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-white"
                  numberOfLines={1}
                >
                  {t.title}
                </Text>
                <View className="flex-row items-center mt-1">
                  <FileQuestion color="#B3B3B3" size={12} />
                  <Text className="text-xs text-[#B3B3B3] ml-1">
                    {t.questionCount} questions · {t.difficulty.toLowerCase()}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          right: 20,
          bottom: FAB_OFFSET,
          transform: [{ scale: fabScale }],
        }}
      >
        <Pressable
          onPress={() => router.push('/topic-create')}
          onPressIn={onPressFabIn}
          onPressOut={onPressFabOut}
          accessibilityLabel="Create new topic"
          style={{
            width: FAB_HEIGHT,
            height: FAB_HEIGHT,
            borderRadius: FAB_HEIGHT / 2,
            backgroundColor: '#BB86FC',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#BB86FC',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Plus color="#121212" size={28} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
