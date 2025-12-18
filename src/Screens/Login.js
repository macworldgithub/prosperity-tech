import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "tailwind-react-native-classnames";
import { theme } from "../utils/theme";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/config";
import fingerprint from "../../assets/finger_print.png";

const Login = () => {
  const navigation = useNavigation();
  const [hasBiometric, setHasBiometric] = useState(false);
  const [showBiometricScreen, setShowBiometricScreen] = useState(false);
  const [showForgetPinScreen, setShowForgetPinScreen] = useState(false);
  const [identifierInput, setIdentifierInput] = useState("");
  const [forgetIdentifier, setForgetIdentifier] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgetLoading, setForgetLoading] = useState(false);

  //Check saved user and biometric availability
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const hasHardware = await LocalAuthentication.hasHardwareAsync();

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        const biometricAvailable = hasHardware && isEnrolled;
        setHasBiometric(biometricAvailable);

        // If user data exists, show biometric screen instead of login
        if (userData && biometricAvailable) {
          setShowBiometricScreen(true);
        } else {
          console.log(
            "ℹNo saved user or biometrics unavailable, showing login screen..."
          );
        }
      } catch (e) {
        console.log("Error checking biometric:", e);
      }
    };
    checkAuthStatus();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to continue",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        const userData = await AsyncStorage.getItem("userData");

        if (userData) {
          navigation.replace("Home");
        } else {
          Alert.alert("No saved session found. Please log in again.");
          setShowBiometricScreen(false);
        }
      } else {
        Alert.alert("Authentication Failed", "Please use your PIN instead.");
        setShowBiometricScreen(false);
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication unavailable.");
      setShowBiometricScreen(false);
    }
  };

  const handleLogin = async () => {
    if (!identifierInput || !pinInput) {
      Alert.alert("Missing Fields", "Please enter both identifier and PIN.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}auth/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifierInput.trim(),
          pin: pinInput,
        }),
      });

      const data = await response.json();

      if (response.status !== 201) {
        throw new Error(data.message || "Invalid credentials");
      }

      await AsyncStorage.setItem("userData", JSON.stringify(data));
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("lastIdentifier", identifierInput.trim());
      await AsyncStorage.setItem("lastPin", pinInput);

      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    if (!forgetIdentifier.trim()) {
      Alert.alert(
        "Missing Field",
        "Please enter your identifier (email or custNo)."
      );
      return;
    }

    try {
      setForgetLoading(true);
      const response = await fetch(`${API_BASE_URL}auth/forgot-pin`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: forgetIdentifier.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert("Success", data.message || "New PIN sent to your email.");
        setShowForgetPinScreen(false); // 👈 CHANGED: Go back to main login screen
        setForgetIdentifier("");
      } else {
        Alert.alert(
          "Failed",
          data.message || "Unable to send PIN. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot PIN API Error:", error);
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again."
      );
    } finally {
      setForgetLoading(false);
    }
  };

  // 👈 ADDED: Render Forget PIN Screen (full screen, no modal)
  if (showForgetPinScreen) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LinearGradient
          colors={theme.gradients.splash}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              marginTop: 270,
              // justifyContent: "center",
              paddingHorizontal: 24,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                tw`bg-white rounded-2xl py-3 px-5`,
                { maxWidth: 320, alignSelf: "center", width: "100%" },
              ]}
            >
              <Text style={tw`text-xl font-bold text-center mb-2`}>
                Reset Your PIN
              </Text>

              <TextInput
                style={tw`border border-gray-300 rounded-lg px-3 py-1 mb-3`}
                placeholder="Enter Identifier (email or custNo)"
                placeholderTextColor="#9CA3AF"
                value={forgetIdentifier}
                onChangeText={setForgetIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Pressable
                onPress={handleForgotPin}
                disabled={forgetLoading}
                style={({ pressed }) => [
                  tw`py-2 rounded-lg mb-2`,
                  {
                    backgroundColor: pressed
                      ? theme.colors.primary + "CC"
                      : theme.colors.primary,
                    opacity: forgetLoading ? 0.6 : 1,
                  },
                ]}
              >
                {forgetLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white text-center font-semibold`}>
                    Send New PIN
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowForgetPinScreen(false);
                  setForgetIdentifier("");
                }}
                style={({ pressed }) => [
                  tw`border py-2 rounded-lg`,
                  {
                    borderColor: theme.colors.primary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    tw`text-center font-semibold`,
                    { color: theme.colors.primary },
                  ]}
                >
                  Back to Login
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  if (showBiometricScreen) {
    return (
      <LinearGradient
        colors={theme.gradients.splash}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tw`flex-1 items-center justify-center px-6`}
      >
        <View
          style={[
            tw`bg-white rounded-2xl shadow-lg p-6 w-full`,
            { maxWidth: 320 },
          ]}
        >
          <Text style={tw`text-xl font-bold text-center mb-4`}>
            Welcome Back
          </Text>
          <Image
            source={fingerprint}
            style={tw`w-16 h-16 mx-auto mb-4`}
            resizeMode="contain"
          />
          <Text style={tw`text-gray-500 text-center mb-4`}>
            Use your fingerprint to unlock your session
          </Text>
          <Pressable
            onPress={handleBiometricAuth}
            style={({ pressed }) => [
              tw`py-3 rounded-lg`,
              {
                backgroundColor: pressed
                  ? theme.colors.primary + "CC"
                  : theme.colors.primary,
              },
            ]}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              Authenticate
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              console.log("🔄 Switching from biometric to PIN login...");
              setShowBiometricScreen(false);
            }}
            style={({ pressed }) => [
              tw`mt-3 border py-3 rounded-lg`,
              {
                borderColor: theme.colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                tw`text-center font-semibold`,
                { color: theme.colors.primary },
              ]}
            >
              Use PIN Instead
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // 👈 MODIFIED: Direct PIN login screen (full screen, no modal)
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={theme.gradients.splash}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            marginTop: 210,
            // justifyContent: "center",
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              tw`bg-white rounded-2xl p-3 px-5`,
              { maxWidth: 320, alignSelf: "center", width: "100%" },
            ]}
          >
            <Text style={tw`text-lg font-bold text-center mb-4`}>Login</Text>

            <TextInput
              style={tw`border border-gray-300 rounded-lg px-3 py-1 mb-3`}
              placeholder="Email or Customer Number"
              placeholderTextColor="#9CA3AF"
              value={identifierInput}
              onChangeText={setIdentifierInput}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={tw`border border-gray-300 text-black rounded-lg px-3 py-1 mb-2`}
              placeholder="PIN"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              keyboardType="numeric"
              value={pinInput}
              onChangeText={setPinInput}
            />

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                tw`py-2 rounded-lg mb-1`,
                {
                  backgroundColor: pressed
                    ? theme.colors.primary + "CC"
                    : theme.colors.primary,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white text-center font-semibold`}>
                  Log In
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => setShowForgetPinScreen(true)}
              style={({ pressed }) => [
                tw`border py-2 rounded-lg mb-1`,
                {
                  borderColor: theme.colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-center font-semibold`,
                  { color: theme.colors.primary },
                ]}
              >
                Forget PIN?
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("SelectPlan")}
              style={({ pressed }) => [
                tw`border py-2 rounded-lg mb-1`,
                {
                  borderColor: theme.colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-center font-semibold`,
                  { color: theme.colors.primary },
                ]}
              >
                Buy an esim
              </Text>
            </Pressable>
            
            <Text style={tw`text-center text-black text-xl`}>or</Text>

            <Pressable
              onPress={() => navigation.navigate("ChatAI")}
              style={({ pressed }) => [
                tw`border py-2 rounded-lg`,
                {
                  borderColor: theme.colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-center font-semibold`,
                  { color: theme.colors.primary },
                ]}
              >
                ASK AI
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default Login;
