import styled from 'styled-components/native';

export const Wrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background};
`;

export const Form = styled.View`
  width: 90%;
  max-width: 450px;
  padding: 30px;
  background: ${({ theme }) => theme.background};
  border-radius: 20px;
  gap: 10px;
`;

export const PageTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 20px;
`;

export const Label = styled.Text`
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  margin-bottom: 4px;
`;

export const InputWrapper = styled.View`
  border: 1.5px solid ${({ theme }) => theme.inputBorder};
  border-radius: 10px;
  height: 50px;
  padding: 0 10px;
  justify-content: center;
`;

export const StyledInput = styled.TextInput`
  height: 100%;
  color: ${({ theme }) => theme.inputText};
  font-size: 16px;
`;

export const SubmitButton = styled.TouchableOpacity`
  margin-top: 20px;
  background-color: ${({ theme }) => theme.button};
  border-radius: 10px;
  height: 50px;
  justify-content: center;
  align-items: center;
`;

export const ButtonText = styled.Text`
  color: ${({ theme }) => theme.buttonText};
  font-size: 15px;
  font-weight: 500;
`;

export const CenterText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  margin-top: 10px;
`;

export const ClickableText = styled.Text`
  color: #2d79f3;
  font-weight: 500;
`;


export const LogoutButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  right: 20px;
  background-color: black;
  padding: 10px 16px;
  border-radius: 8px;
  z-index: 10;
`;

export const LogoutText = styled.Text`
  color: white;
  font-weight: bold;
`;
