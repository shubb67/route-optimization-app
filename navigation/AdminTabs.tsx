import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminDashboard from '../screens/AdminDashboardScreen';
import RouteViewer from '@/screens/UploadRouteScreen'; // will show uploaded PDF content
import { MaterialIcons } from '@expo/vector-icons';
import AssignRoutesScreen from '@/screens/AssignRouteScreen';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Drivers"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RouteViewer}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={size} />
          ),
        }}
      />
        <Tab.Screen
        name="AssignRoutes"
        component={AssignRoutesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
