import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../../config/api";
import { apiInstance } from "../../../config/axiosInstance";

export const fetchAllRoles = createAsyncThunk(
  "role/fetchAllRoles",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      const url = new URL(`${baseUrl}/api/admin/getAllRole`);
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
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createRole = createAsyncThunk(
  "role/createRole",
  async (roleData, thunkAPI) => {
    try {
      const response = await apiInstance.post(
        `${baseUrl}/api/admin/role`,
        roleData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "role/deleteRole",
  async (id, thunkAPI) => {
    try {
      const response = await apiInstance.delete(
        `${baseUrl}/api/admin/role/${id}`
      );

      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateRole = createAsyncThunk(
  "role/updateRole",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/admin/role/${id}`,
        updatedData
      );

      return response.data.role; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const rolesSlice = createSlice({
  name: "role",
  initialState: {
    Roles: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 1,
      totalRecords: 0,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllRoles.fulfilled, (state, action) => {
        // API returns { status, message, roles, pagination }
        state.Roles = action.payload.Roles || action.payload.roles || [];
        const p = action.payload.pagination || action.payload.Pagination || {};
        state.pagination = {
          page: p.page || 1,
          limit: p.limit || state.pagination.limit,
          totalPages: p.totalPages || 1,
          totalRecords: p.totalRecords || 0,
        };
        state.loading = false;
      })
      .addCase(fetchAllRoles.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.Roles.push(action.payload.role); 
      })

      .addCase(deleteRole.fulfilled, (state, action) => {
        const role = state.Roles.find((r) => r.id === action.payload.id);
        if (role) role.isDeleted = true; 
      });
  },
});

export default rolesSlice.reducer;
