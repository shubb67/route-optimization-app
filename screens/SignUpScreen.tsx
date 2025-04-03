import React, { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  View
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  PageTitle
} from '../components/FormStyles';

import ThemeToggle  from '../components/ThemeToggle';

const SignUp = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Driver' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !role) {
      return Alert.alert('Missing Info', 'Please fill out all fields and select a role.');
    }

    if (password.length < 6) {
      return Alert.alert('Weak Password', 'Password must be at least 6 characters.');
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      navigation.reset({
        index: 0,
        routes: [{ name: role === 'Admin' ? 'AdminDashboard' : 'Map' }],
      });
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Form>
        <ThemeToggle />
        <PageTitle>Create Account 📝</PageTitle>

        <Label>Name</Label>
        <InputWrapper>
          <StyledInput
            placeholder="Enter your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </InputWrapper>

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

        <Label>Choose Role</Label>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setRole('Driver')}
            style={{
              backgroundColor: role === 'Driver' ? '#00a6ff' : '#ddd',
              padding: 10,
              borderRadius: 8,
              minWidth: 100,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: role === 'Driver' ? '#fff' : '#000' }}>🚚 Driver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole('Admin')}
            style={{
              backgroundColor: role === 'Admin' ? '#00a6ff' : '#ddd',
              padding: 10,
              borderRadius: 8,
              minWidth: 100,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: role === 'Admin' ? '#fff' : '#000' }}>🛠 Admin</Text>
          </TouchableOpacity>
        </View>

        <SubmitButton onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <ButtonText>Sign Up</ButtonText>}
        </SubmitButton>

        <CenterText>
          Already have an account?
          <ClickableText onPress={() => navigation.navigate('Login')}> Login</ClickableText>
        </CenterText>
      </Form>
    </Wrapper>
  );
};

export default SignUp;
