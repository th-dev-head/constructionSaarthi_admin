import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOtp, sendOtp } from "../../../redux/slice/AuthSlice";
import loginbg from "../../../assets/loginbg.png";
import icon from "../../../assets/icon.png";
import { toast } from "react-toastify";
// ...existing code...

const OTPSend = () => {
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { countryCode, phoneNumber, loading, error } = useSelector(
    (state) => state.auth
  );

  // helper to extract meaningful message from backend/rejected thunk
  const getErrorMessage = (err) => {
    if (!err) return "Something went wrong. Please try again.";
    if (typeof err === "string") return err;
    const data = err.payload || err;
    if (data) {
      if (data.error && typeof data.error === "object" && data.error.message) return data.error.message;
      if (typeof data.error === "string") return data.error;
      if (data.message) return data.message;
    }
    if (err.message) return err.message;
    return "Something went wrong. Please try again.";
  };

  // Masked phone number: show last 2 digits only
  const maskedPhone = phoneNumber
    ? `*** *** ***${phoneNumber.slice(-2)}`
    : "*** *** ***";

  // Countdown timer
  useEffect(() => {
    setTimer(30);
    setCanResend(false);
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleChange = (index, value) => {
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value.slice(-1); // only 1 digit per box
    setOtpDigits(updated);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otpDigits];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setOtpDigits(updated);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }
    dispatch(verifyOtp({ countryCode, phoneNumber, otp }))
      .unwrap()
      .then((data) => {
        if (data.token) {
          toast.success("Login successful!");
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        console.error("Verification error:", err);
        toast.error(getErrorMessage(err));
      });
  };

  const handleResend = () => {
    if (!canResend) return;
    setResending(true);
    dispatch(sendOtp({ countryCode, phoneNumber }))
      .unwrap()
      .then(() => {
        toast.success("OTP resent successfully");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimer(30);
        setCanResend(false);
        setResending(false);
        inputRefs.current[0]?.focus();
      })
      .catch((err) => {
        console.error("Resend error:", err);
        toast.error(getErrorMessage(err));
        setResending(false);
      });
  };

  const isComplete = otpDigits.every((d) => d !== "");

  return (
    <div className="otp-screen-wrapper relative">
      {/* Background matching Login screen */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginbg})` }}
      ></div>

      <div className="otp-card relative z-10 p-6 md:p-10 w-full max-w-[420px] mx-4">
        {/* Logo and branding matching Login screen */}
        <div className="flex justify-start gap-2 mb-8 md:mb-10 items-center w-full">
          <img src={icon} alt="Logo" className="w-10 md:w-12 h-auto" />
          <p className="font-bold text-lg md:text-xl tracking-tight text-[#1a1a1a]">ConstructionSaarthi</p>
        </div>

        <h2 className="otp-title text-2xl md:text-3xl font-bold mb-2">Verify OTP</h2>
        <p className="otp-subtitle">
          Enter One Time Password which we sent on your mobile number{" "}
          <span className="otp-masked-phone">{maskedPhone}</span>
        </p>

        {/* OTP Input Boxes */}
        <div className="otp-boxes" onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`otp-box${digit ? " otp-box--filled" : ""}`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Resend Timer */}
        <div className="otp-resend-row">
          {canResend ? (
            <button
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <span className="otp-timer">
              Resend in:{" "}
              <span className="otp-timer-value">{formatTime(timer)}</span>
            </span>
          )}
        </div>

        {/* Error */}
        {error && <p className="otp-error">{getErrorMessage(error)}</p>}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className={`otp-verify-btn${isComplete && !loading ? " otp-verify-btn--active" : ""}`}
        >
          {loading ? "Verifying..." : "Verify Number"}
        </button>
      </div>

      <style>{`
        .otp-screen-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          position: relative;
        }

        .otp-card {
          background: #ffffff;
          border-radius: 28px;
          width: 90%;
          max-width: 420px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          position: relative;
          z-index: 10;
        }

        .otp-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .otp-subtitle {
          font-size: 14px;
          color: #666;
          margin: 0 0 28px 0;
          line-height: 1.5;
        }

        .otp-masked-phone {
          font-weight: 600;
          color: #333;
        }

        /* OTP Boxes */
        .otp-boxes {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          width: 100%;
          justify-content: flex-start;
        }

        .otp-box {
          width: 48px;
          height: 52px;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          caret-color: #B02E0C;
        }

        .otp-box:focus {
          border-color: #B02E0C;
          box-shadow: 0 0 0 3px rgba(176, 46, 12, 0.12);
          background: #fff;
        }

        .otp-box--filled {
          border-color: #B02E0C;
          background: #fff8f6;
        }

        /* Resend Row */
        .otp-resend-row {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }

        .otp-timer {
          font-size: 13px;
          color: #888;
        }

        .otp-timer-value {
          font-weight: 600;
          color: #B02E0C;
        }

        .otp-resend-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #B02E0C;
          padding: 0;
          text-decoration: underline;
          transition: opacity 0.2s;
        }

        .otp-resend-btn:hover {
          opacity: 0.75;
        }

        .otp-resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Error */
        .otp-error {
          width: 100%;
          font-size: 13px;
          color: #dc2626;
          margin-bottom: 12px;
          background: #fef2f2;
          border-radius: 8px;
          padding: 8px 12px;
          border: 1px solid #fecaca;
        }

        /* Verify Button */
        .otp-verify-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: not-allowed;
          background: #e0b5a8;
          color: #fff;
          transition: background 0.25s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.3px;
        }

        .otp-verify-btn--active {
          background: #B02E0C;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(176, 46, 12, 0.32);
        }

        .otp-verify-btn--active:hover {
          background: #8f2409;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(176, 46, 12, 0.38);
        }

        .otp-verify-btn--active:active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .otp-card {
            padding: 32px 20px;
          }
          .otp-box {
            width: 42px;
            height: 46px;
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default OTPSend;
