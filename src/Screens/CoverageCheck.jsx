import React, { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ArrowLeft } from "lucide-react-native";
import { theme } from "../utils/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../utils/config";

const CoverageCheck = ({ navigation }) => {
  const [zip, setZip] = useState("");
  const [coverageData, setCoverageData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!zip) {
      alert("Please enter a ZIP code or address");
      return;
    }

    setLoading(true);
    setCoverageData(null);

    try {
      const response = await axios.get(`${API_BASE_URL}coverage/${zip}`);

      if (Array.isArray(response.data) && response.data.length > 0) {
        // ✅ store the full array to render later
        setCoverageData(response.data);
      } else {
        alert("No coverage data found for this location.");
      }

      console.log("Coverage response:", response.data);
    } catch (error) {
      if (error.response) {
        alert(error.response.data?.message || "Coverage not found");
      } else {
        alert("Network error. Please try again.");
      }
      console.log("Coverage check error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        tw`flex-1 bg-white`,
        {
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          paddingBottom: 10,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={tw`px-4 pb-8`}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={tw`flex-row items-center mb-4`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text style={tw`ml-3 text-lg font-semibold`}>Coverage Check</Text>
        </View>

        {/* Check Service Availability */}
        <View style={tw`bg-white rounded-xl p-4 border border-gray-200 mb-4`}>
          <View style={tw`flex-row items-center mb-3`}>
            <Icon name="signal-cellular-alt" size={22} color="black" />
            <Text style={tw`ml-2 font-semibold`}>
              Check Service Availability
            </Text>
          </View>
          <Text style={tw`text-xs text-gray-500 mb-4`}>
            Enter a Post code or address to check if our services are available
          </Text>

          <TextInput
            style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
            placeholder="Post code (e.g., 2000)"
            value={zip}
            onChangeText={setZip}
          />

          <TouchableOpacity
            style={[
              tw`py-3 rounded-xl`,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleCheck}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-white text-center font-semibold`}>
                Check Coverage
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Show Coverage Result */}
        {/* Show Coverage Result */}
        {Array.isArray(coverageData) && coverageData.length > 0 && (
          <View style={tw`bg-white rounded-xl p-4 border border-gray-200 mb-4`}>
            <Text style={tw`font-semibold mb-3`}>Coverage Result</Text>

            {coverageData.map((item, index) => (
              <View key={index} style={tw`mb-4 border-b border-gray-100 pb-3`}>
                <Text style={tw`text-gray-600 text-xs`}>Address</Text>
                <Text style={tw`text-base font-semibold`}>
                  {item.displayAddress}
                </Text>

                <Text style={tw`text-gray-600 text-xs mt-2`}>Availability</Text>
                <Text style={tw`text-base font-semibold`}>
                  {item.availability}
                </Text>

                <Text style={tw`text-gray-600 text-xs mt-2`}>
                  Network Types
                </Text>
                <View style={tw`flex-row flex-wrap mt-1`}>
                  {item.networkTypes?.map((net, i) => (
                    <View
                      key={i}
                      style={tw`bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2`}
                    >
                      <Text style={tw`text-blue-700 text-xs font-semibold`}>
                        {net}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Network Information */}
        <View style={tw`bg-white rounded-xl p-4 border border-gray-200 mb-4`}>
          <Text style={tw`font-semibold mb-4`}>Network Information</Text>

          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`bg-green-500 px-2 py-1 rounded`}>
              <Text style={tw`text-white text-xs font-bold`}>5G</Text>
            </View>
            <Text style={tw`ml-3 text-gray-800`}>
              Ultra-fast speeds up to 1 Gbps
            </Text>
          </View>

          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`bg-blue-500 px-2 py-1 rounded`}>
              <Text style={tw`text-white text-xs font-bold`}>4G</Text>
            </View>
            <Text style={tw`ml-3 text-gray-800`}>
              High-speed data up to 100 Mbps
            </Text>
          </View>

          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-yellow-500 px-2 py-1 rounded`}>
              <Text style={tw`text-white text-xs font-bold`}>3G</Text>
            </View>
            <Text style={tw`ml-3 text-gray-800`}>
              Standard data speeds up to 21 Mbps
            </Text>
          </View>
        </View>

        {/* Coverage Check Tips */}
        <View style={tw`bg-white rounded-xl p-4 border border-gray-200`}>
          <Text style={tw`font-semibold mb-3`}>Coverage Check Tips</Text>
          <Text style={tw`text-xs text-gray-600 mb-2`}>
            • Enter specific addresses for more accurate results.
          </Text>
          <Text style={tw`text-xs text-gray-600 mb-2`}>
            • Coverage may vary inside buildings or underground.
          </Text>
          <Text style={tw`text-xs text-gray-600 mb-2`}>
            • 5G coverage is expanding to more areas monthly.
          </Text>
          <Text style={tw`text-xs text-gray-600`}>
            • Contact support for coverage improvement requests.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoverageCheck;
