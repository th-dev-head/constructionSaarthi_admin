import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../../config/api";
import { apiInstance } from "../../../config/axiosInstance";

// GET SHIFT TYPES
export const fetchShiftTypes = createAsyncThunk(
  "shiftTypes/fetchShiftTypes",
  async ({ page = 1, limit = 10, search = "" } = {}, thunkAPI) => {
    try {
      const res = await apiInstance.get(`${baseUrl}/api/shift-type`, {
        params: { page, limit, search },
      });
      // return the whole payload so reducer can read shiftTypes and pagination
      return res.data; // expected: { shiftTypes: [...], pagination: { page, limit, totalPages, totalRecords } }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || "Error");
    }
  }
);

// createShift
export const createShift = createAsyncThunk(
  "shiftTypes/createShift",
  async (data, thunkAPI) => {
    try {
      const res = await apiInstance.post(
        `${baseUrl}/api/shift-type/create`,
        data
      );
      return res.data.shiftType; // return the created shift
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error creating shift"
      );
    }
  }
);

// updateShift
export const updateShift = createAsyncThunk(
  "shiftTypes/updateShift",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await apiInstance.put(
        `${baseUrl}/api/shift-type/update/${id}`,
        data
      );
      return res.data; // return the updated shift
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error updating shift"
      );
    }
  }
);

// deleteShift
export const deleteShift = createAsyncThunk(
  "shiftTypes/deleteShift",
  async (id, thunkAPI) => {
    try {
      await apiInstance.delete(`${baseUrl}/api/shift-type/delete/${id}`);
      return id; // return the deleted shift id
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error deleting shift"
      );
    }
  }
);
const shiftTypeSlice = createSlice({
  name: "shiftTypes",
  initialState: {
    list: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalRecords: 0 },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShiftTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShiftTypes.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.list = payload.shiftTypes || payload.data || payload.items || [];
        const p = payload.pagination || payload.Pagination || {};
        state.pagination = {
          page: p.page || state.pagination.page,
          limit: p.limit || state.pagination.limit,
          totalPages: p.totalPages || state.pagination.totalPages,
          totalRecords: p.totalRecords || state.pagination.totalRecords,
        };
      })
      .addCase(fetchShiftTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchShiftTypes, updateShift, deleteShift cases ...
      .addCase(createShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.loading = false;
        // add new shift to the list
        state.list = [action.payload, ...state.list];
      })
      .addCase(createShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.loading = false;
        // update the list with the updated shift
        state.list = state.list.map((shift) =>
          shift.id === action.payload.id ? action.payload : shift
        );
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ...deleteShift cases
      .addCase(deleteShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.loading = false;
        // remove the deleted shift from list
        state.list = state.list.filter((shift) => shift.id !== action.payload);
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default shiftTypeSlice.reducer;
