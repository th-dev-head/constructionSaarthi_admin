import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiInstance } from "../../config/axiosInstance";
import { baseUrl } from "../../config/api";

export const createHelpCategory = createAsyncThunk(
  "help/createHelpCategory",
  async ({ name, icon, order }, thunkAPI) => {
    try {
      const res = await apiInstance.post(`/api/admin/help/category`, {
        name,
        icon,
        order,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchHelpCategories = createAsyncThunk(
  "help/fetchHelpCategories",
  async (_, thunkAPI) => {
    try {
      const res = await apiInstance.get(`/api/admin/help/categories`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateHelpCategory = createAsyncThunk(
  "help/updateHelpCategory",
  async ({ id, name, icon, order, isActive }, thunkAPI) => {
    try {
      const res = await apiInstance.put(`/api/admin/help/category/${id}`, {
        name,
        icon,
        order,
        isActive,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteHelpCategory = createAsyncThunk(
  "help/deleteHelpCategory",
  async (id, thunkAPI) => {
    try {
      await apiInstance.delete(`/api/admin/help/category/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createHelpFAQ = createAsyncThunk(
  "help/createHelpFAQ",
  async ({ category_id, question, answer, order }, thunkAPI) => {
    try {
      const res = await apiInstance.post(`/api/admin/help/faq`, {
        category_id,
        question,
        answer,
        order,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateHelpFAQ = createAsyncThunk(
  "help/updateHelpFAQ",
  async ({ id, category_id, question, answer, order, isActive }, thunkAPI) => {
    try {
      const res = await apiInstance.put(`/api/admin/help/faq/${id}`, {
        category_id,
        question,
        answer,
        order,
        isActive,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteHelpFAQ = createAsyncThunk(
  "help/deleteHelpFAQ",
  async (id, thunkAPI) => {
    try {
      await apiInstance.delete(`/api/admin/help/faq/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
  lastActionResult: null,
};

const helpSlice = createSlice({
  name: "help",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastAction: (state) => {
      state.lastActionResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHelpCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHelpCategories.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.categories =
          payload?.data ||
          payload?.categories ||
          Array.isArray(payload) ? payload : state.categories;
      })
      .addCase(fetchHelpCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(createHelpCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHelpCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.lastActionResult = action.payload;
        const created =
          action.payload?.data || action.payload?.category || action.payload;
        if (created) {
          state.categories = [created, ...(state.categories || [])];
        }
      })
      .addCase(createHelpCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(updateHelpCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHelpCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.lastActionResult = action.payload;
        const updated =
          action.payload?.data || action.payload?.category || action.payload;
        if (updated?.id != null) {
          state.categories = (state.categories || []).map((c) =>
            c.id === updated.id ? { ...c, ...updated } : c
          );
        }
      })
      .addCase(updateHelpCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(deleteHelpCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHelpCategory.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.categories = (state.categories || []).filter((c) => c.id !== id);
      })
      .addCase(deleteHelpCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(createHelpFAQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHelpFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.lastActionResult = action.payload;
      })
      .addCase(createHelpFAQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(updateHelpFAQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHelpFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.lastActionResult = action.payload;
      })
      .addCase(updateHelpFAQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      .addCase(deleteHelpFAQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHelpFAQ.fulfilled, (state, action) => {
        state.loading = false;
        state.lastActionResult = { deletedId: action.payload };
      })
      .addCase(deleteHelpFAQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { clearError, clearLastAction } = helpSlice.actions;
export default helpSlice.reducer;
