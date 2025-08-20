import { UserHealthProfile } from "@/context/UserHealthContext";
import { createSlice, createSelector } from "@reduxjs/toolkit";

interface HealthProfileState {
    data: UserHealthProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: HealthProfileState = {
    data: null,
    loading: false,
    error: null,
};

const healthProfileSlice = createSlice({
    name: "healthProfile",
    initialState,
    reducers: {
        setProfile: (state, action) => {
            state.data = action.payload;
        },
    },
});

export const selectHealthProfile = (state: { healthProfile: HealthProfileState }) => state.healthProfile.data;

export const {
    setProfile,
} = healthProfileSlice.actions;

export default healthProfileSlice.reducer;
