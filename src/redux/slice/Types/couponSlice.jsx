import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../../config/api";

// Async thunk to create a new coupon
export const createCoupon = createAsyncThunk(
  "coupon/createCoupon",
  async ({ name }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token found");

      const res = await fetch(`${baseUrl}/api/coupon-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to create coupon"
        );
      }

      return data.couponType || data;
    } catch (err) {
      console.error("Error in createCoupon:", err);
      return thunkAPI.rejectWithValue(
        err.message || "Network error occurred"
      );
    }
  }
);

export const updateCouponType = createAsyncThunk(
  "coupon/updateCouponType",
  async ({ id, name }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token found");

      const res = await fetch(`${baseUrl}/api/coupon-type/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to update coupon type"
        );
      }

      return { id, ...data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteCouponType = createAsyncThunk(
  "coupon/deleteCouponType",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token found");

      const res = await fetch(`${baseUrl}/api/coupon-type/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to delete coupon type"
        );
      }

      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchCoupons = createAsyncThunk(
  "coupon/fetchCoupons",
  async ({ page = 1, limit = 10, search = "" }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token found");

      // Build URL with query parameters
      let url = `${baseUrl}/api/coupon-type/getAllCoupon?page=${page}&limit=${limit}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      console.log("Fetching from URL:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to fetch coupons"
        );
      }

      // Handle different API response structures
      let coupons = [];
      let paginationData = {};

      if (Array.isArray(data)) {
        // If response is directly an array (no pagination)
        coupons = data;
        paginationData = {
          currentPage: 1,
          limit: limit,
          totalRecords: data.length,
          totalPages: 1
        };
      } else if (data.couponTypes && Array.isArray(data.couponTypes)) {
        // If response has couponTypes array
        coupons = data.couponTypes;
        paginationData = {
          currentPage: data.currentPage || page,
          limit: data.limit || limit,
          totalRecords: data.totalRecords || data.total || coupons.length,
          totalPages: data.totalPages || Math.ceil((data.totalRecords || coupons.length) / limit)
        };
      } else if (data.data && Array.isArray(data.data)) {
        // If response has data array
        coupons = data.data;
        paginationData = {
          currentPage: data.currentPage || data.page || page,
          limit: data.limit || limit,
          totalRecords: data.totalRecords || data.total || coupons.length,
          totalPages: data.totalPages || Math.ceil((data.totalRecords || coupons.length) / limit)
        };
      } else {
        console.warn("Unexpected API response structure:", data);
        coupons = [];
        paginationData = {
          currentPage: page,
          limit: limit,
          totalRecords: 0,
          totalPages: 0
        };
      }

      return {
        coupons,
        pagination: paginationData
      };
    } catch (err) {
      console.error("Error in fetchCoupons:", err);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    couponList: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      limit: 10,
      totalRecords: 0,
      totalPages: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.couponList = [action.payload, ...state.couponList];
          // Update total records count
          state.pagination.totalRecords += 1;
        }
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Coupon Type
      .addCase(updateCouponType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCouponType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.couponList.findIndex(coupon => coupon.id === action.payload.id);
        if (index !== -1) {
          state.couponList[index] = { ...state.couponList[index], ...action.payload };
        }
      })
      .addCase(updateCouponType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Coupon Type
      .addCase(deleteCouponType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCouponType.fulfilled, (state, action) => {
        state.loading = false;
        state.couponList = state.couponList.filter(coupon => coupon.id !== action.payload);
        // Update total records count
        state.pagination.totalRecords = Math.max(0, state.pagination.totalRecords - 1);
      })
      .addCase(deleteCouponType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.couponList = Array.isArray(action.payload.coupons) ? action.payload.coupons : [];
        state.pagination = { ...state.pagination, ...action.payload.pagination };
        console.log("Updated state:", {
          couponList: state.couponList,
          pagination: state.pagination
        });
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.couponList = [];
        state.pagination = {
          currentPage: 1,
          limit: 10,
          totalRecords: 0,
          totalPages: 0
        };
      });
  },
});

export const { clearError, setPagination } = couponSlice.actions;
export default couponSlice.reducer;