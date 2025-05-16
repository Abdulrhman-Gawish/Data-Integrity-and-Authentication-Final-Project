import { useState, useEffect } from "react";
import { QrCode, RefreshCw, X, Check, AlertCircle } from "lucide-react";
import axios from "../utils/axios"; // Import your configured axios instance

export default function QRCodeApp() {
  const [base64Data, setBase64Data] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpStatus, setOtpStatus] = useState(null); // 'success', 'error', or null
  const [setupComplete, setSetupComplete] = useState(false);

  // Fetch QR code data from backend
  const fetchQRCodeBase64 = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/enable2FA");
      console.log("response: ", response);

      setBase64Data(response.data.data.qr_code);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch QR code data. Please try again."
      );
      console.error("Error fetching QR code:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate OTP with backend
  const validateOTP = async () => {
    if (otpValue.length !== 6) {
      setOtpStatus("error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/verify2FA", {
        token: otpValue,
      });

      if (response.data.success) {
        setOtpStatus("success");
        setSetupComplete(true);
      } else {
        setOtpStatus("error");
      }
    } catch (err) {
      setOtpStatus("error");
      setError(
        err.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch QR code on initial load
  useEffect(() => {
    fetchQRCodeBase64();
  }, []);

  if (setupComplete) {
    return (
      <div className="flex flex-col items-center max-w-lg mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <Check className="text-green-600 mr-2" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">
            2FA Setup Complete
          </h1>
        </div>

        <div className="w-full bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Two-factor authentication enabled
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Your account is now protected with two-factor authentication.
              You'll need to enter a verification code from your authenticator
              app each time you log in.
            </p>
            <button
              onClick={() => window.location.href = '/userDashboard'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <QrCode className="text-blue-600 mr-2" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">
          QR Code Authentication
        </h1>
      </div>

      {/* QR Code Section */}
      <div className="w-full bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Scan this QR Code
        </h2>

        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 w-64 bg-gray-100 rounded">
              <RefreshCw
                className="animate-spin text-blue-500 mb-2"
                size={32}
              />
              <p className="text-gray-600">Loading QR code...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 w-64 bg-red-50 rounded border border-red-200">
              <AlertCircle className="text-red-500 mb-2" size={32} />
              <p className="text-red-600 text-center">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={fetchQRCodeBase64}
                disabled={isLoading}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={base64Data}
                alt="QR Code"
                className="h-64 w-64 border-4 border-white shadow-md rounded"
              />
              <button
                className="absolute -top-3 -right-3 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-colors"
                onClick={fetchQRCodeBase64}
                disabled={isLoading}
                title="Refresh QR Code"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-600">
            Scan with your authenticator app to receive OTP
          </p>
        </div>
      </div>

      {/* OTP Entry Section */}
      <div className="w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Enter OTP Code
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={otpValue}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setOtpValue(value);
                if (otpStatus) setOtpStatus(null);
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg text-center text-xl tracking-widest ${
                otpStatus === "success"
                  ? "border-green-500 bg-green-50"
                  : otpStatus === "error"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="123456"
              disabled={isLoading}
            />

            {otpStatus && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {otpStatus === "success" ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
              </div>
            )}
          </div>

          {otpStatus === "error" && (
            <p className="text-red-500 text-sm">
              {error ||
                "Invalid OTP code. Please try again or rescan the QR code."}
            </p>
          )}

          {otpStatus === "success" && (
            <p className="text-green-500 text-sm">OTP verified successfully!</p>
          )}

          <div className="flex space-x-3">
            <button
              onClick={validateOTP}
              disabled={otpValue.length !== 6 || isLoading}
              className={`flex-1 py-2 px-4 rounded-lg ${
                otpValue.length === 6 && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-colors`}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => {
                setOtpValue("");
                setOtpStatus(null);
                setError(null);
              }}
              disabled={isLoading}
              className={`py-2 px-4 rounded-lg ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } transition-colors`}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Having trouble? Try to:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
            <li>Make sure your device's time is synced properly</li>
            <li>
              <button
                onClick={fetchQRCodeBase64}
                disabled={isLoading}
                className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Refresh the QR code
              </button>{" "}
              and scan again
            </li>
            <li>Check your internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
