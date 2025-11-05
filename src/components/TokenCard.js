import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import tw from "tailwind-react-native-classnames";

export const TokenCard = ({ token, onSuccess, onClose }) => {
  const [inputToken, setInputToken] = useState(token);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!inputToken.trim()) {
      Alert.alert("Error", "Please enter the token");
      return;
    }

    setLoading(true);

    try {
      console.log("[TokenCard] Submitting token to backend flow", inputToken);
      // Simulate API call to add payment method
      setTimeout(() => {
        Alert.alert("Success", "Payment method added successfully!");
        const result = { success: true, step: "token_confirmed", token: inputToken };
        console.log("[TokenCard] Token confirmed", result);
        onSuccess && onSuccess(result);
        setLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert("Error", "Failed to add payment method");
      console.log("[TokenCard] Token submission failed", error?.message || error);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, tw`rounded-2xl p-4`]}>
      <Text style={[styles.title, tw`text-black font-semibold mb-3`]}>
        Confirm Payment Token
      </Text>

      <TextInput
        style={[styles.input, tw`mb-3`]}
        placeholder="Enter payment token"
        value={inputToken}
        onChangeText={setInputToken}
        placeholderTextColor="#999"
      />

      <View style={tw`flex-row justify-between`}>
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
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "Submit Token"}
          </Text>
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
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: "#2bb673",
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
