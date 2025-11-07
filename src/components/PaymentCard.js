
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import tw from "tailwind-react-native-classnames";

export const PaymentCard = ({ onTokenReceived, onClose }) => {
  const injectQuickstreamScript = `
    function loadQuickstream() {
      if (window.QuickstreamAPI) {
        initQuickstream();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.quickstream.westpac.com.au/rest/v1/quickstream-api-1.0.min.js';
      script.id = 'quickstream-js';
      script.onload = initQuickstream;
      document.body.appendChild(script);
    }

    function initQuickstream() {
      if (!window.QuickstreamAPI) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Quickstream API not loaded' }));
        return;
      }

      const container = document.getElementById('creditCardContainer');
      if (container) container.innerHTML = '';

      window.QuickstreamAPI.init({
        publishableApiKey: "TIAB_PUB_jqiyv6fcvvskukbm96reinkd2g97d8g8pip6tf7mazu8u6kyxds2gme5z5aa",
      });

      let trustedFrame = null;
      const submitBtn = document.getElementById('submitBtn');
      const form = document.getElementById('payment-form');

      window.QuickstreamAPI.creditCards.createTrustedFrame(
        {
          config: { supplierBusinessCode: "TIABREST" },
          iframe: {
            width: "100%",
            scrolling: "no",
            style: { border: "none", background: "#fff", borderRadius: "12px" },
          },
          fieldStyles: {
            base: {
              fontSize: "18px",
              padding: "10px 12px",
              color: "#111",
              fontFamily: "Inter, sans-serif",
              "::placeholder": { color: "#9ca3af" },
            },
            focus: { color: "#000", borderColor: "#007BFF" },
            invalid: { color: "#EF4444", borderColor: "#EF4444" },
          },
        },
        function(errors, data) {
          if (errors) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'error', 
              message: 'Failed to load credit card form' 
            }));
            return;
          }
          trustedFrame = data.trustedFrame;
          submitBtn.disabled = false;
        }
      );

      form.onsubmit = function(e) {
        e.preventDefault();
        if (!trustedFrame) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'error', 
            message: 'Frame not ready yet' 
          }));
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";

        trustedFrame.submitForm(function(errors, data) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
          
          if (errors) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'error', 
              message: 'Error: ' + (errors.message || 'Unknown error') 
            }));
            return;
          }

          const token = data?.singleUseToken?.singleUseTokenId;
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'token', 
            token: token 
          }));
        });
      };
    }

    // Initial load
    loadQuickstream();
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        #payment-form {
          width: 100%;
        }
        // #creditCardContainer {
        //   width: 100%;
        //   height: 250px;
        //   margin-bottom: 16px;
        //   background: #f3f4f6;
        //   border-radius: 8px;
        //   overflow: hidden;
        //     min-height: 420px;
        // }


        //  #creditCardContainer {
        //   width: 100%;
        //   min-height: 420px; /* <- increased from 250px */
        //   height: auto;
        //   margin-bottom: 20px;
        //   background: #f3f4f6;
        //   border-radius: 8px;
        //   overflow: hidden;
        // }

 #creditCardContainer {
          width: 100%;
          min-height: 420px;
          height: auto;
          background: transparent; /* remove white box */
          border-radius: 8px;
          overflow: visible;
        }

 #creditCardContainer iframe {
          width: 100% !important;
          background: transparent !important;
          min-height: 360px !important;
          display: block;
        }



        // #submitBtn {
        //   width: 100%;
        //   padding: 12px;
        //   background-color: #10B981;
        //   color: white;
        //   border: none;
        //   border-radius: 8px;
        //   font-size: 16px;
        //   font-weight: 600;
        //   cursor: pointer;
        //   margin-top: 20px;
        // }
          #submitBtn {
          width: 100%;
          padding: 12px;
          background-color: #10B981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px; /* keeps button separated from iframe */
        }
        #submitBtn:disabled {
          background-color: #9CA3AF;
          cursor: not-allowed;
        }
      </style>
    </head>
    <body>
      <form id="payment-form">
        <div id="creditCardContainer" data-quickstream-api="creditCardContainer"></div>
        <button type="submit" id="submitBtn" disabled  >Submit Payment</button>
      </form>
      <script>
        ${injectQuickstreamScript}
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "token" && data.token) {
        onTokenReceived(data.token);
      } else if (data.type === "error") {
        console.error("Payment error:", data.message);
        Alert.alert("Payment Error", data.message);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  return (
    <View style={[styles.container, tw`rounded-2xl p-4`]}>
      <Text style={[styles.title, tw`text-black font-semibold mb-3`]}>
        Enter Card Details
      </Text>
      <View style={{ height: 400, width: "100%" }}>
        <WebView
          source={{ html }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
          originWhitelist={["*"]}
          mixedContentMode="always"
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
            </View>
          )}
        />
      </View>
      <View style={tw`flex-row justify-between mt-4`}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, tw`flex-1 mr-2`]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Cancel</Text>
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
    width: "100%",
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
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
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});