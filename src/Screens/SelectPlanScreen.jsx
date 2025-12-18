import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";
import { API_BASE_URL } from "../utils/config";

const SelectPlanScreen = () => {
  const navigation = useNavigation();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/v1/plans`);
        if (!response.ok) throw new Error("Failed to fetch plans");

        const data = await response.json();
        setPlans(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan) => {
    try {
      await AsyncStorage.setItem("selectedPlan", JSON.stringify(plan));

      navigation.navigate("ChatAI");
    } catch (err) {
      console.error("Error saving plan:", err);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center px-4`}>
        <Text style={tw`text-red-500 text-center`}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handleSelectPlan(item)}
      style={({ pressed }) => [
        tw`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200`,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {/* Header Row */}
      <View style={tw`flex-row justify-between items-start mb-3`}>
        <View style={tw`flex-1 pr-3`}>
          <Text style={tw`text-lg font-semibold text-gray-900`}>
            {item.planName}
          </Text>
          <Text style={tw`text-sm text-gray-500 mt-1`}>{item.groupName}</Text>
        </View>

        {/* Price Badge */}
        <View style={tw`bg-green-100 px-3 py-1 rounded-full`}>
          <Text style={tw`text-green-700 font-semibold`}>${item.price}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={tw`h-px bg-gray-200 mb-3`} />

      {/* Details */}
      <View style={tw`flex-row justify-between`}>
        <View>
          <Text style={tw`text-xs text-gray-400 mb-1`}>NETWORK</Text>
          <Text style={tw`text-sm font-medium text-gray-700`}>
            {item.network}
          </Text>
        </View>

        <View>
          <Text style={tw`text-xs text-gray-400 mb-1`}>USAGE TYPE</Text>
          <Text style={tw`text-sm font-medium text-gray-700`}>
            {item.usageType}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Screen Header */}
      <View style={tw`px-4 pt-6 pb-4`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>Select a Plan</Text>
        <Text style={tw`text-gray-500 mt-1`}>
          Choose the best eSIM plan for your needs
        </Text>
      </View>

      {/* Plans List */}
      <FlatList
        data={plans}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={tw`px-4 pb-6`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default SelectPlanScreen;
