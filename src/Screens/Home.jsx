import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "tailwind-react-native-classnames";
import { Bell, ArrowRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { theme } from "../utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../utils/config";
export default function Home() {
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);

        console.log("Fetched user data:", response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const percentageUsed = Math.round((user.dataUsed / user.dataLimit) * 100);
  const remainingData = (user.dataLimit - user.dataUsed).toFixed(1);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView
        contentContainerStyle={tw`pb-6`} // bottom padding
        showsVerticalScrollIndicator={false}
        style={tw`flex-1 px-4 pt-4`}
      >
        {/* Header */}
        <View style={tw`flex-row items-center py-4 mb-4`}>
          <View style={tw`w-12 h-12 bg-gray-300 rounded-full`} />
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
              <Text style={tw`text-green-600 font-medium`}>{user.status}</Text>
              <Text style={tw`text-gray-400 text-xs mt-1`}>
                Expires {user.expiry}
              </Text>
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`text-gray-500`}>Service Address</Text>
              <Text style={tw`text-right font-medium text-black w-36`}>
                {user.serviceAddress}
              </Text>
              <Text style={tw`mt-2 text-black`}>{user.plan}</Text>
              <Text style={tw`text-gray-500`}>{user.speed}</Text>
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
                { backgroundColor: theme.colors.secondary },
                { width: `${percentageUsed}%` },
              ]}
            />
          </View>
          <View style={tw`flex-row justify-between mt-2`}>
            <Text style={tw`text-gray-500`}>{percentageUsed}% used</Text>
            <Text style={tw`text-gray-500`}>{remainingData} GB remaining</Text>
          </View>
        </View>

        {/* Billing Summary */}
        <View
          style={tw`bg-white mx-2 p-4 rounded-xl border border-gray-200 mb-4`}
        >
          <Text style={tw`font-semibold mb-2`}>Billing Summary</Text>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-red-600 text-2xl font-bold`}>
              {/* ${user.bill.toFixed(2)} */}
            </Text>
            <Text style={tw`text-gray-500`}>
              Due:{" "}
              <Text style={tw`font-semibold text-black`}>{user.dueDate}</Text>
            </Text>
          </View>
          <Text style={tw`text-gray-500 mt-1`}>Outstanding Balance</Text>

          {user.disputeNotice && (
            <View
              style={tw`bg-red-50 border border-red-300 p-2 rounded-lg mt-3`}
            >
              <Text style={tw`text-xs text-red-600`}>
                Notice: Double charge detected on your May Bill. You can dispute
                this charge using Bill Query.
              </Text>
            </View>
          )}

          <View style={tw`flex-row mt-4`}>
            {/* <TouchableOpacity
              style={[
                tw`flex-1 py-2 rounded-xl mr-2 items-center`,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={tw`text-white font-medium`}>Pay Now</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={tw`flex-1 border border-gray-300 py-2 rounded-xl items-center`}
            >
              <Text style={tw`text-black font-medium`}>Set Auto-Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw` my-2`}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChatAI")}
            style={[
              tw`py-3 rounded-xl mb-4`,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={tw`text-center text-white font-semibold`}>
              Chat With Ai
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
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
      </ScrollView>
    </SafeAreaView>
  );
}
