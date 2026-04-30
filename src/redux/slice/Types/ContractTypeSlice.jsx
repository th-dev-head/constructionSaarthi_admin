import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiInstance } from "../../../config/axiosInstance";
import {
    markRequestCached,
    shouldSkipCachedRequest,
} from "../../utils/fetchCache";

// Fetch all contract types
export const fetchContractTypes = createAsyncThunk(
    "contractType/fetchContractTypes",
    async (_, thunkAPI) => {
        try {
            const response = await apiInstance.get("/api/contract-type/admin/get-all");
            markRequestCached("contractType/fetchContractTypes", {});
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    },
    {
        condition: (arg = {}, { getState }) => {
            const state = getState()?.contractType;
            return !shouldSkipCachedRequest({
                prefix: "contractType/fetchContractTypes",
                params: { force: arg?.force },
                hasData: Array.isArray(state?.contractTypes) && state.contractTypes.length > 0,
                isLoading: state?.loading,
            });
        },
    }
);

// Add contract type
export const addContractType = createAsyncThunk(
    "contractType/addContractType",
    async (payload, thunkAPI) => {
        try {
            const response = await apiInstance.post("/api/contract-type", payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update contract type
export const updateContractType = createAsyncThunk(
    "contractType/updateContractType",
    async ({ id, updatedData }, thunkAPI) => {
        try {
            const response = await apiInstance.put(`/api/contract-type/${id}`, updatedData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete contract type
export const deleteContractType = createAsyncThunk(
    "contractType/deleteContractType",
    async (id, thunkAPI) => {
        try {
            await apiInstance.delete(`/api/contract-type/${id}`);
            return { id };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const contractTypeSlice = createSlice({
    name: "contractType",
    initialState: {
        contractTypes: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchContractTypes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContractTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.contractTypes = action.payload.contractTypes || action.payload.data || action.payload || [];
            })
            .addCase(fetchContractTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addContractType.fulfilled, (state, action) => {
                const created = action.payload?.contractType || action.payload?.data || action.payload || null;
                if (created) state.contractTypes.unshift(created);
            })
            .addCase(updateContractType.fulfilled, (state, action) => {
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const index = state.contractTypes.findIndex((c) => c.id === updated.id);
                    if (index !== -1) {
                        state.contractTypes[index] = updated;
                    }
                }
            })
            .addCase(deleteContractType.fulfilled, (state, action) => {
                state.contractTypes = state.contractTypes.filter((c) => c.id !== action.payload.id);
            });
    },
});

export default contractTypeSlice.reducer;
