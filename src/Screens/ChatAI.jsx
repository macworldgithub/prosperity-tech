import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      id: Date.now(),
      type: "bot",
      text: "Hey there 👋 I'm your AI assistant! How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showNumberButtons, setShowNumberButtons] = useState(false);
  const [numberOptions, setNumberOptions] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    dob: "", // stored as YYYY-MM-DD
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    pin: "",
  });

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    pin: "",
  });

  const [dobDateObj, setDobDateObj] = useState(new Date(1990, 0, 1)); // Date object for picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  const scrollViewRef = useRef();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600; // breakpoint; adjust if you want

  // Helpers
  const isDetailsRequest = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes("first name") &&
      lowerText.includes("surname") &&
      lowerText.includes("email") &&
      lowerText.includes("phone") &&
      (lowerText.includes("date of birth") ||
        lowerText.includes("dob") ||
        lowerText.includes("date of birth")) &&
      lowerText.includes("address") &&
      lowerText.includes("suburb") &&
      lowerText.includes("state") &&
      lowerText.includes("postcode") &&
      lowerText.includes("pin")
    );
  };

  const isNumberSelection = (text) => {
    if (!text) return false;
    const matches = text.match(/04\d{8}/g);
    return matches ? matches.length >= 1 : false;
  };

  const extractNumbers = (text) => {
    if (!text) return [];
    const matches = text.match(/04\d{8}/g);
    return matches || [];
  };

  // Date helpers
  const formatDateToYMD = (d) => {
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseYMDToDate = (ymd) => {
    if (!ymd) return new Date(1990, 0, 1);
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // Clear invalid session
  const clearSession = async () => {
    setSessionId(null);
    try {
      await AsyncStorage.removeItem("chat_session_id");
    } catch (e) {
      // ignore
    }
  };

  // Date picker change handler
  const onDateChange = (event, selectedDate) => {
    // Avoid crash/dismissed on Android
    if (event?.type === "dismissed" || !selectedDate) {
      return;
    }

    setDobDateObj(selectedDate);
    // For Android, update form and close immediately
    if (Platform.OS === "android") {
      const ymd = formatDateToYMD(selectedDate);
      handleFormChange("dob", ymd);
      setShowDatePicker(false);
    }
    // For iOS, update temp date but wait for Done
  };

  // iOS Done handler
  const handleIosDone = () => {
    const ymd = formatDateToYMD(dobDateObj);
    handleFormChange("dob", ymd);
    setShowDatePicker(false);
  };

  // iOS Cancel handler
  const handleIosCancel = () => {
    setShowDatePicker(false);
  };

  // Validation
  const validateForm = () => {
    let isValid = true;
    const errors = {
      firstName: "",
      surname: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      suburb: "",
      state: "",
      postcode: "",
      pin: "",
    };

    if (!formData.firstName.trim()) {
      errors.firstName = "First Name is required";
      isValid = false;
    }
    if (!formData.surname.trim()) {
      errors.surname = "Surname is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
      isValid = false;
    } else if (!/^04\d{8}$/.test(formData.phone)) {
      errors.phone =
        "Phone must be a valid Australian mobile (e.g., 0412345678)";
      isValid = false;
    }
    if (!formData.dob.trim()) {
      errors.dob = "Date of Birth is required";
      isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
      errors.dob = "Date of Birth must be YYYY-MM-DD";
      isValid = false;
    }
    if (!formData.address.trim()) {
      errors.address = "Address is required";
      isValid = false;
    }
    if (!formData.suburb.trim()) {
      errors.suburb = "Suburb is required";
      isValid = false;
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
      isValid = false;
    }
    if (!formData.postcode.trim()) {
      errors.postcode = "Postcode is required";
      isValid = false;
    } else if (!/^\d{4}$/.test(formData.postcode)) {
      errors.postcode = "Postcode must be 4 digits";
      isValid = false;
    }
    if (!formData.pin.trim()) {
      errors.pin = "PIN is required";
      isValid = false;
    } else if (!/^\d{4}$/.test(formData.pin)) {
      errors.pin = "PIN must be exactly 4 digits";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formatted = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    setShowDetailsForm(false);
    setFormData({
      firstName: "",
      surname: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      suburb: "",
      state: "",
      postcode: "",
      pin: "",
    });
    setFormErrors({
      firstName: "",
      surname: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      suburb: "",
      state: "",
      postcode: "",
      pin: "",
    });

    await handleSend(formatted);
  };

  const handleNumberSelect = async (number) => {
    setShowNumberButtons(false);
    setNumberOptions([]);
    await handleSend(number);
  };

  // core send logic
  const handleSend = async (msgText, retryWithoutSession = false) => {
    if (!msgText || loading) return;

    const userMsg = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type: "user",
      text: msgText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      let payload;
      if (retryWithoutSession || !sessionId) {
        payload = { query: userMsg.text };
      } else {
        payload = { query: userMsg.text, session_id: sessionId };
      }

      console.log("Sending payload:", payload);

      const response = await fetch("https://bele.omnisuiteai.com/chat/query", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let errorBody = "";
      if (!response.ok) {
        errorBody = await response.text();
        console.error("API Error Response Body:", errorBody);
        throw new Error(
          `HTTP ${response.status}: ${errorBody || response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!sessionId && !retryWithoutSession && data.session_id) {
        setSessionId(data.session_id);
        try {
          await AsyncStorage.setItem("chat_session_id", data.session_id);
        } catch (e) {
          // ignore storage errors
        }
      }

      const botText =
        data?.message || data?.response || "Sorry, I couldn’t understand that.";
      const botMsg = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: botText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChat((prev) => [...prev, botMsg]);

      if (isDetailsRequest(botText)) {
        setTimeout(() => {
          setShowDetailsForm(true);
          setShowNumberButtons(false);
        }, 300);
      } else if (isNumberSelection(botText)) {
        const numbers = extractNumbers(botText);
        setNumberOptions(numbers);
        setShowNumberButtons(true);
        setShowDetailsForm(false);
      } else {
        setShowDetailsForm(false);
        setShowNumberButtons(false);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsgText = error.message;
      let retry = false;

      if (errorMsgText.includes("Invalid session ID")) {
        await clearSession();
        retry = true;
        const retryMsg = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          type: "bot",
          text: "Session refreshed. Retrying your message...",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChat((prev) => [...prev, retryMsg]);
      }

      if (!retry) {
        const errorMsg = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          type: "bot",
          text:
            error.message && error.message.includes("401")
              ? "Session expired. Please log in again."
              : `API Error: ${error.message}. Check console for details.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChat((prev) => [...prev, errorMsg]);
      }

      if (retry) {
        // Retry the send without session
        setTimeout(() => {
          handleSend(msgText, true);
        }, 500);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const sendMessage = () => {
    handleSend(message);
  };

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("chat_session_id");
        if (stored) setSessionId(stored);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <LinearGradient
      colors={theme.gradients.splash}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={tw`flex-1`}
    >
      {/* Header */}
      <View style={tw`flex-row items-center px-4 py-3 mt-12`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={tw`text-white text-lg font-semibold ml-3`}>
          Chat with AI Bot
        </Text>
      </View>

      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={tw`px-4 pb-6`}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {chat.map((msg) =>
            msg.type === "user" ? (
              <View key={msg.id} style={tw`items-end mt-4`}>
                <LinearGradient
                  colors={theme.AIgradients.linear}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[tw`px-4 py-3 rounded-2xl`, { maxWidth: "80%" }]}
                >
                  <Text style={tw`text-white`}>{msg.text}</Text>
                </LinearGradient>
                <Text style={tw`text-gray-400 text-xs mt-1`}>{msg.time}</Text>
              </View>
            ) : (
              <View
                key={msg.id}
                style={[tw`mt-6 flex-row items-start`, { maxWidth: "90%" }]}
              >
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
                  style={tw`border rounded-2xl flex-shrink`}
                >
                  <View
                    style={[
                      tw`px-4 py-3 rounded-2xl`,
                      {
                        backgroundColor: "rgba(255,255,255,0.05)",
                        maxWidth: "85%",
                      },
                    ]}
                  >
                    <Text style={tw`text-white`}>{msg.text}</Text>
                  </View>
                </LinearGradient>
              </View>
            )
          )}

          {/* Typing indicator */}
          {loading && (
            <View style={[tw`mt-6 flex-row items-start`, { maxWidth: "90%" }]}>
              <LinearGradient
                colors={theme.AIgradients.linear}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`w-8 h-8 rounded-full items-center justify-center mr-2`}
              >
                <Ionicons name="sparkles" size={18} color="white" />
              </LinearGradient>
              <View
                style={[
                  tw`px-4 py-3 rounded-2xl bg-gray-700`,
                  { maxWidth: "85%" },
                ]}
              >
                <ActivityIndicator size="small" color="#fff" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input / Forms */}
        <View
          style={[
            tw`px-4 py-3 mb-12`,
            { backgroundColor: "rgba(255,255,255,0.05)" },
          ]}
        >
          {showDetailsForm ? (
            <View
              style={[
                tw`p-3 rounded-lg`,
                { backgroundColor: "rgba(0,0,0,0.25)" },
              ]}
            >
              <ScrollView
                style={{ maxHeight: 360 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {/* two-column layout becomes single-column on small screens */}
                <View style={tw`flex-row flex-wrap -mx-1`}>
                  {[
                    {
                      name: "firstName",
                      placeholder: "First Name",
                      keyboard: "default",
                    },
                    {
                      name: "surname",
                      placeholder: "Surname",
                      keyboard: "default",
                    },
                    {
                      name: "email",
                      placeholder: "Email",
                      keyboard: "email-address",
                    },
                    {
                      name: "phone",
                      placeholder: "Phone (0412345678)",
                      keyboard: "phone-pad",
                    },
                    // DOB will be rendered separately below (native picker)
                    {
                      name: "address",
                      placeholder: "Address",
                      keyboard: "default",
                    },
                    {
                      name: "suburb",
                      placeholder: "Suburb",
                      keyboard: "default",
                    },
                    {
                      name: "state",
                      placeholder: "State (e.g., VIC)",
                      keyboard: "default",
                    },
                    {
                      name: "postcode",
                      placeholder: "Postcode (4 digits)",
                      keyboard: "number-pad",
                    },
                    {
                      name: "pin",
                      placeholder: "4-digit PIN",
                      keyboard: "number-pad",
                    },
                  ].map((field, idx) => {
                    // skip dob in this loop
                    if (field.name === "dob") return null;
                    return (
                      <View
                        key={field.name}
                        style={[
                          tw`px-1`,
                          { width: isSmallScreen ? "100%" : "50%" },
                        ]}
                      >
                        <TextInput
                          value={formData[field.name]}
                          onChangeText={(val) =>
                            handleFormChange(field.name, val)
                          }
                          placeholder={field.placeholder}
                          placeholderTextColor="#ddd"
                          keyboardType={field.keyboard}
                          style={[
                            tw`w-full p-2 rounded bg-transparent text-white border border-white/30 text-sm`,
                            { marginVertical: 6 },
                          ]}
                        />
                        {formErrors[field.name] ? (
                          <Text style={tw`text-red-300 text-xs`}>
                            {formErrors[field.name]}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}

                  {/* DOB field (native date picker opener) */}
                  <View
                    style={[
                      tw`px-1`,
                      { width: isSmallScreen ? "100%" : "50%" },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        const dateToUse = formData.dob
                          ? parseYMDToDate(formData.dob)
                          : new Date(1990, 0, 1);
                        setDobDateObj(dateToUse);
                        setShowDatePicker(true);
                      }}
                      style={[
                        tw`w-full p-2 rounded bg-transparent border border-white/30`,
                        { marginVertical: 6, justifyContent: "center" },
                      ]}
                    >
                      <Text
                        style={tw`text-sm ${
                          formData.dob ? "text-white" : "text-white/60"
                        }`}
                      >
                        {formData.dob
                          ? `DOB: ${formData.dob}`
                          : "Date of Birth (tap to pick)"}
                      </Text>
                    </TouchableOpacity>

                    {formErrors.dob ? (
                      <Text style={tw`text-red-300 text-xs`}>
                        {formErrors.dob}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={handleFormSubmit}
                disabled={loading}
                style={tw`mt-3 bg-[#2bb673] py-3 rounded`}
              >
                <Text style={tw`text-center text-white font-semibold`}>
                  Submit Details
                </Text>
              </TouchableOpacity>
            </View>
          ) : showNumberButtons ? (
            <View style={tw`flex-row flex-wrap gap-2 justify-center`}>
              {numberOptions.map((num, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleNumberSelect(num)}
                  disabled={loading}
                  style={tw`px-3 py-2 rounded bg-[#2bb673] m-1`}
                >
                  <Text style={tw`text-white`}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={tw`flex-row items-center`}>
              <TextInput
                style={tw`flex-1 text-white px-4 py-2 rounded-full bg-gray-800`}
                placeholder="Type your message..."
                placeholderTextColor="#aaa"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />

              <LinearGradient
                colors={theme.AIgradients.linear}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`ml-2 w-10 h-10 rounded-full items-center justify-center`}
              >
                <TouchableOpacity onPress={sendMessage}>
                  <Ionicons name="arrow-up" size={20} color="white" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Android Date Picker (Inline) */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={dobDateObj}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* iOS Date Picker (Custom Modal) */}
      {Platform.OS === "ios" && showDatePicker && (
        <Modal transparent animationType="slide">
          <View style={tw`flex-1 justify-end bg-black/50`}>
            <View style={tw`bg-white rounded-t-2xl p-4`}>
              {/* Header with Cancel and Done */}
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <TouchableOpacity onPress={handleIosCancel} style={tw`p-2`}>
                  <Text style={tw`text-red-500 font-semibold`}>Cancel</Text>
                </TouchableOpacity>
                <Text
                  style={tw`text-center flex-1 font-semibold text-gray-700`}
                >
                  Select Date of Birth
                </Text>
                <TouchableOpacity onPress={handleIosDone} style={tw`p-2`}>
                  <Text style={tw`text-blue-500 font-semibold`}>Done</Text>
                </TouchableOpacity>
              </View>
              {/* Picker Container with Fixed Height for Spinner */}
              <View style={{ height: 216 }}>
                <DateTimePicker
                  value={dobDateObj}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  themeVariant="light"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

export default ChatScreen;
