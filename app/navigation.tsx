import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

import Login from '../screens/LoginScreen';
import SignUp from '../screens/SignUpScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
  );
};

export default Navigation;
