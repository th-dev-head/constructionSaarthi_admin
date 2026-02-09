import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";
import { apiInstance } from "../../config/axiosInstance";

// Fetch all prompts
export const fetchAllPrompts = createAsyncThunk(
  "prompt/fetchAllPrompts",
  async ({ includeDeleted = false, onlyActive = true, feature_id = null } = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return thunkAPI.rejectWithValue("No token found, please login first.");
      }

      const url = new URL(`${baseUrl}/api/prompt`);
      url.searchParams.append("includeDeleted", includeDeleted);
      url.searchParams.append("onlyActive", onlyActive);
      if (feature_id) {
        url.searchParams.append("feature_id", feature_id);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return thunkAPI.rejectWithValue(
          data.message || "Failed to fetch prompts"
        );
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Fetch single prompt by ID
export const fetchPromptById = createAsyncThunk(
  "prompt/fetchPromptById",
  async (id, thunkAPI) => {
    try {
      const response = await apiInstance.get(`${baseUrl}/api/prompt/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Create prompt
export const createPrompt = createAsyncThunk(
  "prompt/createPrompt",
  async ({ title, prompt, variables, type, feature_id }, thunkAPI) => {
    try {
      const response = await apiInstance.post(
        `${baseUrl}/api/prompt/create`,
        {
          title,
          prompt,
          variables,
          type,
          feature_id,
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

// Update prompt
export const updatePrompt = createAsyncThunk(
  "prompt/updatePrompt",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/prompt/${id}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Delete prompt
export const deletePrompt = createAsyncThunk(
  "prompt/deletePrompt",
  async (id, thunkAPI) => {
    try {
      const response = await apiInstance.delete(
        `${baseUrl}/api/prompt/${id}`
      );
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const promptSlice = createSlice({
  name: "prompt",
  initialState: {
    prompts: [],
    currentPrompt: null,
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
      // Fetch all prompts
      .addCase(fetchAllPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = action.payload.data || action.payload.prompts || [];
      })
      .addCase(fetchAllPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Fetch prompt by ID
      .addCase(fetchPromptById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromptById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrompt = action.payload.data || action.payload.prompt || action.payload;
      })
      .addCase(fetchPromptById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Create prompt
      .addCase(createPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data?.prompt) {
          state.prompts.push(action.payload.data.prompt);
        }
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update prompt
      .addCase(updatePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrompt.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.prompts.findIndex(
          (p) => p.id === action.payload.data?.id
        );
        if (index !== -1) {
          state.prompts[index] = action.payload.data;
        }
      })
      .addCase(updatePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Delete prompt
      .addCase(deletePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = state.prompts.filter(
          (p) => String(p.prompt_id) !== String(action.payload.id) && String(p.id) !== String(action.payload.id)
        );
      })
      .addCase(deletePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError } = promptSlice.actions;
export default promptSlice.reducer;

