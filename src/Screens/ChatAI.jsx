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
import { PaymentCard } from "../components/PaymentCard";
import { API_BASE_URL } from "../utils/config";
const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi there, I would be glad to help. How can I help?",
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
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentProcessCard, setShowPaymentProcessCard] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showPlans, setShowPlans] = useState(false);
  const [custNo, setCustNo] = useState(null);
  const [planNo, setPlanNo] = useState(null);
  const [selectedSim, setSelectedSim] = useState(null);
  const [submittedSignupDetails, setSubmittedSignupDetails] = useState(null);
  const [showSimTypeSelection, setShowSimTypeSelection] = useState(false);
  const [selectedSimType, setSelectedSimType] = useState(null);
  const [showPhysicalSimInput, setShowPhysicalSimInput] = useState(false);
  const [physicalSimNumber, setPhysicalSimNumber] = useState("");
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
  const isDetailsRequest = (text) => {
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes("first name") &&
      lowerText.includes("surname") &&
      lowerText.includes("email") &&
      lowerText.includes("phone") &&
      lowerText.includes("date of birth") &&
      lowerText.includes("address") &&
      lowerText.includes("suburb") &&
      lowerText.includes("state") &&
      lowerText.includes("postcode") &&
      lowerText.includes("pin")
    );
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
    // Construct full address as per desired payload
    const fullAddress = `${formData.address}, ${formData.suburb} ${formData.state} ${formData.postcode}, Australia`;
    const formatted = Object.entries({ ...formData, address: fullAddress })
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    try {
      // Store the form data with full address
      const formDataCopy = { ...formData, address: fullAddress };
      setSubmittedSignupDetails(formDataCopy);
      // Reset form data
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
      // Send the form data to chat
      await handleSend(formatted);
    } catch (error) {
      console.error("Form submission error:", error);
      Alert.alert("Error", "Failed to submit form. Please try again.");
    }
  };
  const handleSend = async (msgText, retryWithoutSession = false) => {
    if (!msgText.trim() || loading) return;
    const userMsg = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type: "user",
      text: msgText.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);
    try {
      let payload = {
        query: userMsg.text,
        brand: "Prosperity-tech",
      };
      if (!retryWithoutSession && sessionId) {
        payload.session_id = sessionId;
      }
      const token = await AsyncStorage.getItem("access_token");
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}chat/query`, {
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
      if (data?.custNo) {
        setCustNo(data.custNo);
      }
      const originalBotText =
        data?.message || data?.response || "Sorry, I couldn’t understand that.";
      let displayBotText = originalBotText;
      const lowerOriginal = originalBotText.toLowerCase();

      // Check for signup trigger and override message
      let triggerSignup = false;
      if (
        lowerOriginal.includes("please provide your first name") ||
        isDetailsRequest(originalBotText)
      ) {
        displayBotText =
          "Your information is required for signup. Please fill out the form below.";
        triggerSignup = true;
      }

      // Check for numbers trigger and override message
      const numbersMatch = originalBotText.match(/04\d{8}/g);
      let triggerNumbers = false;
      if (numbersMatch && numbersMatch.length === 5) {
        const numbers = extractNumbers(originalBotText);
        setNumberOptions(numbers);
        setShowNumberButtons(true);
        displayBotText = "Please select a number from these available numbers.";
        triggerNumbers = true;
      }

      // Check for plan trigger (when user sends a phone number)
      if (userMsg.text.match(/^04\d{8}$/)) {
        displayBotText = "Please select a plan from the available options.";
      }

      // Check for plan selection trigger
      if (userMsg.text.includes("select the plan")) {
        displayBotText = "Please choose your SIM type: e-SIM or Physical SIM.";
      }

      const botMsg = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: displayBotText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, botMsg]);

      // Handle native UI triggers based on bot response
      if (triggerSignup) {
        setShowSignupForm(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      let errorMsg = "Oops! Something went wrong. Please try again.";
      if (error.message.includes("Failed to fetch")) {
        errorMsg = "Network error. Please try again.";
      } else if (error.message.includes("401")) {
        errorMsg = "Session expired. Please log in again.";
      }
      const errorResponse = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: errorMsg,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, errorResponse]);
      // Retry without session if invalid
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
  const extractNumbers = (text) => {
    const matches = text.match(/04\d{8}/g);
    return matches || [];
  };
  const handleNumberSelect = async (number) => {
    setSelectedSim(number);
    setShowNumberButtons(false);
    await handleSend(number);
    // Fetch plans after number selection
    try {
      const plansResponse = await fetch(`${API_BASE_URL}api/v1/plans`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      if (!plansResponse.ok) {
        throw new Error("Failed to fetch plans");
      }
      const plansData = await plansResponse.json();
      setPlans(plansData.data || []);
      setShowPlans(true);
    } catch (plansError) {
      console.error("Error fetching plans:", plansError);
      const errorMsg = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: "bot",
        text: "Sorry, couldn't load plans. Please try again.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, errorMsg]);
    }
  };
  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    setPlanNo(String(plan.planNo || plan.id || "PLAN001"));
    setShowPlans(false);
    // Send selection to backend
    const planText = `I would like to select the plan: ${
      plan.planName || plan.name
    }`;
    await handleSend(planText);
    // Show SIM type selection
    setShowSimTypeSelection(true);
    // Scroll to bottom
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };
  const handleESimSelect = () => {
    setSelectedSimType("e-sim");
    setShowSimTypeSelection(false);
    setShowPayment(true);
  };
  const handlePhysicalSimSelect = () => {
    setSelectedSimType("physical");
    setShowSimTypeSelection(false);
    setShowPhysicalSimInput(true);
  };
  const handlePhysicalSimConfirm = () => {
    if (physicalSimNumber.length !== 13) {
      Alert.alert("Error", "Please enter a valid 13-digit SIM number.");
      return;
    }
    setShowPhysicalSimInput(false);
    setShowPayment(true);
  };
  const handleTokenReceived = async (token) => {
    setPaymentToken(token);
    setShowPayment(false);

    if (!custNo) {
      Alert.alert("Error", "Customer number not available");
      setShowPayment(true);
      return;
    }

    try {
      const payload = { custNo, paymentTokenId: token };
      const response = await fetch(`${API_BASE_URL}api/v1/payments/methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add payment method");
      }

      const paymentId = data.data?.paymentId;
      setPaymentToken(paymentId);
      await handleSend("Payment method successfully added!");
      setShowPaymentProcessCard(true);
    } catch (error) {
      console.error("Token submission error:", error);
      Alert.alert("Error", error.message || "Failed to process token");
      setShowPayment(true);
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
  const handleActivateOrder = async () => {
    try {
      // Construct full address from submitted details
      const fullAddress = `${submittedSignupDetails?.address || ""}, ${
        submittedSignupDetails?.suburb || ""
      } ${submittedSignupDetails?.state || ""} ${
        submittedSignupDetails?.postcode || ""
      }, Australia`;
      const payload = {
        number: selectedSim || "", // Now filled with selected number (was empty)
        cust: {
          custNo: custNo || "",
          address: fullAddress.trim(), // Full constructed address
          suburb: submittedSignupDetails?.suburb || "",
          postcode: submittedSignupDetails?.postcode || "",
          email: submittedSignupDetails?.email || "",
        },
        planNo: String(planNo || ""),
        simNo: selectedSimType === "physical" ? physicalSimNumber : "", // Set simNo for physical SIM
      };
      console.log("Activation payload:", payload);
      const response = await fetch(`${API_BASE_URL}api/v1/orders/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("Activation result:", result);
      if (response.ok) {
        await handleSend("Order successfully activated!");
      } else {
        await handleSend(
          `Activation failed: ${result.message || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Activation failed", err);
      await handleSend("Order activation failed. Please try again.");
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
          Chat with AI
        </Text>
      </View>
      {/* <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 140}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={tw`px-4 pb-6`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                <Text style={tw`text-black`}>Typing...</Text>
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
                <View style={tw`flex-row flex-wrap justify-center`}>
                  {numberOptions.map((num, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNumberSelect(num)}
                      style={[styles.button, styles.submitButton, tw`m-1`]}
                    >
                      <Text style={styles.buttonText}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                <View style={tw`flex-row flex-wrap justify-center`}>
                  {plans.map((plan, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handlePlanSelect(plan)}
                      style={[styles.button, styles.submitButton, tw`m-1 mb-2`]}
                    >
                      <Text style={[styles.buttonText, tw`text-center`]}>
                        {plan.planName} - ${plan.price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
        {/* Signup Form */}
        {showSignupForm && (
          <View style={styles.formContainer}>
            <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled={true}>
              <Text style={tw`text-black text-lg font-bold mb-3`}>
                Provide Your Details
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
                    <Text style={styles.buttonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
        {/* SIM Type Selection */}
        {showSimTypeSelection && (
          <View style={styles.formContainer}>
            <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled={true}>
              <Text style={tw`text-black text-lg font-bold mb-3`}>
                Choose SIM Type
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.submitButton, tw`mb-3`]}
                onPress={handleESimSelect}
              >
                <Text style={styles.buttonText}>e-SIM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handlePhysicalSimSelect}
              >
                <Text style={styles.buttonText}>Physical SIM</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        {/* Physical SIM Input */}
        {showPhysicalSimInput && (
          <View style={styles.formContainer}>
            <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled={true}>
              <Text style={tw`text-black text-lg font-bold mb-3`}>
                Enter your 13-digit Physical SIM Number
              </Text>
              <TextInput
                style={styles.input}
                placeholder="13-digit SIM Number"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={13}
                value={physicalSimNumber}
                onChangeText={setPhysicalSimNumber}
              />
              <TouchableOpacity
                style={[styles.button, styles.submitButton, tw`mt-3`]}
                onPress={handlePhysicalSimConfirm}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        {/* Payment Flow Components */}
        {showPayment && selectedPlan && (
          <View style={styles.formContainer}>
            <PaymentCard
              onTokenReceived={handleTokenReceived}
              onClose={() => {
                setShowPayment(false);
                setShowPlans(true);
              }}
            />
          </View>
        )}
        {showPaymentProcessCard && selectedPlan && submittedSignupDetails && (
          <View style={styles.formContainer}>
            <PaymentProcessCard
              custNo={custNo}
              amount={selectedPlan.price}
              email={submittedSignupDetails.email}
              token={paymentToken} // This will now contain the paymentId from the API response
              plan={selectedPlan}
              onProcessed={async (result) => {
                handleSend(
                  result?.message ||
                    (result?.success
                      ? "Payment processing completed!"
                      : "Payment failed")
                );
                if (result?.success) {
                  await handleActivateOrder();
                }
                setShowPaymentProcessCard(false);
              }}
              onClose={() => {
                setShowPaymentProcessCard(false);
                handleSend("Payment processing completed!");
                handleActivateOrder();
              }}
            />
          </View>
        )}
        {/* Message Input Area */}
        {!showSignupForm &&
          !showPayment &&
          !showPaymentProcessCard &&
          !showSimTypeSelection &&
          !showPhysicalSimInput && (
            <View
              style={[
                tw`flex-row items-center px-4 py-3 mb-12`,
                { backgroundColor: "rgba(255,255,255,0.05)" },
              ]}
            >
              <TextInput
                style={tw`flex-1 text-black px-4 py-2 rounded-full bg-white`}
                placeholder="Message..."
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
                <TouchableOpacity onPress={sendMessage} disabled={loading}>
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
  formContainer: {
    marginBottom: 80,
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
    backgroundColor: "#10B981",
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
