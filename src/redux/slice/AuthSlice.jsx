import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";

// Send OTP
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ countryCode, phoneNumber }, thunkAPI) => {
    try {
      const response = await fetch(`${baseUrl}/api/user/adminSendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country_code: countryCode,
          phone_number: phoneNumber,
        }),
      });
      const data = await response.json();
      console.log("OTP API Response:", data);

        // Treat non-OK HTTP responses or explicit API-level failures as errors.
        // Note: many successful responses include a `message` string, so
        // only consider it an error when `success` is false, `status` === 'error',
        // or there's an `error` field present.
        const apiFailure =
          data?.success === false || data?.status === "error" || Boolean(data?.error);

        if (!response.ok || apiFailure) {
          // Prefer explicit `error` field from backend when available (e.g. "Admin not found"),
          // otherwise fall back to `message`.
          const msg = (data && (data.error || data.message)) || `Failed to send OTP (status ${response.status})`;
          return thunkAPI.rejectWithValue(msg);
        }

      return { data, countryCode, phoneNumber };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Verify OTP and get token
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ countryCode, phoneNumber, otp }, thunkAPI) => {
    try {
      const response = await fetch(`${baseUrl}/api/user/adminVerifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country_code: countryCode,
          phone_number: phoneNumber,
          otp,
        }),
      });

      const data = await response.json();

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    countryCode: "+91",
    phoneNumber: "",
    loading: false,
    otpSent: false,
    error: null,
    token: localStorage.getItem("token") || null,
  },
  reducers: {
    setCountryCode: (state, action) => {
      state.countryCode = action.payload;
    },
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
    logout: (state) => {
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.countryCode = action.payload.countryCode;
        state.phoneNumber = action.payload.phoneNumber;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token || null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCountryCode, setPhoneNumber, logout } = authSlice.actions;
export default authSlice.reducer;
