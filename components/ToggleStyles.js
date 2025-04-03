import styled from 'styled-components/native';
import { Animated } from 'react-native';

export const Container = styled.View`
  align-items: flex-end;
  margin-bottom: 10px;
`;

export const Track = styled.View`
  background-color: ${({ isDark }) => (isDark ? '#00a6ff' : '#2a2a2a')};
  width: 64px;
  height: 34px;
  border-radius: 20px;
  justify-content: center;
  padding: 5px;
  overflow: hidden;
`;

export const Thumb = styled.View`
  height: 24px;
  width: 24px;
  border-radius: 12px;
  background-color: ${({ isDark }) => (isDark ? '#ffcf48' : '#ffffff')};
`;

export const Cloud = styled.View`
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: #fff;
  border-radius: 50px;
`;
