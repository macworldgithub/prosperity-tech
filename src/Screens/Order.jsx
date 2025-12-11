import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "tailwind-react-native-classnames";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/config";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";

const Order = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customerNo, setCustomerNo] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userData = await AsyncStorage.getItem("userData");
      let custNo = customerNo;

      if (!custNo && userData) {
        const parsed = JSON.parse(userData);
        custNo = parsed?.customer?.custNo || parsed?.custNo;
      }

      if (!custNo) {
        const meRes = await axios.get(`${API_BASE_URL}user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        custNo = meRes.data.customer.custNo;
        setCustomerNo(custNo);
      }

      const response = await axios.get(
        `${API_BASE_URL}api/v1/customers/${custNo}/orders`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "FAILED":
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderTypeText = (type) => {
    switch (type) {
      case "PORT_IN":
        return "Port In Request";
      case "NEW_ACTIVATION":
        return "New Activation";
      case "PLAN_CHANGE":
        return "Plan Change";
      default:
        return type?.replace(/_/g, " ") || "Unknown";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white justify-center items-center`}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={tw`mt-4 text-gray-600`}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }
  const getDisplayServiceName = (name) => {
    if (name === "SimplyBig Unlimited") {
      return "Belar";
    }
    return name || "N/A";
  };
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View
        style={tw`bg-white px-4 py-5 border-b border-gray-200 flex-row items-center`}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text style={tw`text-xl font-bold text-black`}>My Orders</Text>
          <Text style={tw`text-sm text-gray-500`}>
            Track your service requests
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={tw`pb-6`}
      >
        {orders.length === 0 ? (
          <View style={tw`flex-1 justify-center items-center mt-20`}>
            <Text style={tw`text-xl text-gray-500`}>No orders found</Text>
            <Text style={tw`text-gray-400 mt-2`}>
              Your active and past orders will appear here
            </Text>
          </View>
        ) : (
          <View style={tw`px-4 pt-4`}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order._id}
                onPress={async () => {
                  await AsyncStorage.setItem(
                    "currentOrderId",
                    order.orderId.toString()
                  );

                  navigation.navigate("OrderDetail");
                }}
                style={tw`bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-200`}
              >
                {/* Header: Order ID + Status */}
                <View style={tw`flex-row justify-between items-start mb-3`}>
                  <View>
                    <Text style={tw`text-lg font-bold text-black`}>
                      Order #{order.orderId}
                    </Text>
                    <Text style={tw`text-sm text-gray-500`}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <View
                    style={tw`px-3 py-1 rounded-full border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <Text style={tw`text-xs font-semibold`}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                {/* Order Type */}
                <View style={tw`mb-3`}>
                  <Text style={tw`text-sm text-gray-600 font-medium`}>
                    {getOrderTypeText(order.orderType)}
                  </Text>
                </View>

                {/* Details Grid */}
                <View style={tw``}>
                  {order.msn && (
                    <View style={tw`flex-row`}>
                      <Text style={tw`text-gray-500 w-24`}>Mobile:</Text>
                      <Text style={tw`font-medium text-black`}>
                        {order.msn}
                      </Text>
                    </View>
                  )}

                  {order.planNo && (
                    <View style={tw`flex-row`}>
                      <Text style={tw`text-gray-500 w-24`}>Plan Name:</Text>
                      <Text style={tw`font-medium text-black`}>
                        {getDisplayServiceName(
                          order.planName || "SimplyBig Unlimited"
                        )}
                      </Text>
                    </View>
                  )}
                  {order.isEsim && (
                    <View style={tw`flex-row items-center`}>
                      <Text style={tw`text-gray-500 w-24`}>SIM Type:</Text>
                      <Text style={tw`font-medium text-green-600`}>eSIM</Text>
                    </View>
                  )}

                  <View style={tw`flex-row`}>
                    <Text style={tw`text-gray-500 w-24`}>Address:</Text>
                    <Text style={tw`font-medium text-black flex-1`}>
                      {order.address || `${order.suburb}, ${order.postcode}`}
                    </Text>
                  </View>
                </View>

                {/* Footer Action Hint */}
                {order.status === "PENDING" && (
                  <View style={tw`mt-4 pt-4 border-t border-gray-100`}>
                    <Text style={tw`text-xs text-gray-500`}>
                      This order is being processed. You'll receive an email
                      once completed.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Order;
