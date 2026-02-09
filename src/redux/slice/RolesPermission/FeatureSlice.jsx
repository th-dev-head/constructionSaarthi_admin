import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../../config/api";
import { apiInstance } from "../../../config/axiosInstance";

export const fetchAllFeature = createAsyncThunk(
  "role/fetchAllFeature",
  async ({ page = 1, limit = 10, search = "" } = {}, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return thunkAPI.rejectWithValue("No token found, please login first.");
    }
    try {
      const url = new URL(`${baseUrl}/api/admin/getfeatures`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);
      if (search) url.searchParams.append("search", search);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addFeature = createAsyncThunk(
  "feature/addFeature",
  async ({ name, description }, thunkAPI) => {
    try {
      const res = await apiInstance.post(`${baseUrl}/api/admin/feature`, {
        name,
        description,
      });
      return res.data; 
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateFeature = createAsyncThunk(
  "feature/updateFeature",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/admin/feature/${id}`,
        updatedData
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFeature = createAsyncThunk(
  "feature/deleteFeature",
  async (id, thunkAPI) => {
    try {
      await apiInstance.delete(`${baseUrl}/api/admin/feature/${id}`);
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const featureSlice = createSlice({
  name: "feature",
  initialState: {
    Features: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFeature.pending, (state) => {
        console.log("Fetching features...");
        state.loading = true;
      })
      .addCase(fetchAllFeature.fulfilled, (state, action) => {
        console.log("Features fetched successfully:", action.payload);
        state.Features = action.payload.features || action.payload.Features || [];
        const p = action.payload.pagination || action.payload.Pagination || {};
        state.pagination = {
          page: p.page || state.pagination.page,
          limit: p.limit || state.pagination.limit,
          totalPages: p.totalPages || 1,
          totalRecords: p.totalRecords || 0,
        };
        state.loading = false;
      })
      .addCase(fetchAllFeature.rejected, (state, action) => {
        console.log("Error fetching features:", action.error);
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(addFeature.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFeature.fulfilled, (state, action) => {
        state.Features.push(action.payload);
        state.loading = false;
      })
      .addCase(addFeature.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      })
      .addCase(deleteFeature.fulfilled, (state, action) => {
        state.Features = state.Features.filter(
          (feature) => feature.id !== action.payload.id
        );
      });
  },
});

export default featureSlice.reducer;
