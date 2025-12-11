// screens/OrderDetail.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "tailwind-react-native-classnames";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/config";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const OrderDetail = () => {
  const navigation = useNavigation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  const fetchOrderDetail = async (id) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}api/v1/orders/${id}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(response.data.data.orderQueryResponse);
    } catch (error) {
      console.error("Order detail error:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOrderId = async () => {
      const savedId = await AsyncStorage.getItem("currentOrderId");
      if (savedId) {
        setOrderId(savedId);
        fetchOrderDetail(savedId);
        // Optional: clear kar do taaki dobara na aaye
        // await AsyncStorage.removeItem("currentOrderId");
      } else {
        Alert.alert("Error", "Order ID not found");
        navigation.goBack();
      }
    };

    loadOrderId();
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMMITTED":
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "IN_PROG":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDisplayServiceName = (name) => {
    if (name === "SimplyBig Unlimited") {
      return "Belar";
    }
    return name || "N/A";
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={tw`mt-4 text-gray-600`}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <Text style={tw`text-lg text-gray-600`}>Order not found</Text>
      </SafeAreaView>
    );
  }

  const item =
    order.orderItems?.wmePortInReqItem || order.orderItems?.wmeNewReqItem || {};

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View
        style={tw`bg-white px-4 py-5 border-b border-gray-200 flex-row items-center`}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text style={tw`text-xl font-bold text-black`}>Order Details</Text>
          <Text style={tw`text-sm text-gray-500`}>#{order.orderId}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={tw`pb-8`}>
        {/* Same UI as before */}
        <View
          style={tw`mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-200`}
        >
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-lg font-bold`}>Current Status</Text>
            <View
              style={tw`px-4 py-2 rounded-full ${getStatusColor(
                order.internalStatus
              )}`}
            >
              <Text style={tw`font-bold text-sm`}>
                {order.internalStatus === "REJECTED"
                  ? "FAILED"
                  : order.internalStatus}
              </Text>
            </View>
          </View>

          {order.internalStatus === "REJECTED" && (
            <View style={tw`bg-red-50 p-4 rounded-xl mt-3`}>
              <Text style={tw`text-red-800 font-semibold`}>
                Activation Failed
              </Text>
              <Text style={tw`text-red-700 text-sm mt-1`}>
                Error: Received Null Response
              </Text>
            </View>
          )}
        </View>

        {/* Service Details */}
        <View
          style={tw`mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-200`}
        >
          <Text style={tw`text-lg font-bold mb-4`}>Service Details</Text>
          <View style={tw``}>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-500`}>Mobile</Text>
              <Text style={tw`font-bold`}>{item.msn || "N/A"}</Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-500`}>Plan Name</Text>
              <Text style={tw`font-medium text-black`}>
                {getDisplayServiceName(order.planName || "SimplyBig Unlimited")}
              </Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-500`}>SIM Type</Text>
              <Text style={tw`font-bold text-green-600`}>
                {item.isEsim ? "eSIM" : "Physical SIM"}
              </Text>
            </View>
            {item.simNo && (
              <View style={tw`flex-row justify-between`}>
                <Text style={tw`text-gray-500`}>SIM No</Text>
                <Text style={tw`font-bold`}>{item.simNo}</Text>
              </View>
            )}
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-500`}>Type</Text>
              <Text style={tw`font-medium`}>
                {order.action === "ADD_WME_PORT" ? "Port In" : "New Activation"}
              </Text>
            </View>
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-500`}>Created</Text>
              <Text style={tw`font-medium`}>
                {formatDateTime(order.createdOn)}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline – same as before */}
        {/* ... baaki timeline code same rahega */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetail;
