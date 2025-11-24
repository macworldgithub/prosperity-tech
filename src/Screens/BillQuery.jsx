import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { ArrowLeft } from "lucide-react-native";
import { theme } from "../utils/theme";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../utils/config";

const BillQuery = () => {
  const navigation = useNavigation();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unbilledData, setUnbilledData] = useState(null);
  const [unbilledDetails, setUnbilledDetails] = useState({}); // Object mapping csn to details array
  const [customerId, setCustomerId] = useState(null);

  // Fetch user data to get customer ID
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
        const custId = customer.custNo;
        if (!custId) {
          setError("No customer ID found");
          setLoading(false);
          return;
        }
        setCustomerId(custId);
        setLoading(false);
      } catch (err) {
        console.error("User data fetch error:", err);
        setError(err.message || "Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch unbilled summary once customer ID is available
  useEffect(() => {
    if (!customerId) return;

    const fetchUnbilledSummary = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}api/v1/customers/${customerId}/unbilled-summary`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "success") {
          setUnbilledData(response.data.data.unbilledCallsSummary.calls || []);
        } else {
          setError("Failed to fetch unbilled summary");
        }
      } catch (err) {
        console.error("Unbilled summary fetch error:", err);
        setError(err.message || "Failed to fetch unbilled summary");
      } finally {
        setLoading(false);
      }
    };

    fetchUnbilledSummary();
  }, [customerId]);

  // Fetch unbilled details for each CSN once summary is loaded
  useEffect(() => {
    if (!unbilledData || unbilledData.length === 0 || !customerId) return;

    const fetchAllDetails = async () => {
      const token = await AsyncStorage.getItem("access_token");
      setDetailsLoading(true);
      setError(null); // Clear previous errors for details

      try {
        const promises = unbilledData.map((item) =>
          axios
            .get(
              `${API_BASE_URL}api/v1/customers/${customerId}/unbilled-detail?csn=${item.csn}`,
              {
                headers: {
                  accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => ({
              csn: item.csn,
              data: res.data.data?.unbilledCallsDetail?.calls || [], // FIXED: Correct path to calls array
            }))
            .catch((err) => {
              console.error(`Details fetch error for CSN ${item.csn}:`, err);
              return { csn: item.csn, data: [], error: err.message };
            })
        );

        const results = await Promise.all(promises);
        const detailsMap = {};
        results.forEach((r) => {
          detailsMap[r.csn] = r.data;
        });
        setUnbilledDetails(detailsMap);
      } catch (err) {
        console.error("Batch details fetch error:", err);
        setError("Failed to fetch unbilled details");
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchAllDetails();
  }, [unbilledData, customerId]);

  const handleSend = () => {
    if (!question.trim()) return;
    console.log("Bill query submitted:", question);
    setQuestion("");
    Keyboard.dismiss();
  };

  const handleBack = () => navigation.goBack();

  // Compute total charge from summary data
  const totalCharge = unbilledData
    ? unbilledData.reduce(
        (acc, item) => acc + parseFloat(item.totalCharge || 0),
        0
      )
    : 0;

  // Helper function to display name with condition
  const getDisplayName = (name) => {
    if (name === "SimplyBig Unlimited") {
      return "Just Mobile";
    }
    return name || "N/A";
  };

  return (
    <SafeAreaView
      style={[
        tw`flex-1 bg-white`,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={tw`flex-grow px-4 pt-4 pb-20`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={tw`flex-row items-center mb-4`}>
              <TouchableOpacity onPress={handleBack} style={tw`p-1`}>
                <ArrowLeft size={24} color="black" />
              </TouchableOpacity>
              <Text style={tw`ml-3 text-lg font-semibold`}>Bill Query</Text>
            </View>

            {/* Unbilled Summary Card */}
            <View
              style={tw`bg-white rounded-xl shadow p-4 mb-6 border border-gray-300`}
            >
              <Text style={tw`text-base font-semibold mb-3`}>
                Unbilled Summary
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : error ? (
                <Text style={tw`text-red-500 text-sm`}>{error}</Text>
              ) : unbilledData && unbilledData.length > 0 ? (
                <>
                  {unbilledData.map((item, index) => (
                    <View
                      key={index}
                      style={tw`mb-4 border-b border-gray-200 pb-3`}
                    >
                      <Text style={tw`text-sm font-medium text-gray-800 mb-1`}>
                        {getDisplayName(item.name)}
                      </Text>
                      <View style={tw`flex-row justify-between py-1`}>
                        <Text style={tw`text-xs text-gray-600`}>
                          GroupName:
                        </Text>
                        <Text style={tw`text-xs font-medium`}>
                          {item.groupName || "N/A"}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between py-1`}>
                        <Text style={tw`text-xs text-gray-600`}>
                          Total Calls:
                        </Text>
                        <Text style={tw`text-xs font-medium`}>
                          {item.totalCalls || 0}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between py-1`}>
                        <Text style={tw`text-xs text-gray-600`}>
                          Total Charge:
                        </Text>
                        <Text style={tw`text-xs font-medium`}>
                          $ {parseFloat(item.totalCharge || 0).toFixed(2)}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between py-1`}>
                        <Text style={tw`text-xs text-gray-600`}>
                          Total Other:
                        </Text>
                        <Text style={tw`text-xs font-medium`}>
                          $ {item.totalOther || 0}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between py-1`}>
                        <Text style={tw`text-xs text-gray-600`}>
                          Total VSP Cost:
                        </Text>
                        <Text style={tw`text-xs font-medium`}>
                          $ {parseFloat(item.totalVSPCost || 0).toFixed(2)}
                        </Text>
                      </View>
                      {index < unbilledData.length - 1 && (
                        <View style={tw`border-b border-gray-200 my-2`} />
                      )}
                    </View>
                  ))}
                  <View style={tw`flex-row justify-between items-center pt-3`}>
                    <Text style={tw`text-sm font-semibold`}>
                      Total Amount Due
                    </Text>
                    <Text style={tw`text-sm font-semibold`}>
                      $ {totalCharge.toFixed(2)}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={tw`text-gray-500 text-sm`}>
                  No unbilled data available
                </Text>
              )}
            </View>

            {/* Unbilled Details Card - Below Summary */}
            <View
              style={tw`bg-white rounded-xl shadow p-4 mb-6 border border-gray-300`}
            >
              <Text style={tw`text-base font-semibold mb-3`}>
                Unbilled Details
              </Text>
              {detailsLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : unbilledDetails && Object.keys(unbilledDetails).length > 0 ? (
                <>
                  {unbilledData.map((item) => (
                    <View key={item.csn} style={tw`mb-4`}>
                      <Text
                        style={tw`text-sm font-medium text-gray-800 mb-2 border-b border-gray-200 pb-1`}
                      >
                        Details for {getDisplayName(item.name)} (CSN: {item.csn}
                        )
                      </Text>
                      {unbilledDetails[item.csn] &&
                      unbilledDetails[item.csn].length > 0 ? (
                        <>
                          {unbilledDetails[item.csn].map(
                            (detail, detailIndex) => (
                              <View
                                key={detailIndex}
                                style={tw`flex-row justify-between py-2 border-b border-gray-100`}
                              >
                                <View style={tw`flex-1 pr-2`}>
                                  <Text style={tw`text-xs text-gray-600 mb-1`}>
                                    {detail.dateStart} to {detail.dateEnd}
                                  </Text>
                                  <Text style={tw`text-xs text-gray-600 mb-1`}>
                                    {detail.detail || "N/A"} ({detail.itemType})
                                  </Text>
                                  <Text style={tw`text-xs text-gray-600`}>
                                    Duration: {detail.duration || "0"}s | From:{" "}
                                    {detail.origin || "N/A"}
                                  </Text>
                                </View>
                                <View style={tw`text-right`}>
                                  <Text style={tw`text-xs font-medium`}>
                                    ${parseFloat(detail.charge || 0).toFixed(2)}
                                  </Text>
                                  <Text style={tw`text-xs text-gray-500`}>
                                    VSP: $
                                    {parseFloat(detail.vspCost || 0).toFixed(2)}
                                  </Text>
                                </View>
                              </View>
                            )
                          )}
                          {/* Optional: Subtotal for this CSN */}
                          <View
                            style={tw`flex-row justify-between pt-2 border-t border-gray-200`}
                          >
                            <Text style={tw`text-sm font-medium`}>
                              Subtotal for {item.csn}
                            </Text>
                            <Text style={tw`text-sm font-semibold`}>
                              $
                              {unbilledDetails[item.csn]
                                .reduce(
                                  (acc, d) => acc + parseFloat(d.charge || 0),
                                  0
                                )
                                .toFixed(2)}
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Text style={tw`text-gray-500 text-xs`}>
                          No detailed records available for this CSN
                        </Text>
                      )}
                    </View>
                  ))}
                </>
              ) : !detailsLoading ? (
                <Text style={tw`text-gray-500 text-sm`}>
                  No unbilled details available
                </Text>
              ) : null}
            </View>

            {/* Ask About Bill Section */}
            <View
              style={tw`bg-white rounded-xl shadow p-4 mb-6 border border-gray-300`}
            >
              <Text style={tw`text-base font-semibold mb-2`}>
                Ask About Your Bill
              </Text>
              <Text style={tw`text-xs text-gray-500 mb-3`}>
                Describe your billing question or concern, and we'll investigate
              </Text>

              {/* Input Box */}
              <Text style={tw`text-xs text-gray-700 mb-1`}>Your Question</Text>
              <TextInput
                placeholder="e.g., I notice a duplicate charge..."
                value={question}
                onChangeText={setQuestion}
                style={tw`border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4`}
                multiline
                numberOfLines={4}
                returnKeyType="send"
                blurOnSubmit={true}
                onSubmitEditing={handleSend} // 👈 handles "Send" key press
              />

              {/* Common Issues */}
              <Text style={tw`text-xs text-gray-500 mb-2`}>
                Common Issues We Can Help With:
              </Text>
              <View style={tw`pl-2`}>
                {[
                  "Duplicate or incorrect charges.",
                  "Unexpectedly high bills.",
                  "Payment processing questions.",
                  "Service date discrepancies.",
                  "Tax and fee explanations.",
                ].map((issue, i) => (
                  <Text key={i} style={tw`text-xs text-gray-600 mb-1`}>
                    • {issue}
                  </Text>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSend}
              style={[tw`py-3 rounded-xl mb-4`, { backgroundColor: "#2D82FE" }]}
            >
              <Text style={tw`text-center text-white font-semibold`}>
                Submit Query
              </Text>
            </TouchableOpacity>

            <Text style={tw`text-center text-xs text-gray-500 mb-6`}>
              You'll receive a response within 24–48 hours via email or phone
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BillQuery;
