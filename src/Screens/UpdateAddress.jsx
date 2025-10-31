import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  // ✅ Get token from AsyncStorage
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

  // ✅ Fetch current address from API
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

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

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
    const init = async () => {
      await getToken(); // Get token first
    };
    init();
  }, []);

  // 👇 When token is available, fetch address
  useEffect(() => {
    if (token) {
      fetchCurrentAddress(token);
    }
  }, [token]);

  const handleUpdate = () => {
    if (!street || !city || !state || !zip) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    const newAddress = { street, city, state, zip };
    console.log("Updated Address: ", newAddress);
    Alert.alert("Success", "Service address updated successfully!");
  };

  return (
    <ScrollView style={tw`flex-1 bg-white px-4 pt-8`}>
      {/* Header */}
      <View style={tw`flex-row items-center mb-4 py-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={tw`ml-3 text-lg font-semibold`}>Update Address</Text>
      </View>

      {/* Current Service Address */}
      <View style={tw`bg-gray-100 rounded-xl p-4`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="location-on" size={22} color="black" />
          <Text style={tw`ml-2 font-semibold`}>Current Service Address</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={tw`mt-3`}
          />
        ) : (
          <>
            <Text style={tw`mt-2 text-gray-800`}>
              {currentAddress || "No address available"}
            </Text>
            <Text style={tw`text-gray-500 text-xs`}>Account #UC-2024-0789</Text>
          </>
        )}
      </View>

      {/* New Service Address */}
      <View style={tw`bg-white rounded-xl p-4 mt-6 border border-gray-200`}>
        <Text style={tw`font-semibold mb-2`}>New Service Address</Text>
        <Text style={tw`text-xs text-gray-500 mb-4`}>
          Enter your new address details. Service transfer will be effective
          next billing cycle.
        </Text>

        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="Street Address"
          placeholderTextColor="gray"
          value={street}
          onChangeText={setStreet}
        />
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="City"
          placeholderTextColor="gray"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="State"
          placeholderTextColor="gray"
          value={state}
          onChangeText={setState}
        />
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="ZIP Code"
          placeholderTextColor="gray"
          keyboardType="numeric"
          value={zip}
          onChangeText={setZip}
        />

        <View style={tw`bg-gray-100 rounded-lg p-3 mb-4`}>
          <Text style={tw`text-xs text-gray-600`}>
            Note: Address changes may require a service visit to ensure proper
            connection at your new location. A $25 transfer fee may apply.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            tw`py-3 rounded-xl`,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleUpdate}
        >
          <Text style={tw`text-white text-center font-semibold`}>
            Update Service Address
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-xs text-gray-500 text-center mt-4 mb-6`}>
        You'll receive confirmation via email and SMS once the update is
        processed
      </Text>
    </ScrollView>
  );
};

export default UpdateAddress;
