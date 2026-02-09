import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";
import { apiInstance } from "../../config/axiosInstance";

// Fetch all prompt references
export const fetchAllPromptReferences = createAsyncThunk(
  "promptReference/fetchAllPromptReferences",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found, please login first.");
      }

      const response = await fetch(
        `${baseUrl}/api/prompt-reference/all`,
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
          data.message || "Failed to fetch prompt references"
        );
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Create prompt reference
export const createPromptReference = createAsyncThunk(
  "promptReference/createPromptReference",
  async ({ name, details }, thunkAPI) => {
    try {
      const response = await apiInstance.post(
        `${baseUrl}/api/prompt-reference`,
        {
          name,
          details,
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

// Update prompt reference
export const updatePromptReference = createAsyncThunk(
  "promptReference/updatePromptReference",
  async ({ id, name, details }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/prompt-reference/${id}`,
        {
          name,
          details,
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

// Delete prompt reference
export const deletePromptReference = createAsyncThunk(
  "promptReference/deletePromptReference",
  async (id, thunkAPI) => {
    try {
      const response = await apiInstance.delete(
        `${baseUrl}/api/prompt-reference/${id}`
      );
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const promptReferenceSlice = createSlice({
  name: "promptReference",
  initialState: {
    promptReferences: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all prompt references
      .addCase(fetchAllPromptReferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPromptReferences.fulfilled, (state, action) => {
        state.loading = false;
        state.promptReferences = action.payload.data || action.payload.promptReferences || [];
      })
      .addCase(fetchAllPromptReferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Create prompt reference
      .addCase(createPromptReference.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromptReference.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.promptReferences.push(action.payload.data);
        }
      })
      .addCase(createPromptReference.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update prompt reference
      .addCase(updatePromptReference.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromptReference.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.promptReferences.findIndex(
          (r) => String(r.id) === String(action.payload.data?.id || action.payload.id)
        );
        if (index !== -1 && action.payload.data) {
          state.promptReferences[index] = action.payload.data;
        }
      })
      .addCase(updatePromptReference.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Delete prompt reference
      .addCase(deletePromptReference.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromptReference.fulfilled, (state, action) => {
        state.loading = false;
        state.promptReferences = state.promptReferences.filter(
          (r) => String(r.id) !== String(action.payload.id)
        );
      })
      .addCase(deletePromptReference.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError } = promptReferenceSlice.actions;
export default promptReferenceSlice.reducer;

