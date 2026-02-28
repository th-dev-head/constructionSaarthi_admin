import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseUrl } from "../../config/api";
import { apiInstance } from "../../config/axiosInstance";

// Fetch all banners
export const fetchAllBanners = createAsyncThunk(
    "banner/fetchAllBanners",
    async (_, thunkAPI) => {
        try {
            const response = await apiInstance.get("/api/banner-content");
            // The API response matches the structure provided by the user: { success: true, count: 2, data: [...] }
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Add banner
export const addBanner = createAsyncThunk(
    "banner/addBanner",
    async (formData, thunkAPI) => {
        try {
            const response = await apiInstance.post("/api/banner-content", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update banner
export const updateBanner = createAsyncThunk(
    "banner/updateBanner",
    async ({ id, formData }, thunkAPI) => {
        try {
            // PUT request for update, also uses multipart/form-data for image
            const response = await apiInstance.put(`/api/banner-content/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete banner
export const deleteBanner = createAsyncThunk(
    "banner/deleteBanner",
    async (id, thunkAPI) => {
        try {
            await apiInstance.delete(`/api/banner-content/${id}`);
            return { id };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const bannerSlice = createSlice({
    name: "banner",
    initialState: {
        banners: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all banners
            .addCase(fetchAllBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload.data || [];
            })
            .addCase(fetchAllBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add banner
            .addCase(addBanner.pending, (state) => {
                state.loading = true;
            })
            .addCase(addBanner.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success) {
                    // We'll re-fetch anyway, but can update locally if needed
                }
            })
            .addCase(addBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete banner
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.banners = state.banners.filter((b) => b.id !== action.payload.id);
            });
    },
});

export default bannerSlice.reducer;
