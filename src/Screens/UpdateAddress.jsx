import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import tw from "tailwind-react-native-classnames";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ArrowLeft } from "lucide-react-native";
import { theme } from "../utils/theme";

const UpdateAddress = ({navigation}) => {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const handleUpdate = () => {
    if (!street || !city || !state || !zip) {
      alert("Please fill all fields");
      return;
    }

    // Dynamic data payload
    const newAddress = {
      street,
      city,
      state,
      zip,
    };

    console.log("Updated Address: ", newAddress);
    alert("Service address updated successfully!");
  };

  return (
    <ScrollView style={tw`flex-1 bg-white px-4 pt-8`}>
      {/* Header */}
      <View style={tw`flex-row items-center mb-4 py-4 `}>
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
        <Text style={tw`mt-2 text-gray-800`}>
          123 Main St, Anytown, ST 12345
        </Text>
        <Text style={tw`text-gray-500 text-xs`}>Account #UC-2024-0789</Text>
      </View>

      {/* New Service Address */}
      <View style={tw`bg-white rounded-xl p-4 mt-6 border border-gray-200`}>
        <Text style={tw`font-semibold mb-2`}>New Service Address</Text>
        <Text style={tw`text-xs text-gray-500 mb-4`}>
          Enter your new address details. Service transfer will be effective next billing cycle.
        </Text>

        {/* Input Fields */}
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="Street Address"
          value={street}
          onChangeText={setStreet}
        />
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="State"
          value={state}
          onChangeText={setState}
        />
        <TextInput
          style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
          placeholder="ZIP Code"
          keyboardType="numeric"
          value={zip}
          onChangeText={setZip}
        />

        {/* Note */}
        <View style={tw`bg-gray-100 rounded-lg p-3 mb-4`}>
          <Text style={tw`text-xs text-gray-600`}>
            Note: Address changes may require a service visit to ensure proper connection at your new location. 
            A $25 transfer fee may apply.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[tw`py-3 rounded-xl`, { backgroundColor: theme.colors.primary }]}
          onPress={handleUpdate}
        >
          <Text style={tw`text-white text-center font-semibold`}>
            Update Service Address
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Note */}
      <Text style={tw`text-xs text-gray-500 text-center mt-4 mb-6`}>
        You'll receive confirmation via email and SMS once the update is processed
      </Text>
    </ScrollView>
  );
};

export default UpdateAddress;
