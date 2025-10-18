/** @format */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../utils/theme";
import { LinearGradient } from "expo-linear-gradient";

const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState("");

  return (
    <LinearGradient
      colors={theme.gradients.splash}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={tw`flex-1`}
    >
      {/* Header */}
      <View style={tw`flex-row items-center px-4 py-3 mt-12`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >

          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={tw`text-white text-lg font-semibold ml-3`}>
          Chat with AI bot
        </Text>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={tw`px-4 pb-6`}
          showsVerticalScrollIndicator={false}
        >
          {/* USER MESSAGE */}
          <View style={tw`items-end mt-4`}>
            <LinearGradient
              colors={theme.AIgradients.linear}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[tw`px-4 py-3 rounded-2xl`, { maxWidth: "80%" }]} // 👈 keeps inside screen
            >
              <Text style={tw`text-white`}>
                Can you help me create a weekly fitness plan?
              </Text>
            </LinearGradient>
            <Text style={tw`text-gray-400 text-xs mt-1`}>8:20 PM</Text>
          </View>

          {/* BOT MESSAGE */}
          <View style={[tw`mt-6 flex-row items-start`, { maxWidth: "90%" }]}>
            <LinearGradient
              colors={theme.AIgradients.linear}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`w-8 h-8 rounded-full items-center justify-center mr-2`}
            >
              <Ionicons name="sparkles" size={18} color="white" />
            </LinearGradient>

            <LinearGradient
              colors={theme.AIgradients.linear}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`p-[1px] rounded-2xl flex-shrink`}
            >
              <View
                style={[
                  tw`px-4 py-3 rounded-2xl`,
                  { backgroundColor: "rgba(255,255,255,0.05)", maxWidth: "85%" },
                ]}
              >
                <Text style={tw`text-white`}>
                  Of course! For an unforgettable adventure, you could explore
                  the Amazon Rainforest in Brazil, trek the Himalayas in Nepal,
                  or go on a safari in Kenya. Do you prefer jungle, mountains,
                  or wildlife?
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Placeholder Image */}
          <View
            style={[
              tw`w-32 h-32 bg-gray-600 self-end mt-4 rounded-xl`,
              { opacity: 0.3 },
            ]}
          />

          {/* USER MESSAGE */}
          <View style={tw`items-end mt-4`}>
            <LinearGradient
              colors={theme.AIgradients.linear}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[tw`px-4 py-3 rounded-2xl`, { maxWidth: "80%" }]}
            >
              <Text style={tw`text-white`}>
                That mountain looks amazing! Where is it?
              </Text>
            </LinearGradient>
            <Text style={tw`text-gray-400 text-xs mt-1`}>8:20 PM</Text>
          </View>

          {/* BOT MESSAGE */}
          <View style={[tw`mt-6 flex-row items-start`, { maxWidth: "90%" }]}>
            <LinearGradient
              colors={theme.AIgradients.linear}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`w-8 h-8 rounded-full items-center justify-center mr-2`}
            >
              <Ionicons name="sparkles" size={18} color="white" />
            </LinearGradient>

            <LinearGradient
              colors={theme.AIgradients.linear}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`p-[1px] rounded-2xl flex-shrink`}
            >
              <View
                style={[
                  tw`px-4 py-3 rounded-2xl`,
                  { backgroundColor: "rgba(255,255,255,0.05)", maxWidth: "85%" },
                ]}
              >
                <Text style={tw`text-white`}>
                  That’s the Annapurna Circuit in Nepal, one of the most famous
                  trekking routes in the world. Known for breathtaking
                  landscapes and cultural experiences.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* MESSAGE INPUT AREA */}
        <View
          style={[
            tw`flex-row items-center px-4 py-3 mb-12`,
            { backgroundColor: "rgba(255,255,255,0.05)" },
          ]}
        >
          <TextInput
            style={tw`flex-1 text-white px-4 py-2 rounded-full bg-gray-800`}
            placeholder="What’s on your mind?"
            placeholderTextColor="#aaa"
            value={message}
            onChangeText={setMessage}
          />

          <LinearGradient
            colors={theme.AIgradients.linear}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`ml-2 w-10 h-10 rounded-full items-center justify-center`}
          >
            <TouchableOpacity>
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ChatScreen;
