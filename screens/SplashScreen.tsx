import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const role = snap.data()?.role;
          navigation.reset({
            index: 0,
            routes: [{ name: role === 'Admin' ? 'AdminDashboard' : 'Map' }],
          });
        } else {
          navigation.replace('Login');
        }
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  logo: {
    width: 210,
    height: 210,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 800,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 20,
  },
});
