import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";
import { apiInstance } from "../../config/axiosInstance";

// Fetch all calculation formulas with pagination
export const fetchAllFormulas = createAsyncThunk(
  "calculationFormula/fetchAllFormulas",
  async (params, thunkAPI) => {
    try {
      const response = await apiInstance.get(`${baseUrl}/api/calculation-formula`, { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Create calculation formula
export const createFormula = createAsyncThunk(
  "calculationFormula/createFormula",
  async (formulaData, thunkAPI) => {
    try {
      const response = await apiInstance.post(
        `${baseUrl}/api/calculation-formula/create`,
        formulaData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Update calculation formula
export const updateFormula = createAsyncThunk(
  "calculationFormula/updateFormula",
  async ({ id, ...formulaData }, thunkAPI) => {
    try {
      const response = await apiInstance.put(
        `${baseUrl}/api/calculation-formula/${id}`,
        formulaData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Delete calculation formula
export const deleteFormula = createAsyncThunk(
  "calculationFormula/deleteFormula",
  async (id, thunkAPI) => {
    try {
      await apiInstance.delete(`${baseUrl}/api/calculation-formula/${id}`);
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const calculationFormulaSlice = createSlice({
  name: "calculationFormula",
  initialState: {
    formulas: [],
    loading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      itemsPerPage: 10
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all formulas
      .addCase(fetchAllFormulas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFormulas.fulfilled, (state, action) => {
        state.loading = false;
        state.formulas = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAllFormulas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Create formula
      .addCase(createFormula.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFormula.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.formulas.unshift(action.payload.data);
        } else {
          state.formulas.unshift(action.payload);
        }
      })
      .addCase(createFormula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update formula
      .addCase(updateFormula.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFormula.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFormula = action.payload.data || action.payload;
        const index = state.formulas.findIndex(
          (f) => String(f.id) === String(updatedFormula.id)
        );
        if (index !== -1) {
          state.formulas[index] = updatedFormula;
        }
      })
      .addCase(updateFormula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Delete formula
      .addCase(deleteFormula.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFormula.fulfilled, (state, action) => {
        state.loading = false;
        state.formulas = state.formulas.filter(
          (f) => String(f.id) !== String(action.payload.id)
        );
      })
      .addCase(deleteFormula.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearError } = calculationFormulaSlice.actions;
export default calculationFormulaSlice.reducer;
