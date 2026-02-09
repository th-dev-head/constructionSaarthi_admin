import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../../config/api";
import { apiInstance } from "../../../config/axiosInstance";

// all gavge type
export const fetchAllGavge = createAsyncThunk(
  "gavge/fetchAllGavge",
  async ({ page = 1, limit = 10, search = "" } = {}, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return thunkAPI.rejectWithValue("No token found, please login first.");
    }
    try {
      const url = new URL(`${baseUrl}/api/gauge-type/all`);
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
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || data.error || "Failed to fetch gauge types");
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// create gavge type
export const addGavgeType = createAsyncThunk(
  "gavge/addGavgeType",
  async (payload, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) return thunkAPI.rejectWithValue("No token found");

    try {
      const response = await fetch(`${baseUrl}/api/gauge-type/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok)
        return thunkAPI.rejectWithValue(data.message || "Create failed");

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// updateGavge
export const updateGavge = createAsyncThunk(
  "gavge/updateGavge",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/gauge-type/update/${id}`,
        updatedData
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// deleteGavge
export const deleteGavge = createAsyncThunk(
  "gavge/deleteGavge",
  async (id, thunkAPI) => {
    try {
      await apiInstance.delete(`${baseUrl}/api/gauge-type/delete/${id}`);
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const gavgeSlice = createSlice({
  name: "gavge",
  initialState: {
    Gavges: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllGavge.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllGavge.fulfilled, (state, action) => {
        // backend may return `gaugeTypes` (correct spelling) or `gavgeTypes` (typo),
        // accept both and several common shapes.
        const payload = action.payload || {};
        state.Gavges =
          payload.gaugeTypes || payload.gavgeTypes || payload.data || payload.items || [];
        const p = payload.pagination || payload.Pagination || {};
        state.pagination = {
          page: p.page || state.pagination.page,
          limit: p.limit || state.pagination.limit,
          totalPages: p.totalPages || state.pagination.totalPages,
          totalRecords: p.totalRecords || state.pagination.totalRecords,
        };
        state.loading = false;
      })
      .addCase(fetchAllGavge.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(addGavgeType.fulfilled, (state, action) => {
        // action.payload may include created item in different shapes
        const created = action.payload?.data || action.payload?.gaugeType || action.payload || null;
        if (created) state.Gavges.unshift(created);
      })
      .addCase(deleteGavge.fulfilled, (state, action) => {
        state.Gavges = state.Gavges.filter((g) => g.id !== action.payload.id);
      });
  },
});

export default gavgeSlice.reducer;
