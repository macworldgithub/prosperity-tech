import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!emailInput || !pinInput) {
      Alert.alert("Missing Fields", "Please enter both email and PIN.");
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
          email: emailInput.trim(),
          pin: pinInput,
        }),
      });

      const data = await response.json();

      if (response.status !== 201) {
        throw new Error(data.message || "Invalid credentials");
      }

      await AsyncStorage.setItem("userData", JSON.stringify(data));
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("lastEmail", emailInput.trim());
      await AsyncStorage.setItem("lastPin", pinInput);

      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => {
            setModalVisible(false);
            navigation.replace("Home");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

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
          <TouchableOpacity
            onPress={handleBiometricAuth}
            style={[
              tw`py-3 rounded-lg`,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              Authenticate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log("🔄 Switching from biometric to PIN login...");
              setShowBiometricScreen(false);
            }}
            style={[
              tw`mt-3 border py-3 rounded-lg`,
              { borderColor: theme.colors.primary },
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
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  //Default login screen (first-time)
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
        <Text style={tw`text-xl font-bold text-center mb-4`}>Secure Login</Text>

        <TouchableOpacity
          style={[
            tw`border py-3 rounded-lg mb-3`,
            { borderColor: theme.colors.primary },
          ]}
          onPress={() => {
            setModalVisible(true);
          }}
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
            tw`border py-3 rounded-lg`,
            { borderColor: theme.colors.primary },
          ]}
          onPress={() => {
            navigation.navigate("SignUp");
          }}
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
      </View>

      {/* PIN Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
        >
          <View style={[tw`bg-white rounded-2xl p-6 w-4/5`, { maxWidth: 320 }]}>
            <Text style={tw`text-lg font-bold text-center mb-4`}>
              PIN Login
            </Text>

            <TextInput
              style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
              placeholder="Enter Email"
              placeholderTextColor="#9CA3AF"
              value={emailInput}
              onChangeText={(text) => {
                setEmailInput(text);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
              placeholder="Enter PIN"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              keyboardType="numeric"
              value={pinInput}
              onChangeText={(text) => {
                setPinInput(text);
              }}
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
              onPress={() => {
                setModalVisible(false);
              }}
              style={[
                tw`border py-3 rounded-lg`,
                { borderColor: theme.colors.primary },
              ]}
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
