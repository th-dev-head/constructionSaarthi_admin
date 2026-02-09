import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../../../redux/slice/AuthSlice";

const OTPSend = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { countryCode, phoneNumber, loading, error } = useSelector(
    (state) => state.auth
  );

  const handleVerify = () => {
    dispatch(verifyOtp({ countryCode, phoneNumber, otp }))
      .unwrap()
      .then((data) => {
        if (data.token) {
          navigate("/dashboard");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Enter OTP</h2>
        <p className="mb-6">
          We have sent an OTP to {countryCode} {phoneNumber}
        </p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <button
          onClick={handleVerify}
          className="w-full py-2 bg-[#B02E0C] text-white rounded-xl"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OTPSend;
