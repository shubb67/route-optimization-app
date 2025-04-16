// src/screens/driver/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { auth, db } from '../../firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{userData.name || 'Driver'}</Text>
      <Text style={styles.role}>{userData.role}</Text>
      <Text style={styles.email}>📧 {auth.currentUser?.email}</Text>
      <Text style={styles.phone}>📱 {userData.phone || 'Not provided'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 40 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700', color: '#111' },
  role: { fontSize: 14, color: '#555', marginBottom: 8 },
  email: { fontSize: 14, color: '#333', marginTop: 10 },
  phone: { fontSize: 14, color: '#333', marginTop: 6 },
});
