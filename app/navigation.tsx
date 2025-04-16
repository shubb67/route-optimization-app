import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import Login from '../screens/LoginScreen';
import AddDriver from '../screens/AddDriverScreen';
import SplashScreen from '@/screens/SplashScreen';
import AdminTabs from '@/navigation/AdminTabs'; // Import the AdminTabs component
import PDFViewerScreen from '@/screens/PDFViewerScreen';
import AssignRoutesScreen from '@/screens/AssignRouteScreen';
import RouteDetailsScreen from '@/screens/RouteDetailsScreen';
import EditDriverScreen from '@/screens/EditDriverScreen';
import DriverRouteScreen from '@/screens/DriverRouteScreen';
import DriverNavigator from '@/navigation/DriverNavigationDrawer';
import ProfileScreen from '@/screens/driver/ProfileScreen';
import AppSettingScreen from '@/screens/driver/AppSettingScreen';
import OptimizedMapScreen from '@/screens/driver/OptimizedMapScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >

        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="AddDriver" component={AddDriver} />
        <Stack.Screen name="AdminDashboard" component={AdminTabs} />
        <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
        <Stack.Screen name="AssignRoutes" component={AssignRoutesScreen} />
        <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
        <Stack.Screen name="EditDriver" component={EditDriverScreen} />
        <Stack.Screen name="DriverRouteScreen" component={DriverRouteScreen} />
        <Stack.Screen name="DriverNavigator" component={DriverNavigator} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="AppSettingScreen" component={AppSettingScreen} />
        <Stack.Screen name="OptimizedMapScreen" component={OptimizedMapScreen} />


      </Stack.Navigator>
  );
};

export default Navigation;
