import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform
} from 'react-native';
import { db } from '../firebaseconfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AddDriverScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      await addDoc(collection(db, 'users'), {
        name,
        email,
        phone,
        avatar,
        role: 'Driver',
        createdAt: new Date().toISOString(),
        disabled: false,
      });
      Alert.alert('Success', 'Driver added');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to add driver');
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please enable media permissions.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Driver 👤</Text>

      <TouchableOpacity style={styles.avatarWrapper} onPress={pickAvatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="camera-outline" size={30} color="#888" />
        )}
        <Text style={styles.avatarText}>{avatar ? 'Change' : 'Upload'} Avatar</Text>
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="call-outline" size={20} color="#888" />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Add Driver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 13,
    color: '#007AFF',
  },
});
