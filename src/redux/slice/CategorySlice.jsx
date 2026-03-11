import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiInstance } from "../../config/axiosInstance";

// Fetch all global categories
export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, thunkAPI) => {
        try {
            const response = await apiInstance.get("/api/category/global");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Create category
export const addCategory = createAsyncThunk(
    "category/addCategory",
    async (payload, thunkAPI) => {
        try {
            const response = await apiInstance.post("/api/category/create", payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update category
export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async ({ id, payload }, thunkAPI) => {
        try {
            // Endpoint typically follows standard pattern: PUT /api/category/update/:id
            // Based on previous patterns in this codebase
            const response = await apiInstance.put(`/api/category/update/${id}`, payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState: {
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.categories || action.payload || [];
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default categorySlice.reducer;
