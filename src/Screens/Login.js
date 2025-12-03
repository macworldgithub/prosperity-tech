// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import tw from "tailwind-react-native-classnames";
// import { theme } from "../utils/theme";
// import * as LocalAuthentication from "expo-local-authentication";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_BASE_URL } from "../utils/config";
// import fingerprint from "../../assets/finger_print.png";

// const Login = () => {
//   const navigation = useNavigation();
//   const [hasBiometric, setHasBiometric] = useState(false);
//   const [showBiometricScreen, setShowBiometricScreen] = useState(false);
//   const [showForgetPinScreen, setShowForgetPinScreen] = useState(false);
//   const [identifierInput, setIdentifierInput] = useState("");
//   const [forgetIdentifier, setForgetIdentifier] = useState("");
//   const [pinInput, setPinInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [forgetLoading, setForgetLoading] = useState(false);

//   //Check saved user and biometric availability
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       try {
//         const userData = await AsyncStorage.getItem("userData");
//         const hasHardware = await LocalAuthentication.hasHardwareAsync();

//         const isEnrolled = await LocalAuthentication.isEnrolledAsync();

//         const biometricAvailable = hasHardware && isEnrolled;
//         setHasBiometric(biometricAvailable);

//         // If user data exists, show biometric screen instead of login
//         if (userData && biometricAvailable) {
//           setShowBiometricScreen(true);
//         } else {
//           console.log(
//             "ℹNo saved user or biometrics unavailable, showing login screen..."
//           );
//         }
//       } catch (e) {
//         console.log("Error checking biometric:", e);
//       }
//     };
//     checkAuthStatus();
//   }, []);

//   const handleBiometricAuth = async () => {
//     try {
//       const result = await LocalAuthentication.authenticateAsync({
//         promptMessage: "Authenticate to continue",
//         cancelLabel: "Cancel",
//       });

//       if (result.success) {
//         const userData = await AsyncStorage.getItem("userData");

//         if (userData) {
//           navigation.replace("Home");
//         } else {
//           Alert.alert("No saved session found. Please log in again.");
//           setShowBiometricScreen(false);
//         }
//       } else {
//         Alert.alert("Authentication Failed", "Please use your PIN instead.");
//         setShowBiometricScreen(false);
//       }
//     } catch (error) {
//       Alert.alert("Error", "Biometric authentication unavailable.");
//       setShowBiometricScreen(false);
//     }
//   };

//   const handleLogin = async () => {
//     if (!identifierInput || !pinInput) {
//       Alert.alert("Missing Fields", "Please enter both identifier and PIN.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await fetch(`${API_BASE_URL}auth/login`, {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           identifier: identifierInput.trim(),
//           pin: pinInput,
//         }),
//       });

//       const data = await response.json();

//       if (response.status !== 201) {
//         throw new Error(data.message || "Invalid credentials");
//       }

//       await AsyncStorage.setItem("userData", JSON.stringify(data));
//       await AsyncStorage.setItem("access_token", data.access_token);
//       await AsyncStorage.setItem("lastIdentifier", identifierInput.trim());
//       await AsyncStorage.setItem("lastPin", pinInput);

//       navigation.replace("Home");
//     } catch (error) {
//       Alert.alert("Login Failed", error.message || "Unauthorized access.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPin = async () => {
//     if (!forgetIdentifier.trim()) {
//       Alert.alert(
//         "Missing Field",
//         "Please enter your identifier (email or custNo)."
//       );
//       return;
//     }

//     try {
//       setForgetLoading(true);
//       const response = await fetch(`${API_BASE_URL}auth/forgot-pin`, {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           identifier: forgetIdentifier.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (response.status === 201) {
//         Alert.alert("Success", data.message || "New PIN sent to your email.");
//         setShowForgetPinScreen(false); // 👈 CHANGED: Go back to main login screen
//         setForgetIdentifier("");
//       } else {
//         Alert.alert(
//           "Failed",
//           data.message || "Unable to send PIN. Please try again."
//         );
//       }
//     } catch (error) {
//       console.error("Forgot PIN API Error:", error);
//       Alert.alert(
//         "Error",
//         "Network error. Please check your connection and try again."
//       );
//     } finally {
//       setForgetLoading(false);
//     }
//   };

//   // 👈 ADDED: Render Forget PIN Screen (full screen, no modal)
//   if (showForgetPinScreen) {
//     return (
//       <LinearGradient
//         colors={theme.gradients.splash}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={tw`flex-1 items-center justify-center px-6`}
//       >
//         <View
//           style={[
//             tw`bg-white rounded-2xl shadow-lg p-6 w-full`,
//             { maxWidth: 320 },
//           ]}
//         >
//           <Text style={tw`text-xl font-bold text-center mb-4`}>
//             Reset Your PIN
//           </Text>
//           <Text style={tw`text-gray-500 text-center mb-4`}>
//             Enter your identifier (email or custNo) to receive a new PIN.
//           </Text>
//           <TextInput
//             style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-4`}
//             placeholder="Enter Identifier (email or custNo)"
//             placeholderTextColor="#9CA3AF"
//             value={forgetIdentifier}
//             onChangeText={(text) => {
//               setForgetIdentifier(text);
//             }}
//             autoCapitalize="none"
//             keyboardType="email-address"
//           />
//           <Pressable
//             onPress={handleForgotPin}
//             disabled={forgetLoading}
//             style={({ pressed }) => [
//               tw`py-3 rounded-lg mb-3`,
//               {
//                 backgroundColor: pressed
//                   ? theme.colors.primary + "CC"
//                   : theme.colors.primary,
//                 opacity: forgetLoading ? 0.6 : 1,
//               },
//             ]}
//           >
//             {forgetLoading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={tw`text-white text-center font-semibold`}>
//                 Send New PIN
//               </Text>
//             )}
//           </Pressable>
//           <Pressable
//             onPress={() => {
//               setShowForgetPinScreen(false);
//               setForgetIdentifier("");
//             }}
//             style={({ pressed }) => [
//               tw`border py-3 rounded-lg`,
//               {
//                 borderColor: theme.colors.primary,
//                 opacity: pressed ? 0.7 : 1,
//               },
//             ]}
//           >
//             <Text
//               style={[
//                 tw`text-center font-semibold`,
//                 { color: theme.colors.primary },
//               ]}
//             >
//               Back to Login
//             </Text>
//           </Pressable>
//         </View>
//       </LinearGradient>
//     );
//   }

//   if (showBiometricScreen) {
//     return (
//       <LinearGradient
//         colors={theme.gradients.splash}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={tw`flex-1 items-center justify-center px-6`}
//       >
//         <View
//           style={[
//             tw`bg-white rounded-2xl shadow-lg p-6 w-full`,
//             { maxWidth: 320 },
//           ]}
//         >
//           <Text style={tw`text-xl font-bold text-center mb-4`}>
//             Welcome Back
//           </Text>
//           <Image
//             source={fingerprint}
//             style={tw`w-16 h-16 mx-auto mb-4`}
//             resizeMode="contain"
//           />
//           <Text style={tw`text-gray-500 text-center mb-4`}>
//             Use your fingerprint to unlock your session
//           </Text>
//           <Pressable
//             onPress={handleBiometricAuth}
//             style={({ pressed }) => [
//               tw`py-3 rounded-lg`,
//               {
//                 backgroundColor: pressed
//                   ? theme.colors.primary + "CC"
//                   : theme.colors.primary,
//               },
//             ]}
//           >
//             <Text style={tw`text-white text-center font-semibold`}>
//               Authenticate
//             </Text>
//           </Pressable>

//           <Pressable
//             onPress={() => {
//               console.log("🔄 Switching from biometric to PIN login...");
//               setShowBiometricScreen(false);
//             }}
//             style={({ pressed }) => [
//               tw`mt-3 border py-3 rounded-lg`,
//               {
//                 borderColor: theme.colors.primary,
//                 opacity: pressed ? 0.7 : 1,
//               },
//             ]}
//           >
//             <Text
//               style={[
//                 tw`text-center font-semibold`,
//                 { color: theme.colors.primary },
//               ]}
//             >
//               Use PIN Instead
//             </Text>
//           </Pressable>
//         </View>
//       </LinearGradient>
//     );
//   }

//   // 👈 MODIFIED: Direct PIN login screen (full screen, no modal)
//   return (
//     <LinearGradient
//       colors={theme.gradients.splash}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//       style={tw`flex-1 items-center justify-center px-6`}
//     >
//       <View style={[tw`bg-white rounded-2xl p-6 w-4/5`, { maxWidth: 320 }]}>
//         <Text style={tw`text-lg font-bold text-center mb-4`}>Login</Text>

//         <TextInput
//           style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
//           placeholder="Email or Customer Number"
//           placeholderTextColor="#9CA3AF"
//           value={identifierInput}
//           onChangeText={(text) => {
//             setIdentifierInput(text);
//           }}
//           autoCapitalize="none"
//           keyboardType="email-address"
//         />

//         <TextInput
//           style={tw`border border-gray-300 text-black rounded-lg px-3 py-2 mb-3`}
//           placeholder="PIN"
//           placeholderTextColor="#9CA3AF"
//           secureTextEntry
//           keyboardType="numeric"
//           value={pinInput}
//           onChangeText={(text) => {
//             setPinInput(text);
//           }}
//         />

//         <Pressable
//           onPress={handleLogin}
//           disabled={loading}
//           style={({ pressed }) => [
//             tw`py-3 rounded-lg mb-3`,
//             {
//               backgroundColor: pressed
//                 ? theme.colors.primary + "CC"
//                 : theme.colors.primary,
//               opacity: loading ? 0.6 : 1,
//             },
//           ]}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={tw`text-white text-center font-semibold`}>Log In</Text>
//           )}
//         </Pressable>

//         <Pressable
//           onPress={() => {
//             console.log("Forget PIN button pressed");
//             setShowForgetPinScreen(true);
//           }}
//           style={({ pressed }) => [
//             tw`border py-3 rounded-lg mb-3`,
//             {
//               borderColor: theme.colors.primary,
//               opacity: pressed ? 0.7 : 1,
//             },
//           ]}
//         >
//           <Text
//             style={[
//               tw`text-center font-semibold`,
//               { color: theme.colors.primary },
//             ]}
//           >
//             Forget PIN?
//           </Text>
//         </Pressable>

//         {/* <Pressable
//           onPress={() => {
//             setIdentifierInput("");
//             setPinInput("");
//           }}
//           style={({ pressed }) => [
//             tw`border py-3 rounded-lg mb-3`,
//             {
//               borderColor: theme.colors.primary,
//               opacity: pressed ? 0.7 : 1,
//             },
//           ]}
//         >
//           <Text
//             style={[
//               tw`text-center font-semibold`,
//               { color: theme.colors.primary },
//             ]}
//           >
//             Cancel
//           </Text>
//         </Pressable> */}

//         <Text style={tw`text-center text-black text-xl my-2`}>or</Text>

//         <Pressable
//           onPress={() => {
//             navigation.navigate("ChatAI");
//           }}
//           style={({ pressed }) => [
//             tw`border py-3 rounded-lg`,
//             {
//               borderColor: theme.colors.primary,
//               opacity: pressed ? 0.7 : 1,
//             },
//           ]}
//         >
//           <Text
//             style={[
//               tw`text-center font-semibold`,
//               { color: theme.colors.primary },
//             ]}
//           >
//             ASK AI
//           </Text>
//         </Pressable>
//       </View>
//     </LinearGradient>
//   );
// };

// export default Login;
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "tailwind-react-native-classnames";
import { theme } from "../utils/theme";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/config";
import fingerprint from "../../assets/finger_print.png";

const Login = () => {
  const navigation = useNavigation();
  const [hasBiometric, setHasBiometric] = useState(false);
  const [showBiometricScreen, setShowBiometricScreen] = useState(false);
  const [showForgetPinScreen, setShowForgetPinScreen] = useState(false);
  const [identifierInput, setIdentifierInput] = useState("");
  const [forgetIdentifier, setForgetIdentifier] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgetLoading, setForgetLoading] = useState(false);

  //Check saved user and biometric availability
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const biometricAvailable = hasHardware && isEnrolled;
        setHasBiometric(biometricAvailable);
        // If user data exists, show biometric screen instead of login
        if (userData && biometricAvailable) {
          setShowBiometricScreen(true);
        } else {
          console.log(
            "ℹNo saved user or biometrics unavailable, showing login screen..."
          );
        }
      } catch (e) {
        console.log("Error checking biometric:", e);
      }
    };
    checkAuthStatus();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to continue",
        cancelLabel: "Cancel",
      });
      if (result.success) {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          navigation.replace("Home");
        } else {
          Alert.alert("No saved session found. Please log in again.");
          setShowBiometricScreen(false);
        }
      } else {
        Alert.alert("Authentication Failed", "Please use your PIN instead.");
        setShowBiometricScreen(false);
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication unavailable.");
      setShowBiometricScreen(false);
    }
  };

  const handleLogin = async () => {
    if (!identifierInput || !pinInput) {
      Alert.alert("Missing Fields", "Please enter both identifier and PIN.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}auth/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifierInput.trim(),
          pin: pinInput,
        }),
      });
      const data = await response.json();
      if (response.status !== 201) {
        throw new Error(data.message || "Invalid credentials");
      }
      await AsyncStorage.setItem("userData", JSON.stringify(data));
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("lastIdentifier", identifierInput.trim());
      await AsyncStorage.setItem("lastPin", pinInput);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    if (!forgetIdentifier.trim()) {
      Alert.alert(
        "Missing Field",
        "Please enter your identifier (email or custNo)."
      );
      return;
    }
    try {
      setForgetLoading(true);
      const response = await fetch(`${API_BASE_URL}auth/forgot-pin`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: forgetIdentifier.trim(),
        }),
      });
      const data = await response.json();
      if (response.status === 201) {
        Alert.alert("Success", data.message || "New PIN sent to your email.");
        setShowForgetPinScreen(false); // 👈 CHANGED: Go back to main login screen
        setForgetIdentifier("");
      } else {
        Alert.alert(
          "Failed",
          data.message || "Unable to send PIN. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot PIN API Error:", error);
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again."
      );
    } finally {
      setForgetLoading(false);
    }
  };

  // 👈 ADDED: Render Forget PIN Screen (full screen, no modal) - Wrapped with KeyboardAvoidingView and ScrollView
  if (showForgetPinScreen) {
    return (
      <LinearGradient
        colors={theme.gradients.splash}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tw`flex-1`}
      >
        <KeyboardAvoidingView
          style={tw`flex-1 items-center px-6`}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={[
              tw`items-center`,
              { flexGrow: 1, justifyContent: "center" },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                tw`bg-white rounded-2xl shadow-lg p-6 w-full`,
                { maxWidth: 320 },
              ]}
            >
              <Text style={tw`text-xl font-bold text-center mb-4`}>
                Reset Your PIN
              </Text>
              <Text style={tw`text-gray-500 text-center mb-4`}>
                Enter your identifier (email or custNo) to receive a new PIN.
              </Text>
              <TextInput
                style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-4`}
                placeholder="Enter Identifier (email or custNo)"
                placeholderTextColor="#9CA3AF"
                value={forgetIdentifier}
                onChangeText={(text) => {
                  setForgetIdentifier(text);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Pressable
                onPress={handleForgotPin}
                disabled={forgetLoading}
                style={({ pressed }) => [
                  tw`py-3 rounded-lg mb-3`,
                  {
                    backgroundColor: pressed
                      ? theme.colors.primary + "CC"
                      : theme.colors.primary,
                    opacity: forgetLoading ? 0.6 : 1,
                  },
                ]}
              >
                {forgetLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white text-center font-semibold`}>
                    Send New PIN
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowForgetPinScreen(false);
                  setForgetIdentifier("");
                }}
                style={({ pressed }) => [
                  tw`border py-3 rounded-lg`,
                  {
                    borderColor: theme.colors.primary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    tw`text-center font-semibold`,
                    { color: theme.colors.primary },
                  ]}
                >
                  Back to Login
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  if (showBiometricScreen) {
    return (
      <LinearGradient
        colors={theme.gradients.splash}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={tw`flex-1 items-center justify-center px-6`}
      >
        <View
          style={[
            tw`bg-white rounded-2xl shadow-lg p-6 w-full`,
            { maxWidth: 320 },
          ]}
        >
          <Text style={tw`text-xl font-bold text-center mb-4`}>
            Welcome Back
          </Text>
          <Image
            source={fingerprint}
            style={tw`w-16 h-16 mx-auto mb-4`}
            resizeMode="contain"
          />
          <Text style={tw`text-gray-500 text-center mb-4`}>
            Use your fingerprint to unlock your session
          </Text>
          <Pressable
            onPress={handleBiometricAuth}
            style={({ pressed }) => [
              tw`py-3 rounded-lg`,
              {
                backgroundColor: pressed
                  ? theme.colors.primary + "CC"
                  : theme.colors.primary,
              },
            ]}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              Authenticate
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              console.log("🔄 Switching from biometric to PIN login...");
              setShowBiometricScreen(false);
            }}
            style={({ pressed }) => [
              tw`mt-3 border py-3 rounded-lg`,
              {
                borderColor: theme.colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                tw`text-center font-semibold`,
                { color: theme.colors.primary },
              ]}
            >
              Use PIN Instead
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // 👈 MODIFIED: Direct PIN login screen (full screen, no modal) - Wrapped with KeyboardAvoidingView and ScrollView
  return (
    <LinearGradient
      colors={theme.gradients.splash}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={tw`flex-1`}
    >
      <KeyboardAvoidingView
        style={tw`flex-1 items-center px-6`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            tw`items-center`,
            { flexGrow: 1, justifyContent: "center" },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[tw`bg-white rounded-2xl p-6 w-72`, { maxWidth: 420 }]}>
            <Text style={tw`text-lg font-bold text-center mb-4`}>Login</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-lg px-3 py-2 mb-3`}
              placeholder="Email or Customer Number"
              placeholderTextColor="#9CA3AF"
              value={identifierInput}
              onChangeText={(text) => {
                setIdentifierInput(text);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={tw`border border-gray-300 text-black rounded-lg px-3 py-2 mb-3`}
              placeholder="PIN"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              keyboardType="numeric"
              value={pinInput}
              onChangeText={(text) => {
                setPinInput(text);
              }}
            />
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                tw`py-3 rounded-lg mb-3`,
                {
                  backgroundColor: pressed
                    ? theme.colors.primary + "CC"
                    : theme.colors.primary,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-white text-center font-semibold`}>
                  Log In
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                console.log("Forget PIN button pressed");
                setShowForgetPinScreen(true);
              }}
              style={({ pressed }) => [
                tw`border py-3 rounded-lg mb-3`,
                {
                  borderColor: theme.colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-center font-semibold`,
                  { color: theme.colors.primary },
                ]}
              >
                Forget PIN?
              </Text>
            </Pressable>
            {/* <Pressable
              onPress={() => {
                setIdentifierInput("");
                setPinInput("");
              }}
              style={({ pressed }) => [
                tw`border py-3 rounded-lg mb-3`,
                {
                  borderColor: theme.colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-center font-semibold`,
                  { color: theme.colors.primary },
                ]}
              >
                Cancel
              </Text>
            </Pressable> */}
            <Text style={tw`text-center text-black text-xl my-2`}>or</Text>
            <Pressable
              onPress={() => {
                navigation.navigate("ChatAI");
              }}
              style={({ pressed }) => [
                tw`border py-3 rounded-lg`,
                {
                  borderColor: theme.colors.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-center font-semibold`,
                  { color: theme.colors.primary },
                ]}
              >
                ASK AI
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;
