import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "tailwind-react-native-classnames";
import { theme } from "../utils/theme";
import fingerprint from "../../assets/finger_print.png" 

const Login = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={theme.gradients.splash} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={tw`flex-1`}
    >
      <View style={tw`flex-1 items-center justify-center px-6`}>
        <View
          style={[
            tw`bg-white rounded-2xl shadow-lg p-6 w-full`,
            { maxWidth: 320 },
          ]}
        >
          <Text style={tw`text-xl font-bold text-center mb-2`}>
            Secure Login
          </Text>
          <Text style={tw`text-gray-500 text-xs text-center mb-2`}>
            Choose your preferred authentication method
          </Text>

          {/* Biometric Section */}
          <View style={tw`items-center mb-4`}>
            <Image source={fingerprint} style={tw`w-12 h-12 mb-2`} />
            <Text style={tw`text-base font-semibold text-center`}>
              Biometric Authentication
            </Text>
            <Text style={tw`text-gray-500 text-xs text-center`}>
              Touch the fingerprint sensor or use face recognition
            </Text>
          </View>

          {/* Login Buttons */}
          <TouchableOpacity
            style={[tw`py-3 rounded-lg mb-3`, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.replace("Home")}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              Use Biometric Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[tw`border py-3 rounded-lg`, { borderColor: theme.colors.primary }]}
            onPress={() => navigation.replace("PrivacyConsent")}
          >
            <Text style={tw`text-black text-center font-semibold`}>
              Use PIN Instead
            </Text>
          </TouchableOpacity>

          <Text style={tw`text-gray-400 text-xs text-center mt-4`}>
            Your login attempts are logged for security purposes
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Login;
