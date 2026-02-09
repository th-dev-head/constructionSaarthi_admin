import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../../config/api";
import { apiInstance } from "../../../config/axiosInstance";

export const fetchAllPermission = createAsyncThunk(
  "permission/fetchAllPermission",
  async ({ page = 1, limit = 10, search = "" } = {}, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return thunkAPI.rejectWithValue("No token found, please login first.");
    }
    try {
      const url = new URL(`${baseUrl}/api/admin/getAllPermission`);
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

export const addPermission = createAsyncThunk(
  "permission/addPermission",
  async (payload, thunkAPI) => {
    try {
      const response = await apiInstance.post(
        `${baseUrl}/api/admin/permission`,
        payload
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const updatePermission = createAsyncThunk(
  "permission/updatePermission",
  async ({ id, payload }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/admin/permission/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const deletePermission = createAsyncThunk(
  "permission/deletePermission",
  async (id, thunkAPI) => {
    try {
      const response = await apiInstance.delete(
        `${baseUrl}/api/admin/permission/${id}`
      );

      // Backend returns "status:false" so fail manually
      if (!response.data?.status) {
        return thunkAPI.rejectWithValue("Server rejected delete request");
      }

      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const permissionSlice = createSlice({
  name: "permission",
  initialState: {
    Permissions: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPermission.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPermission.fulfilled, (state, action) => {
        state.Permissions = action.payload.permissions || action.payload.Permissions || [];
        const p = action.payload.pagination || action.payload.Pagination || {};
        state.pagination = {
          page: p.page || state.pagination.page,
          limit: p.limit || state.pagination.limit,
          totalPages: p.totalPages || 1,
          totalRecords: p.totalRecords || 0,
        };
        state.loading = false;
      })
      .addCase(fetchAllPermission.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      .addCase(addPermission.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPermission.fulfilled, (state, action) => {
        state.Permissions.push(action.payload);
        state.loading = false;
      })
      .addCase(addPermission.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.Permissions = state.Permissions.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
        state.loading = false;
      })

      .addCase(deletePermission.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default permissionSlice.reducer;
