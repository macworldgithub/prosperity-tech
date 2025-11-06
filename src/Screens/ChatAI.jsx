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
  Alert,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PaymentProcessCard } from "../components/PaymentProcessCard";
import { TokenCard } from "../components/TokenCard";
import { PaymentCard } from "../components/PaymentCard";
const API_BASE_URL = "https://bele.omnisuiteai.com";
const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hey there 👋 I'm your AI assistant! How can I help you today? You can say 'I want to sign up' to get started.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showNumberButtons, setShowNumberButtons] = useState(false);
  const [numberOptions, setNumberOptions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobDateObj, setDobDateObj] = useState(new Date(1990, 0, 1));
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;
  const [showPayment, setShowPayment] = useState(false);
  const [showTokenCard, setShowTokenCard] = useState(false);
  const [showPaymentProcessCard, setShowPaymentProcessCard] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [hasSelectedNumber, setHasSelectedNumber] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showSelectionSummary, setShowSelectionSummary] = useState(false);
  const [formData, setFormData] = useState({
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
  const [formErrors, setFormErrors] = useState({});
  const scrollViewRef = useRef();
  // Form handling
  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const validateForm = () => {
    let isValid = true;
    const errors = {};
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
  const handleFormSubmit = async () => {
    if (!validateForm()) return;
    const formatted = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    try {
      setLoading(true);
      // Store the form data before resetting
      const formDataCopy = { ...formData };
      // Reset form data first
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
      // Close the signup form
      setShowSignupForm(false);
      // Send the form data
      await handleSend(formatted);
      // After successful signup, show number selection
      setTimeout(() => {
        // This will trigger the number selection in handleSend
        handleSend("Please show available numbers");
      }, 1000);
    } catch (error) {
      console.error("Form submission error:", error);
      Alert.alert("Error", "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSignupIntent = async (userMessage) => {
    const signupKeywords = ["sign up", "signup", "register", "create account"];
    const hasSignupIntent = signupKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword)
    );
    if (hasSignupIntent) {
      setShowSignupForm(true);
      const botMsg = {
        id: chat.length + 2,
        type: "bot",
        text: "To sign up for a JUSTmobile plan, I'll need some information from you. Could you please provide your first name, surname, email, phone number, date of birth (in YYYY-MM-DD format), address, suburb, state, postcode, and a PIN? Is there anything else I can help with?",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, botMsg]);
      return true;
    }
    return false;
  };
  const handleStartPayment = () => {
    setShowSignupForm(false); // Hide signup form
    setShowNumberButtons(false); // Hide number selection
    setShowPayment(true); // Show payment form
  };
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
      // Check for signup intent
      if (!retryWithoutSession) {
        const isSignupIntent = await handleSignupIntent(msgText);
        if (isSignupIntent) {
          setLoading(false);
          return;
        }
      }
      let payload;
      if (retryWithoutSession || !sessionId) {
        payload = { query: msgText };
      } else {
        payload = { query: msgText, session_id: sessionId };
      }
      const token = await AsyncStorage.getItem("access_token");
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/chat/query`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorBody || response.statusText}`
        );
      }
      const data = await response.json();
      if (!sessionId && !retryWithoutSession && data.session_id) {
        setSessionId(data.session_id);
        try {
          await AsyncStorage.setItem("chat_session_id", data.session_id);
        } catch (e) {
          // ignore storage errors
        }
      }
      const botText = data?.message || "Sorry, I couldn't understand that.";
      // Always append the bot message to the chat
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
      // Handle special cases (native UI) regardless of appending message
      const willHandleNatively =
        isDetailsRequest(botText) ||
        (isNumberSelection(botText) && !hasSelectedNumber);
      if (willHandleNatively) {
        if (isDetailsRequest(botText)) {
          // show native signup form
          setShowSignupForm(true);
          setShowNumberButtons(false);
        } else if (isNumberSelection(botText) && !hasSelectedNumber) {
          const numbers = extractNumbers(botText);
          setNumberOptions(numbers);
          setShowNumberButtons(true);
          setShowSignupForm(false);
        }
      } else {
        setShowSignupForm(false);
        setShowNumberButtons(false);
        // Only show the selection summary in the stage between number selection and plan selection
        if (
          hasSelectedNumber &&
          !selectedPlan &&
          !showPayment &&
          !showTokenCard &&
          !showPaymentProcessCard
        ) {
          const cidMatch = botText.match(/customer\s*id\s*is\s*(\d+)/i);
          if (cidMatch && cidMatch[1]) {
            setSelectedCustomerId(cidMatch[1]);
          }
          setShowSelectionSummary(true);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: error.message.includes("401")
          ? "Session expired. Please log in again."
          : `Error: ${error.message}. Please try again.`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, errorMsg]);
      // Retry without session if session is invalid
      if (error.message.includes("Invalid session") && !retryWithoutSession) {
        await clearSession();
        setTimeout(() => {
          handleSend(msgText, true);
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };
  const sendMessage = () => {
    handleSend(message);
  };
  // Helper functions
  const isDetailsRequest = (text) => {
    return (
      text.toLowerCase().includes("details") ||
      text.toLowerCase().includes("information")
    );
  };
  const isNumberSelection = (text) => {
    const lower = text.toLowerCase();
    const isPrompt = /(choose|select|option|pick|let me know which)/i.test(
      lower
    );
    const isConfirmation = /\bselected\b/.test(lower);
    return isPrompt && !isConfirmation;
  };
  const extractNumbers = (text) => {
    const numbers = text.match(/\d+/g);
    return numbers ? numbers.slice(0, 5) : [];
  };
  const handleNumberSelect = async (number) => {
    setShowNumberButtons(false);
    setHasSelectedNumber(true);
    setSelectedNumber(number);
    setShowSelectionSummary(true);
    try {
      // First, send the selected number (this will append backend's bot message)
      await handleSend(number);
      // Then fetch available plans
      const response = await fetch(
        "https://bele.omnisuiteai.com/api/v1/plans",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem(
              "access_token"
            )}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch plans");
      }
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setPlans(data.data);
        setShowPlans(true);
        // Optionally add a hardcoded message if backend doesn't provide one; otherwise, rely on handleSend's response
        // const planMessage = { ... }; // Commented out to avoid duplication with backend message
        // setChat((prev) => [...prev, planMessage]);
      } else {
        throw new Error("No plans available at the moment");
      }
    } catch (error) {
      console.error("Error in number selection:", error);
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: `Sorry, we couldn't load the plans. ${error.message}`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, errorMessage]);
      // Show the number buttons again to allow retry
      setShowNumberButtons(true);
    }
  };
  const handlePlanSelect = async (plan) => {
    try {
      setLoading(true);
      setSelectedPlan(plan);
      setShowPlans(false);
      // Hide number/Customer ID summary once plan selection begins
      setShowSelectionSummary(false);
      // Also clear the flag so it doesn't reappear on later bot messages
      setHasSelectedNumber(false);
      // Send selected plan to backend as a string
      try {
        const planString = JSON.stringify(plan);
        handleSend(planString);
      } catch (e) {
        // fallback: send basic string if serialization fails
        handleSend(
          `Selected plan: ${plan?.name || plan?.planName || "Unknown"} - $${
            plan?.price ?? ""
          }/month`
        );
      }
      // Add a message about the selected plan (or rely on backend if sending to it)
      const planSelectedMessage = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: `You've selected the ${plan.name} plan for $${plan.price}/month. Please enter your payment details to proceed.`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, planSelectedMessage]);
      // Show payment form after a short delay
      setTimeout(() => {
        setShowPayment(true);
        // Scroll to bottom to show the payment form
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 500);
    } catch (error) {
      console.error("Error selecting plan:", error);
      const errorMessage = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: `Sorry, we couldn't process your plan selection. ${
          error.message || "Please try again."
        }`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, errorMessage]);
      setShowPlans(true);
    } finally {
      setLoading(false);
    }
  };
  const clearSession = async () => {
    setSessionId(null);
    try {
      await AsyncStorage.removeItem("chat_session_id");
    } catch (e) {
      // ignore
    }
  };
  // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDobDateObj(selectedDate);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      handleFormChange("dob", formattedDate);
    }
  };
  const handleIosDone = () => {
    setShowDatePicker(false);
    const formattedDate = dobDateObj.toISOString().split("T")[0];
    handleFormChange("dob", formattedDate);
  };
  const handleIosCancel = () => {
    setShowDatePicker(false);
  };
  // Load session on mount
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
  useEffect(() => {
    if (showPayment) {
      setShowSignupForm(false);
      setShowNumberButtons(false);
    }
  }, [showPayment]);
  return (
    <LinearGradient
      colors={theme.gradients.splash}
      start={{ x: 0.85, y: 0.1 }}
      end={{ x: 0.15, y: 0.9 }}
      style={tw`flex-1`}
    >
      {/* Header */}
      <View style={tw`flex-row items-center px-4 py-3 mt-12`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={tw`text-white text-lg font-semibold ml-16`}>
          Chat with AI Assistant
        </Text>
      </View>
      {/* Chat Messages */}
      {/* <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 140}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={tw`px-4 pb-6`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        > */}

      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -55}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={tw`px-4 pb-6`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {chat.map((msg) =>
            msg.type === "user" ? (
              <View key={msg.id} style={tw`items-end mt-4`}>
                <View
                  style={[
                    tw`px-4 py-3 rounded-2xl`,
                    { backgroundColor: theme.colors.secondary },
                    { maxWidth: "80%" },
                  ]}
                >
                  <Text style={tw`text-white`}>{msg.text}</Text>
                </View>
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
                <View
                  style={[
                    tw`px-4 py-3 rounded-2xl`,
                    {
                      backgroundColor: "white",
                      maxWidth: "85%",
                    },
                  ]}
                >
                  <Text style={tw`text-black`}>{msg.text}</Text>
                </View>
              </View>
            )
          )}
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
                  tw`px-4 py-3 rounded-2xl`,
                  { backgroundColor: "white", maxWidth: "85%" },
                ]}
              >
                <ActivityIndicator size="small" color="#000" />
              </View>
            </View>
          )}
          {/* Number Selection Buttons */}
          {showNumberButtons && numberOptions.length > 0 && (
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
                  tw`p-3 rounded-2xl`,
                  { backgroundColor: "white", maxWidth: "85%" },
                ]}
              >
                <Text style={tw`text-black mb-2`}>Select a number:</Text>
                <View style={tw`flex-row flex-wrap`}>
                  {numberOptions.map((number, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNumberSelect(number)}
                      style={[styles.button, styles.submitButton, tw`m-1`]}
                    >
                      <Text style={styles.buttonText}>{number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
          {/* Selection Summary (non-interactive) */}
          {showSelectionSummary && hasSelectedNumber && (
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
                  tw`p-3 rounded-2xl`,
                  { backgroundColor: "white", maxWidth: "85%" },
                ]}
              >
                <Text style={tw`text-black mb-1`}>
                  Your selected number is:
                </Text>
                <Text style={tw`text-black font-semibold mb-2`}>
                  {selectedNumber}
                </Text>
                {selectedCustomerId ? (
                  <>
                    <Text style={tw`text-black mb-1`}>Customer ID:</Text>
                    <Text style={tw`text-black font-semibold`}>
                      {selectedCustomerId}
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
          )}
          {/* Plans Selection */}
          {showPlans && plans.length > 0 && (
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
                  tw`p-3 rounded-2xl`,
                  { backgroundColor: "white", maxWidth: "85%" },
                ]}
              >
                <Text style={tw`text-black mb-2`}>Select a plan:</Text>
                {plans.map((plan, index) => (
                  <TouchableOpacity
                    key={`${
                      plan.id || plan.planId || plan.name || "plan"
                    }-${index}`}
                    style={[tw`p-3 m-1 border border-gray-200 rounded-lg`]}
                    onPress={() => handlePlanSelect(plan)}
                  >
                    <Text style={tw`font-semibold`}>
                      {plan.name || plan.planName}
                    </Text>
                    <Text>${plan.price}/month</Text>
                    {plan.description && (
                      <Text style={tw`text-sm text-gray-600`}>
                        {plan.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        {/* Signup Form */}
        {showSignupForm && (
          <View style={styles.formContainer}>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={tw`text-black text-lg font-bold mb-3`}>
                Create Your Account
              </Text>
              <View style={tw`flex-row mb-2`}>
                <View style={tw`flex-1 mr-2`}>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.firstName && styles.inputError,
                    ]}
                    placeholder="First Name *"
                    placeholderTextColor="#999"
                    value={formData.firstName}
                    onChangeText={(text) => handleFormChange("firstName", text)}
                  />
                  {formErrors.firstName && (
                    <Text style={styles.errorText}>{formErrors.firstName}</Text>
                  )}
                </View>
                <View style={tw`flex-1`}>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.surname && styles.inputError,
                    ]}
                    placeholder="Surname *"
                    placeholderTextColor="#999"
                    value={formData.surname}
                    onChangeText={(text) => handleFormChange("surname", text)}
                  />
                  {formErrors.surname && (
                    <Text style={styles.errorText}>{formErrors.surname}</Text>
                  )}
                </View>
              </View>
              <View style={tw`mb-2`}>
                <TextInput
                  style={[styles.input, formErrors.email && styles.inputError]}
                  placeholder="Email *"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleFormChange("email", text)}
                />
                {formErrors.email && (
                  <Text style={styles.errorText}>{formErrors.email}</Text>
                )}
              </View>
              <View style={tw`mb-2`}>
                <TextInput
                  style={[styles.input, formErrors.phone && styles.inputError]}
                  placeholder="Phone (04XXXXXXXX) *"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => handleFormChange("phone", text)}
                />
                {formErrors.phone && (
                  <Text style={styles.errorText}>{formErrors.phone}</Text>
                )}
              </View>
              <View style={tw`mb-2`}>
                <TouchableOpacity
                  style={[
                    styles.input,
                    formErrors.dob && styles.inputError,
                    {
                      justifyContent: "center",
                      paddingVertical: 12,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: formData.dob ? "#000" : "#999" }}>
                    {formData.dob || "Date of Birth (YYYY-MM-DD) *"}
                  </Text>
                </TouchableOpacity>
                {formErrors.dob && (
                  <Text style={styles.errorText}>{formErrors.dob}</Text>
                )}
              </View>
              <View style={tw`mb-2`}>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.address && styles.inputError,
                  ]}
                  placeholder="Address *"
                  placeholderTextColor="#999"
                  value={formData.address}
                  onChangeText={(text) => handleFormChange("address", text)}
                />
                {formErrors.address && (
                  <Text style={styles.errorText}>{formErrors.address}</Text>
                )}
              </View>
              <View style={tw`flex-row mb-2`}>
                <View style={tw`flex-1 mr-2`}>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.suburb && styles.inputError,
                    ]}
                    placeholder="Suburb *"
                    placeholderTextColor="#999"
                    value={formData.suburb}
                    onChangeText={(text) => handleFormChange("suburb", text)}
                  />
                  {formErrors.suburb && (
                    <Text style={styles.errorText}>{formErrors.suburb}</Text>
                  )}
                </View>
                <View style={tw`w-1/4 mr-2`}>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.state && styles.inputError,
                    ]}
                    placeholder="State *"
                    placeholderTextColor="#999"
                    value={formData.state}
                    onChangeText={(text) => handleFormChange("state", text)}
                  />
                  {formErrors.state && (
                    <Text style={styles.errorText}>{formErrors.state}</Text>
                  )}
                </View>
                <View style={tw`w-1/4`}>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.postcode && styles.inputError,
                    ]}
                    placeholder="Postcode *"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={formData.postcode}
                    onChangeText={(text) => handleFormChange("postcode", text)}
                  />
                  {formErrors.postcode && (
                    <Text style={styles.errorText}>{formErrors.postcode}</Text>
                  )}
                </View>
              </View>
              <View style={tw`mb-3`}>
                <TextInput
                  style={[styles.input, formErrors.pin && styles.inputError]}
                  placeholder="4-digit PIN *"
                  placeholderTextColor="#999"
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={4}
                  value={formData.pin}
                  onChangeText={(text) => handleFormChange("pin", text)}
                />
                {formErrors.pin && (
                  <Text style={styles.errorText}>{formErrors.pin}</Text>
                )}
              </View>
              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowSignupForm(false)}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleFormSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
        {/* Payment Flow Components */}
        {showPayment && selectedPlan && (
          <View style={styles.formContainer}>
            <PaymentCard
              onTokenReceived={(token) => {
                setPaymentToken(token);
                setShowPayment(false);
                setShowSignupForm(false); // Add this line
                setShowTokenCard(true);
                console.log("[ChatAI] Token received from PaymentCard", token);
                handleSend("payment token received");
              }}
              onClose={() => {
                setShowPayment(false);
                setShowSignupForm(false); // Add this line
              }}
            />
          </View>
        )}
        {showTokenCard && paymentToken && (
          <View style={styles.formContainer}>
            <TokenCard
              token={paymentToken}
              onSuccess={(result) => {
                setShowTokenCard(false);
                setShowPaymentProcessCard(true);
                setPaymentToken(null);
                console.log("[ChatAI] Token step completed", result);
                handleSend("payment token confirmed");
              }}
              onClose={() => {
                setShowTokenCard(false);
                setShowPayment(true);
              }}
            />
          </View>
        )}
        {showPaymentProcessCard && selectedPlan && (
          <View style={styles.formContainer}>
            <PaymentProcessCard
              plan={selectedPlan}
              onProcessed={(result) => {
                console.log("[ChatAI] Payment process result", result);
                const messageToSend =
                  result?.message ||
                  (result?.success
                    ? "payment processed successfully"
                    : "payment failed");
                handleSend(messageToSend);
                // Ensure the selection summary card is hidden after processing
                setShowSelectionSummary(false);
              }}
              onClose={() => {
                setShowPaymentProcessCard(false);
                // Hide summary on close as well
                setShowSelectionSummary(false);
              }}
            />
          </View>
        )}
        {/* Message Input Area */}
        {/* <View
          style={[
            tw`flex-row items-center px-4 py-3 mb-12`,
            { backgroundColor: "rgba(255,255,255,0.05)" },
          ]}
        >
          <TextInput
            style={tw`flex-1 text-black px-4 py-2 rounded-full bg-white`}
            placeholder="What's on your mind?"
            placeholderTextColor="#000000"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
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
        </View> */}

        {!showSignupForm &&
          !showPayment &&
          !showTokenCard &&
          !showPaymentProcessCard && (
            <View
              style={[
                tw`flex-row items-center px-4 py-3 mb-12`,
                { backgroundColor: "rgba(255,255,255,0.05)" },
              ]}
            >
              <TextInput
                style={tw`flex-1 text-black px-4 py-2 rounded-full bg-white`}
                placeholder="What's on your mind?"
                placeholderTextColor="#000000"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={sendMessage}
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
      </KeyboardAvoidingView>
      {/* Date Picker */}
      {showDatePicker &&
        (Platform.OS === "android" ? (
          <DateTimePicker
            value={dobDateObj}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        ) : (
          <Modal transparent animationType="slide">
            <View style={tw`flex-1 justify-end bg-black/50`}>
              <View style={tw`bg-white rounded-t-2xl p-4`}>
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
        ))}
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  // formContainer: {
  //   position: "absolute",
  //   bottom: 70,
  //   left: 0,
  //   right: 0,
  //   maxHeight: 400,
  //   backgroundColor: "white",
  //   borderTopLeftRadius: 20,
  //   borderTopRightRadius: 20,
  //   padding: 16,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: -2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 8,
  //   elevation: 5,
  // },

  formContainer: {
    marginBottom: 80, // pushes it above the input bar
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignSelf: "center",
    width: "95%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 14,
    color: "#000",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
export default ChatScreen;
