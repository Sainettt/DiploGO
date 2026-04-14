import React from 'react';
import { Pressable, Text, Animated, ViewStyle, TextStyle } from 'react-native';

interface ThemeButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle | any;
  textStyle?: TextStyle | any;
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
}

export function ThemeButton({ title, onPress, style, textStyle, variant = 'primary', icon }: ThemeButtonProps) {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className={`rounded-xl flex-row justify-center items-center py-4 px-6 w-full ${isPrimary ? 'bg-[#BB86FC]' : 'bg-transparent border border-[#B3B3B3]'}`}
      >
        {icon}
        <Text 
          style={[textStyle, icon ? { marginLeft: 10 } : null]} 
          className={`text-base font-bold ${isPrimary ? 'text-[#121212]' : 'text-white'}`}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
