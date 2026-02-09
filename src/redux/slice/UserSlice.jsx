import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";
import { apiInstance } from "../../config/axiosInstance";

// Fetch all users with optional filters
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async ({ page = 1, limit = 10, search = "", role_id = null } = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found, please login first.");
      }

      const url = new URL(`${baseUrl}/api/admin/users`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);
      
      if (search) {
        url.searchParams.append("search", search);
      }
      
      // Only add role_id if it's provided (not null/undefined)
      if (role_id) {
        url.searchParams.append("role_id", role_id);
      }

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
          data.message || "Failed to fetch users"
        );
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Reset user password
export const resetUserPassword = createAsyncThunk(
  "user/resetUserPassword",
  async ({ userId, password, confirmPassword }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/admin/users/${userId}/reset-password`,
        {
          password,
          confirmPassword,
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

// Suspend/Activate user
export const suspendUser = createAsyncThunk(
  "user/suspendUser",
  async ({ userId, action }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/admin/user/suspend`,
        {
          user_id: userId,
          action, // "suspend" or "activate"
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

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (userId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found, please login first.");
      }

      const response = await fetch(
        `${baseUrl}/api/admin/getUserByID/${userId}`,
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
          data.message || "Failed to fetch user"
        );
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 1,
      totalRecords: 0,
    },
    resetPasswordLoading: false,
    suspendUserLoading: false,
    userProfile: null,
    userProfileLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response structures
        state.users = action.payload.users || action.payload.data || [];
        
        // Handle pagination - API can return it in different formats
        const payload = action.payload;
        let page, limit, totalRecords, totalPages;
        
        if (payload.pagination) {
          // If pagination object exists
          page = payload.pagination.page || payload.pagination.currentPage || payload.page || payload.currentPage || 1;
          limit = payload.pagination.limit || payload.limit || state.pagination.limit;
          totalRecords = payload.pagination.totalRecords || payload.pagination.total || payload.total || 0;
          totalPages = payload.pagination.totalPages || payload.totalPages || Math.ceil(totalRecords / limit) || 1;
        } else {
          // Direct fields in response - handle both formats
          // Format 1: { page, limit, total, totalPages }
          // Format 2: { currentPage, limit, total, totalPages }
          page = payload.currentPage || payload.page || 1;
          limit = payload.limit || state.pagination.limit;
          totalRecords = payload.total || payload.totalRecords || 0;
          // Use totalPages from API if available, otherwise calculate
          totalPages = payload.totalPages || Math.ceil(totalRecords / limit) || 1;
        }
        
        state.pagination = {
          page,
          limit,
          totalPages,
          totalRecords,
        };
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Reset password
      .addCase(resetUserPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.error = action.payload || action.error.message;
      })
      // Suspend user
      .addCase(suspendUser.pending, (state) => {
        state.suspendUserLoading = true;
        state.error = null;
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        state.suspendUserLoading = false;
        // Immediately update the user's is_active status in the users array
        const userId = action.meta.arg.userId;
        const actionType = action.meta.arg.action; // "suspend" or "activate"
        const newIsActive = actionType === "activate";
        
        // Update in users array
        const userIndex = state.users.findIndex(
          (user) => String(user.id) === String(userId) || String(user.uid) === String(userId)
        );
        if (userIndex !== -1) {
          state.users[userIndex].is_active = newIsActive;
        }
        
        // Also update userProfile if it matches
        if (state.userProfile && (String(state.userProfile.id) === String(userId))) {
          state.userProfile.is_active = newIsActive;
        }
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.suspendUserLoading = false;
        state.error = action.payload || action.error.message;
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.userProfileLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.userProfileLoading = false;
        state.userProfile = action.payload.user || action.payload.data || null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.userProfileLoading = false;
        state.error = action.payload || action.error.message;
        state.userProfile = null;
      });
  },
});

export const { clearError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;

