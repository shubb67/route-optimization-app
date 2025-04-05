import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import Login from '../screens/LoginScreen';
import SignUp from '../screens/SignUpScreen';
import MapScreen from '../screens/MapScreen';
import SplashScreen from '@/screens/SplashScreen';
import AdminTabs from '@/navigation/AdminTabs'; // Import the AdminTabs component
import PDFViewerScreen from '@/screens/PDFViewerScreen';
import AssignRoutesScreen from '@/screens/AssignRouteScreen';

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
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminTabs} />
        <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
        <Stack.Screen name="AssignRoutes" component={AssignRoutesScreen} />

      </Stack.Navigator>
  );
};

export default Navigation;
