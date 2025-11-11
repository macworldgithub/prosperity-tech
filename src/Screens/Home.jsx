import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "tailwind-react-native-classnames";
import { Bell, ArrowRight, FileText, MapPin, Wifi } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { theme } from "../utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import axios from "axios";
import { API_BASE_URL } from "../utils/config";

export default function Home() {
  const navigation = useNavigation();
  // 🔹 Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [user, setUser] = useState({
    name: "John Doe",
    accountId: "ACC12345",
    serviceAddress: "123 Main St, Anytown, ST 12345",
    plan: "Premium 5G Plan",
    speed: "Up to 100 Mbps",
    status: "Active",
    expiry: "June 15, 2024",
    dataUsed: 8.5,
    dataLimit: 15,
    bill: 50.0,
    dueDate: "May 15, 2024",
    disputeNotice: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }
        const response = await axios.get(`${API_BASE_URL}user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { user, customer } = response.data;
        // Merge relevant fields
        setUser({
          name: user.name || customer.firstName,
          email: user.email,
          accountId: customer.custNo,
          serviceAddress: customer.address || user.street,
          plan: "N/A",
          speed: "N/A",
          category_status_customer: customer.category_status_customer || "N/A",
          expiry: "N/A",
          dataUsed: 0,
          dataLimit: 0,
          bill: 0,
          dueDate: "N/A",
          disputeNotice: false,
        });
        setLoading(false);
        if (customer.custNo) {
          fetchServiceData(customer.custNo);
          fetchBalance(customer.custNo);
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchServiceData = async (custNo) => {
    try {
      setServiceLoading(true);
      const response = await axios.get(
        `https://bele.omnisuiteai.com/api/v1/customers/${custNo}/services`,
        { headers: { accept: "application/json" } }
      );
      const service = response.data?.data?.services?.serviceDetails?.[0];
      setServiceData(service || null);
    } catch (err) {
      console.error("Service fetch error:", err);
    } finally {
      setServiceLoading(false);
    }
  };

  const fetchBalance = async (custNo) => {
    try {
      setBalanceLoading(true);
      const response = await axios.get(
        `https://bele.omnisuiteai.com/api/v1/customers/${custNo}/balance`,
        { headers: { accept: "application/json" } }
      );
      setBalance(response.data?.data || null);
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const percentageUsed =
    user.dataLimit > 0 ? Math.round((user.dataUsed / user.dataLimit) * 100) : 0;
  const remainingData =
    user.dataLimit > 0 ? (user.dataLimit - user.dataUsed).toFixed(1) : 0;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("DATA", data);
      console.log("TYPE", data.type);
      if (data.type === "token") {
        setShowPaymentModal(false);
        Alert.alert("Payment Token", `Token: ${data.token}`);
      } else if (data.type === "error") {
        Alert.alert("Payment Error", data.message);
      }
    } catch (err) {
      console.log("Non-JSON message:", event.nativeEvent.data);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView
        contentContainerStyle={tw`pb-6`}
        showsVerticalScrollIndicator={false}
        style={tw`flex-1 px-4 pt-4`}
      >
        {/* Header */}
        {/* <View style={tw`flex-row items-center py-4 mb-4`}>
          <View style={tw`w-12 h-12 bg-gray-300 rounded-full`} />
          <View style={tw`ml-3`}>
            <Text style={tw`text-black font-bold`}>Welcome</Text>
            <Text style={tw`text-sm text-gray-400`}>{user.name}</Text>
          </View>
          <View style={tw`ml-auto flex-row`}>
            <Bell size={24} color="black" style={tw`mr-4`} />
            <Icon
              name="log-out"
              size={22}
              color="black"
              onPress={async () => {
                Alert.alert(
                  "Confirm Logout",
                  "Are you sure you want to log out?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Logout",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await AsyncStorage.multiRemove([
                            "userData",
                            "access_token",
                            "lastEmail",
                            "lastPin",
                          ]);
                          navigation.reset({
                            index: 0,
                            routes: [{ name: "Login" }],
                          });
                        } catch (error) {
                          console.error("Error clearing AsyncStorage:", error);
                        }
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View> */}
        <View style={tw`flex-row items-center py-4 mb-4`}>
          {/* <View style={tw`w-12 h-12 bg-gray-300 rounded-full`} /> */}
          <View style={tw`ml-3`}>
            <Text style={tw`text-black font-bold`}>Welcome</Text>
            {loading && <Text style={tw`text-gray-500`}>Loading...</Text>}
            {error && <Text style={tw`text-red-500`}>Error: {error}</Text>}
            {user && (
              <View>
                <Text style={tw`text-base text-black font-semibold`}>
                  {user.name}
                </Text>
                <Text style={tw`text-sm text-gray-500`}>{user.email}</Text>
              </View>
            )}
          </View>
          <View style={tw`ml-auto flex-row`}>
            {/* <Bell size={24} color="black" style={tw`mr-4`} /> */}
            <Icon
              name="log-out"
              size={22}
              color="black"
              onPress={async () => {
                Alert.alert(
                  "Confirm Logout",
                  "Are you sure you want to log out?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Logout",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await AsyncStorage.removeItem("userData");
                          await AsyncStorage.removeItem("access_token");
                          await AsyncStorage.removeItem("lastEmail");
                          await AsyncStorage.removeItem("lastPin");
                          navigation.reset({
                            index: 0,
                            routes: [{ name: "Login" }],
                          });
                        } catch (error) {
                          console.error("Error clearing AsyncStorage:", error);
                        }
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            />
          </View>
        </View>
        {/* Account Overview */}
        <View
          style={tw`bg-white mx-2 p-4 rounded-xl border border-gray-200 mb-4`}
        >
          <Text style={tw`font-semibold mb-2`}>Account Overview</Text>
          <View style={tw`flex-row justify-between`}>
            <View>
              <Text style={tw`text-gray-500`}>Account ID</Text>
              <Text style={tw`font-bold text-green-600`}>{user.accountId}</Text>
              <Text style={tw`text-gray-500 mt-2`}>Status</Text>
              <Text
                style={tw`text-green-600 font-medium border border-green-600 bg-green-50 rounded-full px-3 py-1 -ml-2`}
              >
                {user.category_status_customer || user.status || "N/A"}
              </Text>

              {/* <Text style={tw`text-gray-400 text-xs mt-1`}>
                Expires {user.expiry}
              </Text> */}
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`text-gray-500`}>Service Address</Text>
              <Text style={tw`text-right font-medium text-black w-36`}>
                {user.serviceAddress}
              </Text>
            </View>
          </View>
        </View>
        {/* Data Usage */}
        <View
          style={tw`bg-white mx-2 p-4 rounded-xl border border-gray-200 mb-4`}
        >
          <Text style={tw`font-semibold mb-2`}>Data Usage</Text>
          <Text style={tw`text-black`}>
            This Month: {user.dataUsed} / {user.dataLimit} GB
          </Text>
          <View style={tw`w-full bg-gray-200 h-2 rounded-full mt-2`}>
            <View
              style={[
                tw`h-2 rounded-full`,
                {
                  backgroundColor: theme.colors.secondary,
                  width: `${percentageUsed}%`,
                },
              ]}
            />
          </View>
          <View style={tw`flex-row justify-between mt-2`}>
            <Text style={tw`text-gray-500`}>{percentageUsed}% used</Text>
            <Text style={tw`text-gray-500`}>{remainingData} GB remaining</Text>
          </View>
        </View>
        {/* Current Plan */}
        <View
          style={tw`bg-white mx-2 p-4 rounded-xl border border-gray-200 mb-4`}
        >
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`font-semibold`}>Current Plan</Text>
            <TouchableOpacity
              // In Home.jsx - update the onPress handler
              // In Home.jsx, update the onPress handler
              onPress={() => {
                console.log("User object:", JSON.stringify(user, null, 2));
                console.log("Account ID:", user?.accountId);
                if (user?.accountId) {
                  navigation.navigate("Plans", { customerNo: user.accountId });
                } else {
                  Alert.alert(
                    "Error",
                    "Unable to load plan information. Please try again later."
                  );
                }
              }}
              style={[tw`flex-row items-center`, { padding: 4 }]}
            >
              <Text
                style={[
                  tw`text-sm font-medium mr-1`,
                  { color: theme.colors.primary },
                ]}
              >
                Change Plan
              </Text>
              <Icon name="arrow-right" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {serviceLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : serviceData ? (
            <View>
              <Text style={tw`text-gray-700`}>
                <Text style={tw`font-semibold`}>Plan Name: </Text>
                {serviceData.planName || "N/A"}
              </Text>
              <Text style={tw`text-gray-700 mt-1`}>
                <Text style={tw`font-semibold`}>Service Name: </Text>
                {serviceData.name || "N/A"}
              </Text>
              <Text style={tw`text-gray-700 mt-1`}>
                <Text style={tw`font-semibold`}>Plan No: </Text>
                {serviceData.planNo || "N/A"}
              </Text>
              <Text style={tw`text-gray-700 mt-1`}>
                <Text style={tw`font-semibold`}>Product Type: </Text>
                {serviceData.productType || "N/A"}
              </Text>
              <Text style={tw`text-gray-700 mt-1`}>
                <Text style={tw`font-semibold`}>Locality: </Text>
                {serviceData.locality || "N/A"}
              </Text>
              <Text style={tw`text-gray-700 mt-1`}>
                <Text style={tw`font-semibold`}>State: </Text>
                {serviceData.state || "N/A"}
              </Text>
              <Text style={tw`text-gray-700 mt-1`}>
                <Text style={tw`font-semibold`}>Post Code: </Text>
                {serviceData.postCode || "N/A"}
              </Text>
            </View>
          ) : (
            <Text style={tw`text-gray-500`}>No plan data available</Text>
          )}
        </View>
        {/* Billing Summary */}
        <View
          style={tw`bg-white mx-2 p-4 rounded-xl border border-gray-200 mb-4`}
        >
          <Text style={tw`font-semibold mb-2`}>Billing Summary</Text>
          {balanceLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : balance ? (
            <View>
              <Text style={tw`text-gray-700`}>
                <Text style={tw`font-semibold`}>Current Balance: </Text>$
                {parseFloat(balance.currBalance || 0).toFixed(2)}
              </Text>
            </View>
          ) : (
            <Text style={tw`text-gray-500`}>No balance data available</Text>
          )}
          {/* {user.disputeNotice && (
            <View style={tw`border border-red-300 p-2 rounded-lg mt-3`}>
              <Text style={tw`text-xs text-black`}>
                Notice: Double charge detected on your May Bill. You can dispute
                this charge using Bill Query.
              </Text>
            </View>
          )} */}
          <View style={tw`flex-row mt-4`}></View>
          <View style={tw` my-2`}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ChatAI")}
              style={[
                tw`py-3 rounded-xl mb-4`,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={tw`text-center text-white font-semibold`}>
                Chat With AI
              </Text>
            </TouchableOpacity>
          </View>
          <View style={tw`mx-2 mb-6`}>
            <Text style={tw`font-semibold mb-3`}>Quick Actions</Text>
            {[
              {
                title: "Bill Query",
                subtitle: "View bills & dispute charges",
                icon: "file-text",
                screen: "BillQuery",
              },
              {
                title: "Update Address",
                subtitle: "Change your service address",
                icon: "map-pin",
                screen: "UpdateAddress",
              },
              {
                title: "Coverage Check",
                subtitle: "Check network availability",
                icon: "wifi",
                screen: "CoverageCheck",
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={tw`bg-white p-4 rounded-xl border border-gray-200 flex-row justify-between items-center mb-3`}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={tw`flex-row items-center`}>
                  <Icon
                    name={item.icon}
                    size={22}
                    color="blue"
                    style={tw`mr-3`}
                  />
                  <View>
                    <Text style={tw`text-black font-medium`}>{item.title}</Text>
                    <Text style={tw`text-gray-500 text-xs mt-1`}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <ArrowRight size={20} color="black" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* 🔹 Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              height: "50%",
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            {/* Header */}
            <View
              style={{
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 20, color: "#222" }}>
                Add Payment Method
              </Text>
              <Text style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                Securely add your card details below
              </Text>
            </View>
            {/* Loading Indicator */}
            {loading && (
              <ActivityIndicator
                size="large"
                color="#007BFF"
                style={{ marginTop: 20 }}
              />
            )}
            {/* WebView */}
            <WebView
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              onLoadEnd={() => setLoading(false)}
              source={{
                html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <script src="https://api.quickstream.westpac.com.au/rest/v1/quickstream-api-1.0.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: "Inter", "Helvetica", sans-serif;
        margin: 0;
        background: #fafafa;
        padding: 24px;
        color: #1e293b;
      }
      .card {
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.06);
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
        animation: fadeInUp 0.4s ease-out;
      }
      h3 {
        text-align: center;
        color: #1e293b;
        font-size: 22px;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 24px;
      }
      [data-quickstream-api="creditCardContainer"] {
        width: 100%;
        height: 420px;
        border: none;
        margin-bottom: 20px;
      }
      #submitBtn {
        width: 100%;
        background: linear-gradient(135deg, #007bff, #0056d2);
        color: #fff;
        border: 0;
        padding: 16px;
        font-size: 17px;
        font-weight: 600;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.25s ease;
        box-shadow: 0 4px 10px rgba(0,123,255,0.25);
      }
      #submitBtn:hover:not(:disabled) {
        background: linear-gradient(135deg, #0056d2, #0041a8);
        transform: translateY(-2px);
        box-shadow: 0 6px 14px rgba(0,123,255,0.35);
      }
      #submitBtn:disabled {
        background: #b6c8e5;
        cursor: not-allowed;
        opacity: 0.8;
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  </head>
  <body>
    <div class="card">
      <form id="payment-form">
        <h3>💳 Enter Card Details</h3>
        <div data-quickstream-api="creditCardContainer"></div>
        <button id="submitBtn" type="submit" disabled>Submit</button>
      </form>
    </div>
    <script>
      QuickstreamAPI.init({
        publishableApiKey: 'TIAB_PUB_jqiyv6fcvvskukbm96reinkd2g97d8g8pip6tf7mazu8u6kyxds2gme5z5aa'
      });
      let trustedFrame = null;
      const form = document.getElementById('payment-form');
      const submitBtn = document.getElementById('submitBtn');
      QuickstreamAPI.creditCards.createTrustedFrame({
        config: { supplierBusinessCode: 'TIABREST' },
        iframe: {
          width: "100%",
          height: "600px",
          scrolling: "no",
          style: { border: "none", background: "#fff", borderRadius: "12px" }
        },
        fieldStyles: {
  base: {
    fontSize: "40px",
    lineHeight: "56px",
    padding: "24px 18px",
    color: "#111",
    fontFamily: "Inter, sans-serif",
    "::placeholder": { color: "#9ca3af", fontSize: "36px" }
  },
  focus: { color: "#000", borderColor: "#007BFF" },
  invalid: { color: "#EF4444", borderColor: "#EF4444" }
}
      }, function (errors, data) {
        if (errors) {
          console.error("Frame init error:", errors);
          alert("Failed to load credit card form");
          return;
        }
        trustedFrame = data.trustedFrame;
        submitBtn.disabled = false;
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!trustedFrame) {
          alert('Frame not ready yet');
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        trustedFrame.submitForm(function (errors, data) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
          if (errors) {
            const msg = Array.isArray(errors)
              ? errors.map(e => e.message || e).join(', ')
              : (errors.message || 'Unknown error');
            alert('Error: ' + msg);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: msg }));
            }
            return;
          }
          const token = data?.singleUseToken?.singleUseTokenId;
          alert('Token created: ' + token);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'token', token }));
          }
        });
      });
    </script>
  </body>
</html>
          `,
              }}
              onMessage={handleMessage}
            />
            {/* Footer */}
            <TouchableOpacity
              style={{
                backgroundColor: "#f8f8f8",
                paddingVertical: 16,
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: "#eee",
              }}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text
                style={{ fontWeight: "600", color: "#007BFF", fontSize: 16 }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
          {/* previous publishable key */}
          {/* C01967_PUB_yq7vmrc8abkyjxmkp4iqbdxnqpx8vb4p8fnau7x7fz4shpwpqqyah6fmhzww */}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
