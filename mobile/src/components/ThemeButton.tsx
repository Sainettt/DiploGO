import React from 'react';
import { Pressable, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';

interface ThemeButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
        style={[styles.button, isPrimary ? styles.primary : styles.outline]}
      >
        {icon}
        <Text style={[styles.text, isPrimary ? styles.primaryText : styles.outlineText, textStyle, icon ? { marginLeft: 10 } : null]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
  },
  primary: {
    backgroundColor: '#BB86FC',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#B3B3B3',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System', // Later can change to Inter/Roboto
  },
  primaryText: {
    color: '#121212', // Dark text as per design guidelines
  },
  outlineText: {
    color: '#FFFFFF',
  },
});
