import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseconfig';

import {
  Wrapper,
  Form,
  Label,
  InputWrapper,
  StyledInput,
  SubmitButton,
  ButtonText,
  CenterText,
  ClickableText,
  PageTitle,
} from '../components/FormStyles';

import  ThemeToggle  from '../components/ThemeToggle';

const Login = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Missing Info', 'Please enter both email and password.');
    }

    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        Alert.alert('Login Error', 'User profile not found in Firestore.');
        return;
      }

      const { role } = userDoc.data();
      navigation.reset({
        index: 0,
        routes: [{ name: role === 'Admin' ? 'AdminDashboard' : 'Map' }],
      });
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Form>
        <ThemeToggle />
        <PageTitle>Welcome Back 👋</PageTitle>

        <Label>Email</Label>
        <InputWrapper>
          <StyledInput
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
          />
        </InputWrapper>

        <Label>Password</Label>
        <InputWrapper>
          <StyledInput
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </InputWrapper>

        <SubmitButton onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <ButtonText>Login</ButtonText>}
        </SubmitButton>

        <CenterText>
          Don’t have an account?
          <ClickableText onPress={() => navigation.navigate('SignUp')}> Sign Up</ClickableText>
        </CenterText>
      </Form>
    </Wrapper>
  );
};

export default Login;
