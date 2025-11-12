import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";
import Icon from "react-native-vector-icons/Feather";
import { API_BASE_URL } from "../utils/config";
import { theme } from "../utils/theme";
import axios from "axios";
import { PaymentCard } from "../components/PaymentCard";
import { TokenCard } from "../components/TokenCard";
import { PaymentProcessCard } from "../components/PaymentProcessCard";

export default function PlansScreen() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [customer, setCustomer] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { customerNo } = route.params || {};

  // Payment flow states
  const [showPayment, setShowPayment] = useState(false);
  const [showTokenCard, setShowTokenCard] = useState(false);
  const [showPaymentProcessCard, setShowPaymentProcessCard] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Add this useEffect to debug the incoming params
  useEffect(() => {
    console.log("Customer No from params:", customerNo);
    console.log("Current plan:", currentPlan);
    console.log("All plans:", plans);
  }, [customerNo, currentPlan, plans]);

  const fetchCustomerDetails = async (customerNo) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}api/v1/customers/${customerNo}`
      );
      return response.data?.data;
    } catch (err) {
      console.error("Error fetching customer details:", err);
      return null;
    }
  };

  const fetchCurrentPlan = async (customerNo) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}api/v1/customers/${customerNo}/services`,
        { headers: { accept: "application/json" } }
      );
      const service = response.data?.data?.services?.serviceDetails?.[0];
      if (service) {
        setCurrentPlan({
          planNo: service.planNo,
          planName: service.planName,
        });
      }
      return service?.planNo;
    } catch (error) {
      console.error("Error fetching current plan:", error);
      return null;
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      // First, get the current plan using customer number
      const currentPlanNo = await fetchCurrentPlan(customerNo);
      // Fetch customer details
      const customerDetails = await fetchCustomerDetails(customerNo);
      setCustomer(customerDetails);
      // Then fetch all plans from the new API
      const response = await axios.get(`${API_BASE_URL}api/v1/plans`, {
        headers: { accept: "*/*" },
      });
      if (response.data?.data) {
        // Filter active plans
        const activePlans = response.data.data.filter(
          (plan) => plan.isActive === true
        );
        setPlans(activePlans);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Failed to load plans. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handlePlanUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handleTokenReceived = (token) => {
    setPaymentToken(token);
    setShowPayment(false);
    setShowTokenCard(true);
  };

  const handlePaymentMethodAdded = (paymentId) => {
    setPaymentToken(paymentId);
    setShowTokenCard(false);
    setShowPaymentProcessCard(true);
  };

  const handlePaymentProcessed = async (result) => {
    setShowPaymentProcessCard(false);
    if (result?.success && selectedPlan) {
      try {
        const response = await axios.patch(
          `${API_BASE_URL}api/v1/plans/${selectedPlan.planNo}`,
          {},
          {
            headers: {
              accept: "*/*",
              "Content-Type": "application/json",
            },
          }
        );
        const updateData = response.data?.data;
        console.log("Plan update response data:", updateData);
        if (updateData) {
          setCurrentPlan({
            planNo: updateData.planNo,
            planName: updateData.planName,
          });
          Alert.alert(
            "Success",
            `Plan updated successfully! New Plan: ${updateData.planName} (No: ${updateData.planNo})`
          );
          // Refresh to update UI
          fetchPlans();
        }
      } catch (err) {
        console.error("Error updating plan:", err);
        Alert.alert(
          "Error",
          "Payment successful but plan update failed. Please contact support."
        );
      }
    } else {
      Alert.alert("Error", result?.message || "Payment failed");
    }
  };

  const renderPlanItem = ({ item }) => {
    const isCurrentPlan =
      currentPlan && item.planNo.toString() === currentPlan.planNo.toString();
    return (
      <View
        style={[
          styles.planCard,
          isCurrentPlan && styles.currentPlan,
          isCurrentPlan && styles.disabledPlan,
        ]}
      >
        <View style={tw`flex-1`}>
          <View style={tw`flex-row justify-between items-start`}>
            <Text
              style={[
                tw`text-lg font-semibold`,
                isCurrentPlan && { color: theme.colors.primary },
              ]}
            >
              {item.planName}
            </Text>
            {isCurrentPlan && (
              <View style={styles.currentBadge}>
                <Text style={tw`text-white text-xs font-medium`}>
                  Current Plan
                </Text>
              </View>
            )}
          </View>
          <View style={tw`mt-2`}>
            <Text style={tw`text-gray-600 text-sm`}>
              Plan No: {item.planNo}
            </Text>
            <Text style={tw`text-gray-500 text-sm`}>
              Group: {item.groupName} ({item.groupNo})
            </Text>
            <Text style={tw`text-gray-500 text-sm`}>
              Network: {item.network}
            </Text>
            <Text style={tw`text-gray-500 text-sm`}>
              Usage Type: {item.usageType}
            </Text>
            <Text style={tw`text-gray-500 text-sm font-medium`}>
              Price: ${item.price?.toFixed(2)}
            </Text>
          </View>
        </View>
        {!isCurrentPlan ? (
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handlePlanUpgrade(item)}
          >
            <Text style={tw`text-white font-medium`}>Upgrade</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.upgradeButton, { backgroundColor: "#e5e7eb" }]}>
            <Text style={tw`text-gray-500 font-medium`}>Current Plan</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[tw`flex-1 bg-gray-50`, styles.container]}>
        <View style={tw`p-4 border-b border-gray-200 bg-white`}>
          <Text style={tw`text-xl font-bold`}>Available Plans</Text>
        </View>
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={tw`mt-4 text-gray-600`}>Loading plans...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1 bg-gray-50`, styles.container]}>
      <View style={tw`p-4 border-b border-gray-200 bg-white`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mr-4`}
          >
            <Icon name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={tw`text-xl font-bold text-gray-900`}>
            Available Plans
          </Text>
        </View>
      </View>
      {error ? (
        <View style={tw`flex-1 justify-center items-center p-6`}>
          <Icon
            name="alert-circle"
            size={48}
            color={theme.colors.danger}
            style={tw`mb-4`}
          />
          <Text style={tw`text-center text-gray-700 text-base mb-6`}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchPlans}
            style={[styles.retryButton, { borderColor: theme.colors.primary }]}
          >
            <Text style={[tw`font-medium`, { color: theme.colors.primary }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-10`}
        >
          {currentPlan && (
            <View
              style={[
                tw`mx-4 my-3 p-4 rounded-xl`,
                {
                  backgroundColor: "white",
                  borderWidth: 1.5,
                  borderColor: theme.colors.primary,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
            >
              <Text style={[tw`text-base font-semibold text-gray-900 mb-1`]}>
                Current Plan
              </Text>
              <Text style={[tw`text-lg font-bold text-blue-600`]}>
                {currentPlan.planName}
              </Text>
              <Text style={tw`text-gray-700 text-sm mt-1`}>
                Plan No: {currentPlan.planNo}
              </Text>
              <Text style={tw`text-gray-500 text-sm`}>
                Usage Type:{" "}
                {plans.find(
                  (p) => p.planNo.toString() === currentPlan.planNo.toString()
                )?.usageType || "N/A"}
              </Text>
            </View>
          )}
          <FlatList
            data={plans.filter(
              (p) => p.planNo.toString() !== currentPlan?.planNo?.toString()
            )}
            renderItem={renderPlanItem}
            keyExtractor={(item) => item._id || item.planNo.toString()}
            contentContainerStyle={tw`p-4`}
            scrollEnabled={false}
          />
        </ScrollView>
      )}

      {/* Payment Modals */}
      <Modal
        visible={showPayment}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPayment(false)}
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <View style={tw`p-4 border-b border-gray-200`}>
            <View style={tw`flex-row items-center justify-between`}>
              <TouchableOpacity onPress={() => setShowPayment(false)}>
                <Icon
                  name="arrow-left"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <Text style={tw`text-xl font-bold`}>Enter Card Details</Text>
              <View style={tw`w-6`} />
            </View>
          </View>
          <View style={tw`flex-1 p-4`}>
            {selectedPlan && (
              <PaymentCard
                onTokenReceived={handleTokenReceived}
                onClose={() => setShowPayment(false)}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showTokenCard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTokenCard(false)}
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <View style={tw`p-4 border-b border-gray-200`}>
            <View style={tw`flex-row items-center justify-between`}>
              <TouchableOpacity onPress={() => setShowTokenCard(false)}>
                <Icon
                  name="arrow-left"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <Text style={tw`text-xl font-bold`}>Confirm Token</Text>
              <View style={tw`w-6`} />
            </View>
          </View>
          <View style={tw`flex-1 p-4`}>
            {selectedPlan && customerNo && (
              <TokenCard
                token={paymentToken}
                custNo={customerNo}
                onSuccess={handlePaymentMethodAdded}
                onClose={() => setShowTokenCard(false)}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showPaymentProcessCard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentProcessCard(false)}
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <View style={tw`p-4 border-b border-gray-200`}>
            <View style={tw`flex-row items-center justify-between`}>
              <TouchableOpacity
                onPress={() => setShowPaymentProcessCard(false)}
              >
                <Icon
                  name="arrow-left"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <Text style={tw`text-xl font-bold`}>Process Payment</Text>
              <View style={tw`w-6`} />
            </View>
          </View>
          <View style={tw`flex-1 p-4`}>
            {selectedPlan && customer && customerNo && (
              <PaymentProcessCard
                custNo={customerNo}
                amount={selectedPlan.price}
                email={customer.email}
                token={paymentToken}
                plan={selectedPlan}
                onProcessed={handlePaymentProcessed}
                onClose={() => setShowPaymentProcessCard(false)}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  planCard: [
    tw`bg-white p-5 rounded-xl mb-4 border border-gray-200`,
    {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  ],
  currentPlan: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: "rgba(59, 130, 246, 0.03)",
  },
  disabledPlan: {
    opacity: 0.7,
  },
  currentBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  upgradeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
};
