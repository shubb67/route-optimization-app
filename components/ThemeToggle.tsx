import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, Animated, ToastAndroid, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useThemeContext } from '../context/ThemeContext';

const ToggleContainer = styled(Animated.View)`
  margin-top: 30px;
  width: 80px;
  height: 40px;
  background-color: ${({ theme }) => theme.button};
  border-radius: 20px;
  justify-content: center;
  padding: 4px;
  align-self: center;
  z-index: 10;
`;

const ToggleThumb = styled(Animated.View)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: center;
`;

const Emoji = styled.Text`
  font-size: 22px;
`;

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const animValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const firstRender = useRef(true);

  // Animate thumb position
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    if (!firstRender.current) {
      const message = isDarkMode ? 'Dark Mode Enabled 🌙' : 'Light Mode Enabled ☀️';
      Platform.OS === 'android'
    } else {
      firstRender.current = false;
    }
  }, [isDarkMode]);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 32],
  });

  const emoji = isDarkMode ? '🌙' : '☀️';

  return (
    <Pressable onPress={toggleTheme}>
      <ToggleContainer>
        <ToggleThumb style={{ transform: [{ translateX }] }}>
          <Emoji>{emoji}</Emoji>
        </ToggleThumb>
      </ToggleContainer>
    </Pressable>
  );
};

export default ThemeToggle;
