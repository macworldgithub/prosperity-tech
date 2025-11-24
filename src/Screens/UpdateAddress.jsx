import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../utils/theme";
import { API_BASE_URL } from "../utils/config";

const UpdateAddress = ({ navigation }) => {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [token, setToken] = useState("");

  // Get token from AsyncStorage
  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("access_token");
      if (storedToken) {
        setToken(storedToken);
      } else {
        Alert.alert("Error", "No access token found. Please log in again.");
        navigation.replace("Login");
      }
    } catch (error) {
      console.error("Error reading token:", error);
      Alert.alert("Error", "Failed to retrieve access token.");
    }
  };

  // Fetch current address
  const fetchCurrentAddress = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}address`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();
      setCurrentAddress(data.serviceAddress || "No address found");
    } catch (error) {
      console.error("Error fetching address:", error);
      Alert.alert("Error", "Failed to load service address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentAddress(token);
    }
  }, [token]);

  // Handle Address Update
  const handleUpdate = async () => {
    if (!street || !city || !state || !zip) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    const newAddress = `${street}, ${city}, ${state}, ${zip}`;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}address/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newAddress }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentAddress(data.address?.serviceAddress || newAddress);
        Alert.alert("Success", "Service address updated successfully!");
        // Clear fields
        setStreet("");
        setCity("");
        setState("");
        setZip("");
      } else {
        Alert.alert("Error", data.message || "Failed to update address.");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust for header/status bar
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={tw`flex-row items-center mb-6 mt-8`}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={tw`p-2`}
            >
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
            <Text style={tw`text-xl font-bold ml-3 `}>Update Address</Text>
          </View>

          {/* Current Service Address */}
          <View style={tw`bg-gray-100 rounded-2xl p-5 mb-6`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="location-sharp" size={24} color="#1f2937" />
              <Text style={tw`ml-3 font-bold text-gray-800`}>
                Current Service Address
              </Text>
            </View>
            {loading && !currentAddress ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={tw`mt-3`}
              />
            ) : (
              <Text style={tw`mt-2 text-base text-gray-700`}>
                {currentAddress || "No address available"}
              </Text>
            )}
          </View>

          {/* New Address Form */}
          <View
            style={tw`bg-white rounded-2xl p-5 border border-gray-200 shadow-sm`}
          >
            <Text style={tw`text-lg font-bold mb-2`}>New Service Address</Text>
            <Text style={tw`text-sm text-gray-500 mb-5`}>
              Enter your new address details. Service transfer will be effective
              next billing cycle.
            </Text>

            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-4 mb-4 text-base bg-white`}
              placeholder="Street Address"
              placeholderTextColor="#9ca3af"
              value={street}
              onChangeText={setStreet}
              autoCapitalize="words"
            />

            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-4 mb-4 text-base bg-white`}
              placeholder="City"
              placeholderTextColor="#9ca3af"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />

            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-4 mb-4 text-base bg-white`}
              placeholder="State"
              placeholderTextColor="#9ca3af"
              value={state}
              onChangeText={setState}
              autoCapitalize="words"
            />

            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-4 mb-4 text-base bg-white`}
              placeholder="Post Code / ZIP"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={zip}
              onChangeText={setZip}
              maxLength={10}
            />

            {/* Info Note */}
            <View
              style={tw`bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200`}
            >
              <Text style={tw`text-sm text-blue-800`}>
                Note: Address changes may require a service visit to ensure
                proper connection at your new location. A $25 transfer fee may
                apply.
              </Text>
            </View>

            {/* Update Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={loading}
              style={[
                tw`py-4 rounded-xl items-center`,
                { backgroundColor: loading ? "#94a3b8" : theme.colors.primary },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={tw`text-white font-bold text-lg`}>
                  Update Service Address
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Text */}
          <Text style={tw`text-center text-xs text-gray-500 mt-8 mb-10`}>
            You'll receive confirmation via email and SMS once the update is
            processed.
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UpdateAddress;
