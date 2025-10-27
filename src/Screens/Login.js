import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "tailwind-react-native-classnames";
import { theme } from "../utils/theme";
import fingerprint from "../../assets/finger_print.png";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/config";

const Login = () => {
  const navigation = useNavigation();
  const [hasBiometric, setHasBiometric] = useState(false);
  const [userIdInput, setUserIdInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometric(Boolean(hasHardware && isEnrolled));
      } catch (e) {
        setHasBiometric(false);
      }
    };
    checkBiometrics();
  }, []);

  const handleBiometricPress = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate",
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
      });

      if (result.success) {
        await AsyncStorage.setItem("lastEmail", emailInput.trim());
        await AsyncStorage.setItem("lastPin", pinInput);

        navigation.navigate("Home");
        return;
      }

      Alert.alert("Authentication Failed", "Please try again or use PIN.");
    } catch (e) {
      Alert.alert(
        "Biometrics Unavailable",
        "Your device may not support or have biometrics set up. Use PIN instead."
      );
    }
  };
  const handleLogin = async () => {
    if (!emailInput || !pinInput) {
      Alert.alert("Missing Fields", "Please enter both email and PIN.");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Logging in with:", { email: emailInput, pin: pinInput });

      const response = await fetch(`${API_BASE_URL}auth/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.trim(),
          pin: pinInput, // ✅ correct key per Swagger
        }),
      });

      const data = await response.json();
      console.log("📥 Login API Response:", data);

      if (response.status !== 201) {
        // ✅ handle 201 Created as success
        throw new Error(data.message || "Unauthorized");
      }

      // ✅ Store token
      await AsyncStorage.setItem("userData", JSON.stringify(data));
      await AsyncStorage.setItem("access_token", data.access_token);

      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => {
            setModalVisible(false);
            navigation.navigate("Home");
          },
        },
      ]);
    } catch (error) {
      console.error("❌ Login Error:", error);
      Alert.alert("Login Failed", error.message || "Unauthorized access.");
    } finally {
      setLoading(false);
    }
  };
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
          <Text style={tw`text-gray-500 text-sm text-center mb-2`}>
            Choose your preferred authentication method
          </Text>

          <View style={tw`items-center mb-4`}>
            <Image
              source={fingerprint}
              style={tw`w-14 h-14 mb-2`}
              resizeMode="contain"
            />
            <Text style={tw`text-base font-semibold text-center`}>
              Biometric Authentication
            </Text>
            <Text style={tw`text-gray-500 text-xs text-center`}>
              Touch the fingerprint sensor or use face recognition
            </Text>
          </View>

          <TouchableOpacity
            style={[
              tw` py-3 rounded-lg mb-3`,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleBiometricPress}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              {hasBiometric ? "Use Biometric Login" : "Biometric Not Available"}
            </Text>
          </TouchableOpacity>

          <Text style={tw`text-base font-semibold text-center mt-4 mb-3`}>
            PIN Login
          </Text>
          <TouchableOpacity
            style={[
              tw`border  py-3 rounded-lg mb-3`,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={[
                tw`text-center font-semibold`,
                { color: theme.colors.primary },
              ]}
            >
              Use PIN Instead
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              tw`border  py-3 rounded-lg`,
              { borderColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text
              style={[
                tw`text-center font-semibold`,
                { color: theme.colors.primary },
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          <Text style={tw`text-gray-400 text-xs text-center mt-4`}>
            Your login attempts are logged for security purposes
          </Text>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
        >
          <View style={[tw`bg-white rounded-2xl p-6 w-4/5`, { maxWidth: 320 }]}>
            <Text style={tw`text-lg font-bold text-center mb-4`}>
              Email Login
            </Text>

            <TextInput
              style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
              placeholder="Enter Email Address"
              placeholderTextColor="#9CA3AF"
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={[
                tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`,
                { color: "black" },
              ]}
              placeholder="Enter PIN"
              placeholderTextColor="#9CA3AF"
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="numeric"
              secureTextEntry
            />

            <TouchableOpacity
              style={[
                tw`py-3 rounded-lg mb-3`,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white text-center font-semibold`}>
                  Log In
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                tw`border py-3 rounded-lg`,
                { borderColor: theme.colors.primary },
              ]}
              onPress={() => {
                setModalVisible(false);
                setEmailInput("");
                setPinInput("");
              }}
            >
              <Text
                style={[
                  tw`text-center font-semibold`,
                  { color: theme.colors.primary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default Login;
