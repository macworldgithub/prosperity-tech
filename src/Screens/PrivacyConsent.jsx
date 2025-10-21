import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "tailwind-react-native-classnames";
import { theme } from "../utils/theme";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/config";

const PrivacyConsent = () => {
  const [gdprChecked, setGdprChecked] = useState(false);
  const [ccpaChecked, setCcpaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleAccept = async () => {
    if (!gdprChecked || !ccpaChecked) {
      Alert.alert(
        "Consent Required",
        "Please accept both GDPR and CCPA consents before proceeding."
      );
      return;
    }

    try {
      setLoading(true);

      await AsyncStorage.setItem(
        "userConsent",
        JSON.stringify({ gdprChecked, ccpaChecked })
      );

      const savedEmail = await AsyncStorage.getItem("lastEmail");
      const savedPin = await AsyncStorage.getItem("lastPin");

      if (!savedEmail || !savedPin) {
        Alert.alert(
          "Missing Credentials",
          "Please log in again to continue."
        );
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}auth/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: savedEmail.trim(),
          pin: savedPin,
        }),
      });

      const data = await response.json();
      console.log("Consent → Login Response:", data);

      if (response.status !== 201) {
        throw new Error(data.message || "Login failed");
      }

      await AsyncStorage.setItem("userData", JSON.stringify(data));
      await AsyncStorage.setItem("access_token", data.access_token);

      Alert.alert("Success", "You have accepted privacy policies and logged in!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ]);
    } catch (error) {
      console.error("Consent Login Error:", error);
      Alert.alert("Error", error.message || "Something went wrong while logging in.");
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
      <View style={tw`flex-1 items-center justify-center px-4`}>
        <View style={tw`bg-white rounded-2xl w-full p-6`}>
          <Text style={tw`text-lg font-bold text-center mb-1`}>
            Privacy & Consent
          </Text>
          <Text style={tw`text-gray-600 text-center mb-5 text-xs`}>
            Please review and accept our data protection policies
          </Text>

          {/* GDPR Section */}
          <View style={tw`mb-4 border border-gray-300 rounded-lg p-3`}>
            <Text style={tw`font-semibold mb-2`}>GDPR Data Protection</Text>
            <View style={tw`border border-gray-300 rounded-md h-20 p-2 mb-2 bg-gray-50`}>
              <ScrollView>
                <Text style={tw`text-sm text-gray-700`}>
                  <Text style={tw`font-semibold`}>
                    General Data Protection Regulation (GDPR) Consent:
                  </Text>{" "}
                  We collect and process your personal data including account
                  information, billing details, and service usage data to
                  provide utility services.
                </Text>
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={() => setGdprChecked(!gdprChecked)}
              style={tw`flex-row items-center`}
            >
              <View
                style={[
                  tw`w-5 h-5 mr-2 border rounded items-center justify-center`,
                  {
                    borderColor: theme.colors.secondary,
                    backgroundColor: gdprChecked
                      ? theme.colors.secondary
                      : "transparent",
                  },
                ]}
              >
                {gdprChecked && <Text style={tw`text-white text-xs`}>✓</Text>}
              </View>
              <Text style={tw`text-gray-700 text-sm`}>
                I consent to the processing of my personal data under GDPR
              </Text>
            </TouchableOpacity>
          </View>

          {/* CCPA Section */}
          <View style={tw`mb-4 border border-gray-300 rounded-lg p-3`}>
            <Text style={tw`font-semibold mb-2`}>CCPA Privacy Rights</Text>
            <View style={tw`border border-gray-300 rounded-md h-20 p-2 mb-2 bg-gray-50`}>
              <ScrollView>
                <Text style={tw`text-sm text-gray-700`}>
                  <Text style={tw`font-semibold`}>
                    California Consumer Privacy Act (CCPA) Notice:
                  </Text>{" "}
                  We may share your information with service partners for
                  billing, maintenance, and customer support. We do not sell
                  personal information.
                </Text>
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={() => setCcpaChecked(!ccpaChecked)}
              style={tw`flex-row items-center`}
            >
              <View
                style={[
                  tw`w-5 h-5 mr-2 border rounded items-center justify-center`,
                  {
                    borderColor: theme.colors.secondary,
                    backgroundColor: ccpaChecked
                      ? theme.colors.secondary
                      : "transparent",
                  },
                ]}
              >
                {ccpaChecked && <Text style={tw`text-white text-xs`}>✓</Text>}
              </View>
              <Text style={tw`text-gray-700 text-sm`}>
                I acknowledge my rights under CCPA and consent to data processing
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View style={tw`flex-row mt-4`}>
            <TouchableOpacity
              style={[
                tw`flex-1 border rounded-xl py-3 mr-2 items-center justify-center`,
                { borderColor: theme.colors.primary },
              ]}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={tw`font-semibold text-black`}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                tw`flex-1 rounded-xl py-3 ml-2 items-center justify-center`,
                {
                  backgroundColor:
                    gdprChecked && ccpaChecked
                      ? theme.colors.primary
                      : "#A5B4FC",
                },
              ]}
              onPress={handleAccept}
              disabled={!gdprChecked || !ccpaChecked || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`font-semibold text-white`}>
                  Accept & Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={tw`text-gray-500 text-xs text-center mt-3`}>
            Your consent preferences are stored securely and can be updated in
            account settings.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default PrivacyConsent;
