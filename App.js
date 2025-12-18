import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/Screens/Home";
import SignUp from "./src/Screens/Signup";
import BillQuery from "./src/Screens/BillQuery";
import UpdateAddress from "./src/Screens/UpdateAddress";
import CoverageCheck from "./src/Screens/CoverageCheck";
import Splash from "./src/Screens/Splash";
import Login from "./src/Screens/Login";
import PrivacyConsent from "./src/Screens/PrivacyConsent";
import ChatAI from "./src/Screens/ChatAI";
import PlansScreen from "./src/Screens/PlanScreen";
import Order from "./src/Screens/Order";
import OrderDetail from "./src/Screens/OrderDetail";
import SelectPlanScreen from "./src/Screens/SelectPlanScreen";

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
        <Stack.Screen name="PrivacyConsent" component={PrivacyConsent} />
        <Stack.Screen name="ChatAI" component={ChatAI} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Plans" component={PlansScreen} />
        <Stack.Screen name="Order" component={Order} />
        <Stack.Screen name="OrderDetail" component={OrderDetail} />
        <Stack.Screen name="SelectPlan" component={SelectPlanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
