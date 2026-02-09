import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../../config/api";
import { apiInstance } from "../../../config/axiosInstance";

// allmedia
export const fetchAllMedia = createAsyncThunk(
  "media/fetchAllMedia",
  async ({ page = 1, limit = 10, search = "" } = {}, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return thunkAPI.rejectWithValue("No token found, please login first.");
    }
    try {
      const url = new URL(`${baseUrl}/api/media/media-types`);
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
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || data.error || "Failed to fetch media types");
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// create Media
export const addMedia = createAsyncThunk(
  "media/addMediaType",
  async ({ name, description }, thunkAPI) => {
    try {
      const res = await apiInstance.post(`${baseUrl}/api/media/media-types`, {
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

// updateMedia
export const updateMedia = createAsyncThunk(
  "media/updateMedia",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/media/media-types/${id}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// deleteMedia
export const deleteMedia = createAsyncThunk(
  "media/deleteMedia",
  async (id, thunkAPI) => {
    try {
      await apiInstance.delete(`${baseUrl}/api/media/media-types/${id}`);
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    mediaTypes: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllMedia.fulfilled, (state, action) => {
        const payload = action.payload || {};
        // prefer payload.mediaTypes but accept common shapes
        state.mediaTypes = payload.mediaTypes || payload.data || payload.items || [];
        const p = payload.pagination || payload.Pagination || {};
        state.pagination = {
          page: p.page || state.pagination.page,
          limit: p.limit || state.pagination.limit,
          totalPages: p.totalPages || state.pagination.totalPages,
          totalRecords: p.totalRecords || state.pagination.totalRecords,
        };
        state.loading = false;
      })
      .addCase(fetchAllMedia.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(addMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(addMedia.fulfilled, (state, action) => {
        const created = action.payload?.data || action.payload?.mediaType || action.payload;
        if (created) state.mediaTypes.unshift(created);
        state.loading = false;
      })
      .addCase(addMedia.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      })
      .addCase(updateMedia.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMedia.fulfilled, (state, action) => {
        const index = state.mediaTypes.findIndex(
          (media) => media.id === action.payload.id
        );
        if (index !== -1) {
          state.mediaTypes[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateMedia.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.loading = false;
      })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.mediaTypes = state.mediaTypes.filter(
          (media) => media.id !== action.payload.id
        );
      });
  },
});

export default mediaSlice.reducer;
