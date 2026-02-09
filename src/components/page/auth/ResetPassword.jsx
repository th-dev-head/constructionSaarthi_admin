import React from "react";
import ResetPasswordBg from "../../../assets/forgotPass.png";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
      const navigate = useNavigate();

  const handleBack = () => {
    navigate("/forgot-pass");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard"); 
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 py-12 bg-white">
        <button 
            onClick={handleBack}
        className="flex items-center text-gray-700 hover:text-gray-900 mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600 mb-8">
          Create a new password for your account
        </p>

        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md  
              placeholder-gray-400 transition focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
            />
          </div>

          <div className="mb-8">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md  
              placeholder-gray-400 transition focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
            />
          </div>

          <div className="flex items-center mb-10">
            <input
              type="checkbox"
              className="form-checkbox text-[#B02E0C] rounded focus:ring-[#B02E0C]"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#B02E0C] text-white py-3 rounded-xl"
          >
            Go To Dashboard
          </button>
        </form>
      </div>

      <div
        className="flex-1 relative bg-cover bg-center hidden md:flex"
        style={{ backgroundImage: `url(${ResetPasswordBg})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-white p-10 self-end">
          <h3 className="text-2xl font-semibold mb-3">
            Simplify User Management With an All-in-One Dashboard
          </h3>
          <p className="text-gray-200">
            Monitor user activity, assign roles, and streamline team access—all
            in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
