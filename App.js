import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/Screens/Home';
import BillQuery from './src/Screens/BillQuery';
import UpdateAddress from './src/Screens/UpdateAddress';
import CoverageCheck from './src/Screens/CoverageCheck';
import Splash from './src/Screens/Splash';
import Login from './src/Screens/Login';
import PrivacyConsent from './src/Screens/PrivacyConsent';
import ChatAI from './src/Screens/ChatAI';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Initial Route is Splash */}
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="BillQuery" component={BillQuery} />
        <Stack.Screen name="UpdateAddress" component={UpdateAddress} />
        <Stack.Screen name="CoverageCheck" component={CoverageCheck} />
        <Stack.Screen name="PrivacyConsent" component={PrivacyConsent}/>
        <Stack.Screen name="ChatAI" component={ChatAI} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
