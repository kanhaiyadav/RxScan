import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { HealthProfile } from "@/types/domain";

interface HealthProfileState {
  profile: HealthProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: HealthProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchHealthProfile = createAsyncThunk("healthProfile/fetch", async () => api.getHealthProfile());
export const saveHealthProfile = createAsyncThunk("healthProfile/save", async (profile: HealthProfile) => api.saveHealthProfile(profile));

const healthProfileSlice = createSlice({
  name: "healthProfile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHealthProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchHealthProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load health profile";
      })
      .addCase(saveHealthProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export default healthProfileSlice.reducer;
