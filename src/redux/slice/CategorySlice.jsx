import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiInstance } from "../../config/axiosInstance";
import {
    markRequestCached,
    shouldSkipCachedRequest,
} from "../utils/fetchCache";

// Fetch all global categories
export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, thunkAPI) => {
        try {
            const response = await apiInstance.get("/api/category/global");
            markRequestCached("category/fetchCategories", {});
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    },
    {
        condition: (arg = {}, { getState }) => {
            const state = getState()?.category;
            return !shouldSkipCachedRequest({
                prefix: "category/fetchCategories",
                params: { force: arg?.force },
                hasData: Array.isArray(state?.categories) && state.categories.length > 0,
                isLoading: state?.loading,
            });
        },
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

// Delete category
export const deleteCategory = createAsyncThunk(
    "category/deleteCategory",
    async (id, thunkAPI) => {
        try {
            const response = await apiInstance.delete(`/api/category/delete/${id}`);
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
                state.categories = Array.isArray(action.payload?.categories) 
                    ? action.payload.categories 
                    : Array.isArray(action.payload) 
                        ? action.payload 
                        : [];
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addCategory.fulfilled, (state, action) => {
                const newCategory = action.payload?.category || action.payload;
                if (newCategory) {
                    state.categories.unshift(newCategory);
                }
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const updatedCategory = action.payload?.category || action.payload;
                if (updatedCategory) {
                    const index = state.categories.findIndex(c => c.id === updatedCategory.id);
                    if (index !== -1) {
                        state.categories[index] = updatedCategory;
                    }
                }
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                // Since the action.payload might just be a message, we use the arg passed to thunk
                // But createAsyncThunk fulfilled action has 'meta.arg' which contains the id
                const id = action.meta.arg;
                state.categories = state.categories.filter(c => c.id !== id);
            });
    },
});

export default categorySlice.reducer;
