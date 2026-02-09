// ...existing code...
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, setCountryCode, setPhoneNumber } from "../../../redux/slice/AuthSlice";
import { useNavigate } from "react-router-dom";
import loginbg from "../../../assets/loginbg.png";
import icon from "../../../assets/icon.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// ...existing code...

const countryCodes = [
  { code: "+91", name: "India" },
  { code: "+1", name: "USA" },
  { code: "+44", name: "UK" },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { countryCode, phoneNumber, loading, error } = useSelector((state) => state.auth);

  // helper to extract meaningful message from backend/rejected thunk
  const getErrorMessage = (err) => {
    if (!err) return "Something went wrong. Please try again.";
    if (typeof err === "string") return err;
    if (err.payload) {
      if (err.payload.error && err.payload.error.message) return err.payload.error.message;
      if (err.payload.message) return err.payload.message;
    }
    if (err.error && err.error.message) return err.error.message;
    if (err.response && err.response.data) {
      const d = err.response.data;
      if (d.error && d.error.message) return d.error.message;
      if (d.message) return d.message;
    }
    if (err.message) return err.message;
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendOtp({ countryCode, phoneNumber }))
      .unwrap()
      .then(() => {
        toast.success("OTP sent successfully");
        navigate("/otp-send");
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
        const msg = getErrorMessage(err);
        toast.error(msg);
      });
  };

  const handleForgotPassword = () => navigate("/forgot-pass");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      <ToastContainer position="top-right" autoClose={5000} />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginbg})` }}
      ></div>

      <div className="relative z-10 bg-white shadow-lg rounded-lg p-8 w-11/12 max-w-md">
        <div className="flex justify-center gap-2 mb-8 text-center items-center">
          <img src={icon} alt="Logo" className="w-10" />
          <p className="font-bold">ConstructionSaarthi</p>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-4">Sign In</h2>
        <p className="text-center text-[16px] text-[#060C12] mb-6">
          Please fill in your details to access your dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => dispatch(setCountryCode(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => dispatch(setPhoneNumber(e.target.value))}
              required
              placeholder="Mobile Number"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between mb-10">
            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="form-checkbox text-indigo-600" />
              <span className="ml-2">Remember me</span>
            </label>
            <p
              className="text-md text-[#B02E0C] cursor-pointer hover:underline"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#B02E0C] text-white rounded-xl hover:bg-[#872f00] transition-colors"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
// ...existing code...