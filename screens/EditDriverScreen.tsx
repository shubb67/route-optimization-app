import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';

export default function EditDriverScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { driver } = route.params;

  const [name, setName] = useState(driver.name);
  const [email, setEmail] = useState(driver.email);

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'users', driver.id), {
        name,
        email,
      });
      Alert.alert('✅ Success', 'Driver details updated');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating driver:', err);
      Alert.alert('❌ Error', 'Failed to update driver');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Driver</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Driver Name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="Driver Email"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#151717' },
  label: { fontSize: 14, color: '#444', marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
