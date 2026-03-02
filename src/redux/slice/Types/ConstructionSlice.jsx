import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiInstance } from "../../../config/axiosInstance";

// Fetch all constructions
export const fetchConstructions = createAsyncThunk(
    "construction/fetchConstructions",
    async (_, thunkAPI) => {
        try {
            const response = await apiInstance.get("/api/construction/admin/get-all");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Add construction
export const addConstruction = createAsyncThunk(
    "construction/addConstruction",
    async (payload, thunkAPI) => {
        try {
            const response = await apiInstance.post("/api/construction", payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update construction
export const updateConstruction = createAsyncThunk(
    "construction/updateConstruction",
    async ({ id, updatedData }, thunkAPI) => {
        try {
            const response = await apiInstance.put(`/api/construction/${id}`, updatedData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete construction
export const deleteConstruction = createAsyncThunk(
    "construction/deleteConstruction",
    async (id, thunkAPI) => {
        try {
            await apiInstance.delete(`/api/construction/${id}`);
            return { id };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const constructionSlice = createSlice({
    name: "construction",
    initialState: {
        constructions: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchConstructions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConstructions.fulfilled, (state, action) => {
                state.loading = false;
                state.constructions = action.payload.constructions || action.payload.data || action.payload || [];
            })
            .addCase(fetchConstructions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addConstruction.fulfilled, (state, action) => {
                const created = action.payload?.construction || action.payload?.data || action.payload || null;
                if (created) state.constructions.unshift(created);
            })
            .addCase(updateConstruction.fulfilled, (state, action) => {
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const index = state.constructions.findIndex((c) => c.id === updated.id);
                    if (index !== -1) {
                        state.constructions[index] = updated;
                    }
                }
            })
            .addCase(deleteConstruction.fulfilled, (state, action) => {
                state.constructions = state.constructions.filter((c) => c.id !== action.payload.id);
            });
    },
});

export default constructionSlice.reducer;
