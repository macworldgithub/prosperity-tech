// /** @format */
// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import tw from "tailwind-react-native-classnames";
// import { Ionicons } from "@expo/vector-icons";
// import { theme } from "../utils/theme";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const ChatScreen = ({ navigation }) => {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([
//     {
//       id: 1,
//       type: "bot",
//       text: "Hey there 👋 I'm your AI assistant! How can I help you today?",
//       time: new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(null); // store session id from API

//   const scrollViewRef = useRef();

//   const sendMessage = async () => {
//     if (!message.trim() || loading) return;

//     const userMsg = {
//       id: chat.length + 1,
//       type: "user",
//       text: message.trim(),
//       time: new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     };

//     setChat((prev) => [...prev, userMsg]);
//     setMessage("");
//     setLoading(true);

//     try {
//       // Retrieve the access token from AsyncStorage
//       const token = await AsyncStorage.getItem("access_token");
//       if (!token) {
//         throw new Error("No authentication token found. Please log in again.");
//       }

//       const payload = sessionId
//         ? { query: userMsg.text, session_id: sessionId }
//         : { query: userMsg.text };

//       const response = await fetch("https://bele.omnisuiteai.com/chat/query", {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("API Response:", data);

//       // store session id if first time
//       if (!sessionId && data.session_id) {
//         setSessionId(data.session_id);
//       }

//       const botMsg = {
//         id: chat.length + 2,
//         type: "bot",
//         text: data?.message || "Sorry, I couldn’t understand that.",
//         time: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       };

//       setChat((prev) => [...prev, botMsg]);
//     } catch (error) {
//       console.error("Chat error:", error);
//       const errorMsg = {
//         id: chat.length + 2,
//         type: "bot",
//         text: error.message.includes("401")
//           ? "Session expired. Please log in again."
//           : "Oops 😅 Something went wrong. Please try again.",
//         time: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       };
//       setChat((prev) => [...prev, errorMsg]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={theme.gradients.splash}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 0.5, y: 1 }}
//       style={tw`flex-1`}
//     >
//       {/* Header */}
//       <View style={tw`flex-row items-center px-4 py-3 mt-12`}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={tw`text-white text-lg font-semibold ml-3`}>
//           Chat with AI Bot
//         </Text>
//       </View>

//       {/* Chat Messages */}
//       <KeyboardAvoidingView
//         style={tw`flex-1`}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <ScrollView
//           ref={scrollViewRef}
//           contentContainerStyle={tw`px-4 pb-6`}
//           showsVerticalScrollIndicator={false}
//           onContentSizeChange={() =>
//             scrollViewRef.current?.scrollToEnd({ animated: true })
//           }
//         >
//           {chat.map((msg) =>
//             msg.type === "user" ? (
//               <View key={msg.id} style={tw`items-end mt-4`}>
//                 <LinearGradient
//                   colors={theme.AIgradients.linear}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={[tw`px-4 py-3 rounded-2xl`, { maxWidth: "80%" }]}
//                 >
//                   <Text style={tw`text-white`}>{msg.text}</Text>
//                 </LinearGradient>
//                 <Text style={tw`text-gray-400 text-xs mt-1`}>{msg.time}</Text>
//               </View>
//             ) : (
//               <View
//                 key={msg.id}
//                 style={[tw`mt-6 flex-row items-start`, { maxWidth: "90%" }]}
//               >
//                 <LinearGradient
//                   colors={theme.AIgradients.linear}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={tw`w-8 h-8 rounded-full items-center justify-center mr-2`}
//                 >
//                   <Ionicons name="sparkles" size={18} color="white" />
//                 </LinearGradient>

//                 <LinearGradient
//                   colors={theme.AIgradients.linear}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                   style={tw`p-[1px] rounded-2xl flex-shrink`}
//                 >
//                   <View
//                     style={[
//                       tw`px-4 py-3 rounded-2xl`,
//                       {
//                         backgroundColor: "rgba(255,255,255,0.05)",
//                         maxWidth: "85%",
//                       },
//                     ]}
//                   >
//                     <Text style={tw`text-white`}>{msg.text}</Text>
//                   </View>
//                 </LinearGradient>
//               </View>
//             )
//           )}

//           {/* Bot Typing Indicator */}
//           {loading && (
//             <View style={[tw`mt-6 flex-row items-start`, { maxWidth: "90%" }]}>
//               <LinearGradient
//                 colors={theme.AIgradients.linear}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={tw`w-8 h-8 rounded-full items-center justify-center mr-2`}
//               >
//                 <Ionicons name="sparkles" size={18} color="white" />
//               </LinearGradient>
//               <View
//                 style={[
//                   tw`px-4 py-3 rounded-2xl bg-gray-700`,
//                   { maxWidth: "85%" },
//                 ]}
//               >
//                 <ActivityIndicator size="small" color="#fff" />
//               </View>
//             </View>
//           )}
//         </ScrollView>

