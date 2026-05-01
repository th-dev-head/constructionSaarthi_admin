import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";
import { apiInstance } from "../../config/axiosInstance";
import {
  markRequestCached,
  shouldSkipCachedRequest,
} from "../utils/fetchCache";

// Fetch all leads
export const fetchAllLeads = createAsyncThunk(
  "lead/fetchAllLeads",
  async ({ page = 1, limit = 10, search = "", startDate = "", endDate = "" } = {}, thunkAPI) => {
    try {
      const response = await apiInstance.get(`${baseUrl}/api/leads/all`, {
        params: {
          page,
          limit,
          search,
          startDate,
          endDate,
        },
      });
      markRequestCached("lead/fetchAllLeads", {
        page,
        limit,
        search,
        startDate,
        endDate,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  },
);

const leadSlice = createSlice({
  name: "lead",
  initialState: {
    leads: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 1,
      totalRecords: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLeads.fulfilled, (state, action) => {
        state.loading = false;
        // Adjust based on typical API response structure in this project
        state.leads = action.payload.leads || action.payload.data || [];

        const payload = action.payload;
        let page, limit, totalRecords, totalPages;

        if (payload.pagination) {
          page = payload.pagination.page || 1;
          limit = payload.pagination.limit || state.pagination.limit;
          totalRecords = payload.pagination.totalCount || payload.pagination.totalRecords || 0;
          totalPages = payload.pagination.totalPages || Math.ceil(totalRecords / limit) || 1;
        } else {
          page = payload.currentPage || payload.page || 1;
          limit = payload.limit || state.pagination.limit;
          totalRecords = payload.totalCount || payload.total || payload.totalRecords || 0;
          totalPages = payload.totalPages || Math.ceil(totalRecords / limit) || 1;
        }

        state.pagination = {
          page,
          limit,
          totalPages,
          totalRecords,
        };
      })
      .addCase(fetchAllLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError } = leadSlice.actions;
export default leadSlice.reducer;
