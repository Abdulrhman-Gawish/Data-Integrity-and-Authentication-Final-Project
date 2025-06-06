// src/pages/SignupPage.jsx
import { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  UserPlus,
  ArrowRight,
  Github,
  Shield,
  UserCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signup, githubLoginUrl } from "../services/api";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await signup(formData);

      setSuccess("Account created successfully!");

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userRole", formData.role);
      }
      if (formData.role === "admin") {
        navigate("/adminDashboard");
      } else {
        navigate("/userDashboard");
      }

    } catch (err) {
      setError( 
        err?.response?.data?.message ||
          err.message ||
          "An error occurred. Please try again."
      );
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    setIsLoading(true);
    setError("");

    try {
      const url = githubLoginUrl();
      window.location.href = url;
    } catch (err) {
      setError("Failed to connect with GitHub");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold">Create Account</h1>
            <Link
              to="/login"
              className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm py-1 px-3 rounded-full transition duration-300"
            >
              <span>Login</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-blue-100 mt-2">
            Fill in your details to get started
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Account Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange("user")}
                  className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg border ${
                    selectedRole === "user"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  } transition duration-200`}
                >
                  <UserCircle size={18} />
                  <span>User</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("admin")}
                  className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg border ${
                    selectedRole === "admin"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  } transition duration-200`}
                >
                  <Shield size={18} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* GitHub Login */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-800 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition duration-300"
            >
              <Github size={18} />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Switch to Login */}
          <p className="text-center mt-6 text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