//         {/* Message Input Area */}
//         <View
//           style={[
//             tw`flex-row items-center px-4 py-3 mb-12`,
//             { backgroundColor: "rgba(255,255,255,0.05)" },
//           ]}
//         >
//           <TextInput
//             style={tw`flex-1 text-white px-4 py-2 rounded-full bg-gray-800`}
//             placeholder="Type your message..."
//             placeholderTextColor="#aaa"
//             value={message}
//             onChangeText={setMessage}
//             onSubmitEditing={sendMessage}
//           />

//           <LinearGradient
//             colors={theme.AIgradients.linear}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={tw`ml-2 w-10 h-10 rounded-full items-center justify-center`}
//           >
//             <TouchableOpacity onPress={sendMessage}>
//               <Ionicons name="arrow-up" size={20} color="white" />
//             </TouchableOpacity>
//           </LinearGradient>
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default ChatScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";

const API_URL = "https://your-api.com/api"; // change to your backend

export default function ChatWindow() {
  const [chat, setChat] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi there 👋 How can I help you?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Form & number selection states
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    postcode: "",
    pin: "",
  });

  const [showNumbers, setShowNumbers] = useState(false);
  const [numberOptions, setNumberOptions] = useState([]);

  const updateForm = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const validateForm = () => {
    if (!form.firstName) return Alert.alert("Enter First Name"), false;
    if (!form.email.includes("@")) return Alert.alert("Invalid email"), false;
    if (!/^04\d{8}$/.test(form.phone))
      return Alert.alert("Valid AU mobile (04XXXXXXXX)"), false;
    if (!/^\d{4}$/.test(form.postcode))
      return Alert.alert("Postcode must be 4 digits"), false;
    if (!/^\d{4}$/.test(form.pin))
      return Alert.alert("PIN must be 4 digits"), false;
    return true;
  };

  const submitForm = () => {
    if (!validateForm()) return;
    const msg = Object.entries(form)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    setShowForm(false);
    handleSend(msg);

    setForm({
      firstName: "",
      surname: "",
      email: "",
      phone: "",
      postcode: "",
      pin: "",
    });
  };

  const handleSend = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      type: "user",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const payload = sessionId
        ? { query: text, session_id: sessionId }
        : { query: text };

      const { data } = await axios.post(API_URL, payload);

      if (!sessionId && data.session_id) setSessionId(data.session_id);

      const botMsg = {
        id: Date.now() + 1,
        type: "bot",
        text: data.message || "Okay",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChat((prev) => [...prev, botMsg]);

      if (data.askDetails) setShowForm(true);
      if (data.mobileNumbers) {
        setNumberOptions(data.mobileNumbers);
        setShowNumbers(true);
      }
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { id: Date.now(), type: "bot", text: "Error. Try again.", time: "" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMsg = ({ item }) => (
    <View
      className={`p-3 rounded-2xl mb-2 max-w-[75%] ${
        item.type === "user" ? "bg-green-600 self-end" : "bg-white self-start"
      }`}
    >
      <Text className={item.type === "user" ? "text-white" : "text-black"}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#e7f0f7] p-3">
      <FlatList
        data={chat}
        renderItem={renderMsg}
        keyExtractor={(i) => i.id.toString()}
      />

      {loading && <ActivityIndicator size="small" />}

      {/* Number pick */}
      {showNumbers && (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {numberOptions.map((n) => (
            <TouchableOpacity
              key={n}
              className="bg-green-600 rounded-lg px-4 py-2"
              onPress={() => {
                setShowNumbers(false);
                handleSend(n);
              }}
            >
              <Text className="text-white font-semibold">{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Chat Input */}
      {!showForm && !showNumbers && (
        <View className="flex-row items-center gap-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => handleSend(message)}
            placeholder="Message..."
            className="flex-1 bg-white px-4 py-2 rounded-full"
          />
          <TouchableOpacity
            onPress={() => handleSend(message)}
            className="bg-green-600 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-bold">Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-white p-5"
        >
          <ScrollView className="space-y-2">
            {Object.keys(form).map((field) => (
              <TextInput
                key={field}
                placeholder={field}
                value={form[field]}
                onChangeText={(v) => updateForm(field, v)}
                className="border p-3 rounded-lg"
                keyboardType={
                  ["phone", "postcode", "pin"].includes(field)
                    ? "numeric"
                    : "default"
                }
              />
            ))}

            <TouchableOpacity
              onPress={submitForm}
              className="bg-green-600 p-3 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-bold">Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
