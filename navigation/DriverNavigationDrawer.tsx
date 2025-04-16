import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseconfig';

import DriverRouteScreen from '../screens/DriverRouteScreen';
import ProfileScreen from '@/screens/driver/ProfileScreen';
import AppSettingScreen from '@/screens/driver/AppSettingScreen';
import App from '@/app';
// import SettingsScreen from '../screens/driver/SettingsScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const [userInfo, setUserInfo] = useState<{ name: string; role: string }>({
    name: '',
    role: '',
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const { name, role } = userDoc.data();
        setUserInfo({ name, role });
      }
    };

    fetchUserDetails();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err: any) {
      Alert.alert('Logout Error', err.message);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
          style={styles.avatar}
        />
       <Text style={styles.name}>{userInfo.name || 'Unknown'}</Text>
       <Text style={styles.role}>{userInfo.role || 'Driver'}</Text>
      </View>

      <DrawerItemList {...props} />

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#d11a2a" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DriverNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="AssignedRoutes"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { fontSize: 15 },
      }}
    >
      
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen} // Replace with actual ProfileScreen component
        options={{
          drawerIcon: ({ color }) => <Ionicons name="person-outline" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AssignedRoutes"
        component={DriverRouteScreen}
        options={{
          title: ' Assigned Route',
          drawerIcon: ({ color }) => <Ionicons name="map-outline" size={20} color={color} />,
        }}
      />
       <Drawer.Screen
        name="Help and Support"
        component={DriverRouteScreen}
        options={{
          title: ' Help and Support',
          drawerIcon: ({ color }) => <Ionicons name="help-outline" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={AppSettingScreen} // Replace with actual SettingsScreen component
        options={{
          drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={20} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  role: {
    fontSize: 13,
    color: '#555',
  },
  footer: {
    marginTop: 'auto',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    color: '#d11a2a',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
});
