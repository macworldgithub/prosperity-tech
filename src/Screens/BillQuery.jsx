import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { ArrowLeft } from "lucide-react-native";
import { theme } from "../utils/theme";

const BillQuery = ({ navigation }) => {
  const [billItems] = useState([
    { label: "Previous Balance", amount: 0.0 },
    { label: "Service Charge (May 1–31)", amount: 85.5 },
    { label: "Service Charge (Duplicate)", amount: 85.5, highlight: true },
    { label: "Taxes & Fees", amount: 12.28 },
  ]);

  const total = billItems.reduce((acc, item) => acc + item.amount, 0);

  return (
    <SafeAreaView
      style={[
        tw`flex-1 bg-white`,
        {
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          paddingBottom: 10,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={tw`px-4 pt-4 pb-8`}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={tw`flex-row items-center mb-4`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text style={tw`ml-3 text-lg font-semibold`}>Bill Query</Text>
        </View>

        {/* Current Bill Card */}
        <View
          style={tw`bg-white rounded-xl shadow p-4 mb-6 border border-gray-300`}
        >
          <Text style={tw`text-base font-semibold mb-3`}>
            Current Bill - May 2024
          </Text>
          {billItems.map((item, index) => (
            <View
              key={index}
              style={tw`flex-row justify-between items-center py-2 border-b border-gray-200`}
            >
              <Text
                style={[
                  tw`text-sm text-gray-700`,
                  item.highlight && { color: "red", fontWeight: "600" },
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  tw`text-sm font-medium`,
                  item.highlight && { color: "red" },
                ]}
              >
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={tw`flex-row justify-between items-center pt-3`}>
            <Text style={tw`text-sm font-semibold`}>Total Amount Due</Text>
            <Text style={tw`text-sm font-semibold`}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Ask About Bill Section */}
        <View
          style={tw`bg-white rounded-xl shadow p-4 mb-6 border border-gray-300`}
        >
          <Text style={tw`text-base font-semibold mb-2`}>
            Ask About Your Bill
          </Text>
          <Text style={tw`text-xs text-gray-500 mb-3`}>
            Describe your billing question or concern, and we'll investigate
          </Text>

          {/* Input Box */}
          <Text style={tw`text-xs text-gray-700 mb-1`}>Your Question</Text>
          <TextInput
            placeholder="e.g., I notice a duplicate charge..."
            style={tw`border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4`}
            multiline
            numberOfLines={4}
          />

          {/* Common Issues */}
          <Text style={tw`text-xs text-gray-500 mb-2`}>
            Common Issues We Can Help With:
          </Text>
          <View style={tw`pl-2`}>
            {[
              "Duplicate or incorrect charges.",
              "Unexpectedly high bills.",
              "Payment processing questions.",
              "Service date discrepancies.",
              "Tax and fee explanations.",
            ].map((issue, i) => (
              <Text key={i} style={tw`text-xs text-gray-600 mb-1`}>
                • {issue}
              </Text>
            ))}
          </View>
        </View>

        {/* Submit Button */}
       <TouchableOpacity
          style={[
            tw`py-3 rounded-xl mb-4`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={tw`text-center text-white font-semibold`}>
            Submit Query
          </Text>
        </TouchableOpacity>

        <Text style={tw`text-center text-xs text-gray-500 mb-6`}>
          You'll receive a response within 24–48 hours via email or phone
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillQuery;
