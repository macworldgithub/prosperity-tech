import React, { useState, useEffect } from "react";
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

export const PaymentProcessCard = ({
  custNo: propCustNo,
  amount: propAmount,
  email: propEmail,
  token,
  plan,
  onProcessed,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    custNo: propCustNo || "",
    amount: propAmount ? `${propAmount}` : "",
    paymentId: token || "", // Use token as initial paymentId
    email: propEmail || "",
    comment: `Plan: ${plan?.planName || plan?.name}`,
  });
  const [loading, setLoading] = useState(false);

  // Prefill on mount - this will update if props change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      custNo: propCustNo || "",
      amount: propAmount ? `${propAmount}` : "",
      paymentId: token || "", // Ensure token is set here
      email: propEmail || "",
      comment: `Plan: ${plan?.planName || plan?.name}`,
    }));
  }, [propCustNo, propAmount, propEmail, token, plan]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.paymentId || !formData.email) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      // Assume an API endpoint for processing payment; adjust if different
      // For now, using a placeholder /v1/payments/process - replace with actual if available
      const response = await fetch(`${API_BASE_URL}api/v1/payments/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("[PaymentProcessCard] Payment processing response", data);
      if (!response.ok) {
        throw new Error(data.message || "Payment processing failed");
      }

      const result = {
        success: true,
        message: "Payment processed successfully!",
      };
      Alert.alert("Success", result.message);
      onProcessed(result);
    } catch (error) {
      const result = {
        success: false,
        message: error.message || "Payment processing failed",
      };
      Alert.alert("Error", result.message);
      onProcessed(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, tw`rounded-2xl p-4`]}>
      <Text style={[styles.title, tw`text-black font-semibold mb-3`]}>
        Process Payment
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Customer Number"
        value={formData.custNo}
        onChangeText={(text) => handleChange("custNo", text)}
        placeholderTextColor="#999"
        // editable={false} // Prefilled - display only
        // selectTextOnFocus={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={formData.amount}
        onChangeText={(text) => handleChange("amount", text)}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Payment ID"
        value={formData.paymentId}
        onChangeText={(text) => handleChange("paymentId", text)}
        placeholderTextColor="#999"
        // editable={true} // Prefilled from token - display only
        // selectTextOnFocus={f}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Comment"
        value={formData.comment}
        onChangeText={(text) => handleChange("comment", text)}
        placeholderTextColor="#999"
      />

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
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Payment</Text>
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
    marginBottom: 12,
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
