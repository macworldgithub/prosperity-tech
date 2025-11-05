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

export const PaymentProcessCard = ({ onProcessed, onClose }) => {
  const [formData, setFormData] = useState({
    custNo: "526691",
    amount: "",
    paymentId: "",
    email: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.paymentId || !formData.email) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      console.log("[PaymentProcessCard] Processing payment", formData);
      // Simulate payment processing
      setTimeout(() => {
        Alert.alert("Success", "Payment processed successfully!");
        const result = { success: true, step: "payment_processed", message: "Payment processed successfully" };
        console.log("[PaymentProcessCard] Payment processed", result);
        onProcessed && onProcessed(result);
        onClose && onClose();
        setLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "Payment processing failed");
      const result = { success: false, step: "payment_failed", message: error?.message || "Payment processing failed" };
      console.log("[PaymentProcessCard] Payment failed", result);
      onProcessed && onProcessed(result);
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.container, tw`rounded-2xl p-4`]}>
      <Text style={[styles.title, tw`text-black font-semibold mb-3`]}>
        Process Payment
      </Text>

      <TextInput
        style={[styles.input, tw`mb-3`]}
        placeholder="Customer Number"
        value={formData.custNo}
        onChangeText={(text) => handleChange("custNo", text)}
        placeholderTextColor="#999"
      />

      <TextInput
        style={[styles.input, tw`mb-3`]}
        placeholder="Amount"
        value={formData.amount}
        onChangeText={(text) => handleChange("amount", text)}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <TextInput
        style={[styles.input, tw`mb-3`]}
        placeholder="Payment ID"
        value={formData.paymentId}
        onChangeText={(text) => handleChange("paymentId", text)}
        placeholderTextColor="#999"
      />

      <TextInput
        style={[styles.input, tw`mb-3`]}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        placeholderTextColor="#999"
      />

      <TextInput
        style={[styles.input, tw`mb-3`]}
        placeholder="Comment"
        value={formData.comment}
        onChangeText={(text) => handleChange("comment", text)}
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
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Submit Payment"}
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
