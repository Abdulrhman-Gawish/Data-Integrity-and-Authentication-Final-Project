import { useState } from "react";
import { Check, X, AlertCircle } from "lucide-react";
// import { Navigate } from "react-router-dom";
import axios from "../utils/axios";

export default function OTPVerification({ onVerificationSuccess }) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
    if (verificationResult) setVerificationResult(null);
  };

  const handleClear = () => {
    setOtp("");
    setVerificationResult(null);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setVerificationResult({
        success: false,
        message: "Please enter a 6-digit OTP",
        icon: <AlertCircle className="text-red-500" />,
      });
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationResult(null);

      const response = await axios.post("/auth/verify2FA", {
        token: otp,
      });

      if (response.data.success) {
        setVerificationResult({
          success: true,
          message: "OTP verified successfully!",
          icon: <Check className="text-green-500" />,
        });

        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
        setTimeout(() => {
          window.location.href = "/userDashboard";
        }, 1000);
      } else {
        setVerificationResult({
          success: false,
          message: response.data.message || "Invalid OTP. Please try again.",
          icon: <X className="text-red-500" />,
        });
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message:
          error.response?.data?.message ||
          "Verification failed. Please try again.",
        icon: <X className="text-red-500" />,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Enter OTP Code
        </h2>

        <div className="mb-4 relative">
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="123456"
            className={`w-full px-4 py-3 border-2 rounded-lg text-center text-lg tracking-widest ${
              verificationResult?.success
                ? "border-green-500 bg-green-50"
                : verificationResult?.success === false
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-blue-500"
            }`}
            maxLength={6}
            disabled={isVerifying}
          />
          {verificationResult && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {verificationResult.icon}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={verifyOtp}
            disabled={isVerifying || otp.length !== 6}
            className={`flex-1 py-2 px-4 rounded-lg transition duration-200 ${
              isVerifying || otp.length !== 6
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            onClick={handleClear}
            disabled={isVerifying}
            className={`py-2 px-6 rounded-lg transition duration-200 ${
              isVerifying
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
            }`}
          >
            Clear
          </button>
        </div>

        {verificationResult && (
          <div
            className={`p-3 rounded-lg flex items-center ${
              verificationResult.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {verificationResult.icon && (
              <span className="mr-2">{verificationResult.icon}</span>
            )}
            <span>{verificationResult.message}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-gray-700 mb-2">Having trouble? Try to:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Make sure your device's time is synced properly</li>
            <li>Check your authenticator app for correct code</li>
            <li>Request a new OTP if this one has expired</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
