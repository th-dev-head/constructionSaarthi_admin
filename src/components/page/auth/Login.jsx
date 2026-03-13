// ...existing code...
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, setCountryCode, setPhoneNumber } from "../../../redux/slice/AuthSlice";
import { useNavigate } from "react-router-dom";
import loginbg from "../../../assets/loginbg.png";
import icon from "../../../assets/icon.png";
import { toast } from "react-toastify";
// ...existing code...
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
  
  React.useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // helper to extract meaningful message from backend/rejected thunk
  const getErrorMessage = (err) => {
    if (!err) return "Something went wrong. Please try again.";
    
    // If it's a string, return it
    if (typeof err === "string") return err;
    
    // If it's an object from thunk rejection (err is error state or action.payload)
    const data = err.payload || err;
    if (data) {
      if (data.error && typeof data.error === "object" && data.error.message) return data.error.message;
      if (typeof data.error === "string") return data.error;
      if (data.message) return data.message;
    }
    
    if (err.message) return err.message;
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    dispatch(sendOtp({ countryCode, phoneNumber }))
      .unwrap()
      .then(() => {
        toast.success("OTP sent successfully");
        navigate("/otp-send");
      })
      .catch((err) => {
        console.error("Error sending OTP:", err);
        // Toast is already handling the message
        toast.error(getErrorMessage(err));
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative p-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginbg})` }}
      ></div>

      <div className="relative z-10 bg-white shadow-lg rounded-2xl p-10 w-11/12 max-w-lg">
        <div className="flex justify-center gap-2 mb-10 text-center items-center">
          <img src={icon} alt="Logo" className="w-12 h-auto" />
          <p className="font-bold text-xl tracking-tight">ConstructionSaarthi</p>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Sign In</h2>
        <p className="text-center text-sm md:text-[16px] text-gray-600 mb-6 md:mb-8">
          Please fill in your
           details to access your dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <select
              value={countryCode}
              onChange={(e) => dispatch(setCountryCode(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B02E0C] bg-white text-gray-700 w-full sm:w-auto min-w-[120px]"
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
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                dispatch(setPhoneNumber(val));
              }}
              required
              placeholder="Enter Mobile Number"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B02E0C] w-full"
            />
          </div>

          <div className="flex items-center justify-between mb-8 md:mb-10">
            <label className="flex items-center text-sm md:text-[15px] text-gray-500 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#B02E0C] focus:ring-[#B02E0C]" />
              <span className="ml-2">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 md:py-4 text-white rounded-xl font-bold text-base md:text-lg transition-all ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#B02E0C] hover:bg-[#8e240a] hover:shadow-lg active:scale-[0.98]"
              }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {error && <p className="text-red-500 mt-4 text-center text-sm font-medium bg-red-50 py-2 rounded-lg border border-red-100">{getErrorMessage(error)}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
// ...existing code...