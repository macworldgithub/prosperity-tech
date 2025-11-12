import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { API_BASE_URL } from "../utils/config";

export const TokenCard = ({ token, custNo, onSuccess, onClose }) => {
  const [inputToken, setInputToken] = useState(token || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    console.log("[DEBUG] handleSubmit called"); // Debug: Function entry
    if (!inputToken.trim()) {
      console.log("[DEBUG] Empty token check failed"); // Debug: Validation fail
      Alert.alert("Error", "Please enter the token");
      return;
    }
    console.log("[DEBUG] Token validation passed"); // Debug: After validation

    setLoading(true);
    setMessage("");
    console.log("[DEBUG] Loading set to true"); // Debug: State change

    try {
      console.log("[DEBUG] Entering try block"); // Debug: Try entry
      const payload = { custNo, paymentTokenId: inputToken };
      console.log("[DEBUG] Payload created:", payload); // Enhanced: More visible prefix
      console.log("[TokenCard] API Payload:", payload); // Original log

      console.log("[DEBUG] About to fetch API"); // Debug: Before fetch
      const response = await fetch(`${API_BASE_URL}api/v1/payments/methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("[DEBUG] Fetch completed, status:", response.status); // Debug: After fetch

      console.log("[DEBUG] About to parse JSON"); // Debug: Before json()
      const data = await response.json();
      console.log("[DEBUG] JSON parsed"); // Debug: After json()
      console.log("[TokenCard] API Response:", data); // Original log

      if (!response.ok) {
        console.log("[DEBUG] Response not OK, throwing error"); // Debug: Error case
        throw new Error(data.message || "Failed to add payment method");
      }

      console.log(
        "[DEBUG] Success - calling onSuccess with paymentId:",
        data.data?.paymentId
      );
      Alert.alert("Success", "Payment method added successfully!");
      onSuccess(data.data?.paymentId);
    } catch (error) {
      console.log("[DEBUG] Entering catch block"); // Debug: Catch entry
      const errorMsg = error.message || "Something went wrong";
      setMessage(`Card not added: ${errorMsg}`);
      console.error("[TokenCard] API Error:", error); // Original error log
      Alert.alert("Error", errorMsg);
    } finally {
      console.log("[DEBUG] Finally block - setting loading false"); // Debug: Finally
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, tw`rounded-2xl p-4`]}>
      <Text style={[styles.title, tw`text-black font-semibold mb-3`]}>
        Confirm Payment Token
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter payment token"
        value={inputToken}
        onChangeText={setInputToken}
        placeholderTextColor="#999"
        editable={!loading}
      />

      {message ? <Text style={styles.errorText}>{message}</Text> : null}

      <View style={tw`flex-row justify-between mt-4`}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, tw`flex-1 mr-2`]}
          onPress={onClose}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, tw`flex-1 ml-2`]}
          onPress={handleSubmit}
          disabled={loading || !inputToken.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Token</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 14,
  },
});
