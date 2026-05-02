import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { Prescription, PrescriptionData, PrescriptionStatus } from "@/types/domain";

interface PrescriptionsState {
  items: Prescription[];
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPrescriptions = createAsyncThunk("prescriptions/fetch", async () => api.getPrescriptions());
export const createPrescription = createAsyncThunk(
  "prescriptions/create",
  async (payload: { ocrResult: PrescriptionData; searchResult: Record<string, unknown>; image: string; object_key: string }) => api.createPrescription(payload)
);
export const updatePrescriptionStatus = createAsyncThunk(
  "prescriptions/status",
  async (payload: { id: string; status: PrescriptionStatus }) => api.updatePrescriptionStatus(payload.id, payload.status)
);
export const deletePrescription = createAsyncThunk("prescriptions/delete", async (id: string) => {
  await api.deletePrescription(id);
  return id;
});

const prescriptionsSlice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {
    addPrescriptionLocally(state, action: PayloadAction<Prescription>) {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load prescriptions";
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updatePrescriptionStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.$id === action.payload.$id);
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.$id !== action.payload);
      });
  },
});

export const { addPrescriptionLocally } = prescriptionsSlice.actions;
export default prescriptionsSlice.reducer;
