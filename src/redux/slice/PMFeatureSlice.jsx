import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";
import { apiInstance } from "../../config/axiosInstance";

// Fetch all PM features
export const fetchAllPMFeatures = createAsyncThunk(
  "pmFeature/fetchAllPMFeatures",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found, please login first.");
      }

      const url = new URL(`${baseUrl}/api/PMFeature`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to fetch PM features"
        );
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Create PM feature
export const createPMFeature = createAsyncThunk(
  "pmFeature/createPMFeature",
  async ({ feature }, thunkAPI) => {
    try {
      const response = await apiInstance.post(
        `${baseUrl}/api/PMFeature`,
        {
          feature,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Get PM feature by ID
export const getPMFeatureById = createAsyncThunk(
  "pmFeature/getPMFeatureById",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found, please login first.");
      }

      const response = await fetch(
        `${baseUrl}/api/PMFeature/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to fetch PM feature"
        );
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update PM feature
export const updatePMFeature = createAsyncThunk(
  "pmFeature/updatePMFeature",
  async ({ id, feature }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/PMFeature/${id}`,
        {
          feature,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Delete PM feature
export const deletePMFeature = createAsyncThunk(
  "pmFeature/deletePMFeature",
  async (id, thunkAPI) => {
    try {
      const response = await apiInstance.delete(
        `${baseUrl}/api/PMFeature/${id}`
      );
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const pmFeatureSlice = createSlice({
  name: "pmFeature",
  initialState: {
    pmFeatures: [],
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all PM features
      .addCase(fetchAllPMFeatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPMFeatures.fulfilled, (state, action) => {
        state.loading = false;
        state.pmFeatures = action.payload.data || action.payload.features || action.payload || [];
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.limit = action.payload.limit || 10;
      })
      .addCase(fetchAllPMFeatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Create PM feature
      .addCase(createPMFeature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPMFeature.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.pmFeatures.push(action.payload.data);
        }
      })
      .addCase(createPMFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update PM feature
      .addCase(updatePMFeature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePMFeature.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pmFeatures.findIndex(
          (f) => String(f.id) === String(action.payload.data?.id || action.payload.id)
        );
        if (index !== -1 && action.payload.data) {
          state.pmFeatures[index] = action.payload.data;
        }
      })
      .addCase(updatePMFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Delete PM feature
      .addCase(deletePMFeature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePMFeature.fulfilled, (state, action) => {
        state.loading = false;
        state.pmFeatures = state.pmFeatures.filter(
          (f) => String(f.id) !== String(action.payload.id)
        );
      })
      .addCase(deletePMFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError } = pmFeatureSlice.actions;
export default pmFeatureSlice.reducer;

