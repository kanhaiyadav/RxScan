import {
    createSlice,
    createEntityAdapter,
    createSelector,
} from "@reduxjs/toolkit";
import { Prescription } from "@/types/prescription";
import { RootState } from "../store";

interface PrescriptionState {
    isLoading: boolean;
    error: string | null;
    lastFetch: string | null;
}

const prescriptionAdapter = createEntityAdapter({
    // Sort prescriptions by creation date (newest first)
    sortComparer: (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime(),

    // Custom ID selector (if your ID field isn't named 'id')
    selectId: (prescription: Prescription) => prescription.$id,
});

const prescriptionSlice = createSlice({
    name: "prescription",
    initialState: prescriptionAdapter.getInitialState<PrescriptionState>({
        isLoading: true,
        error: null,
        lastFetch: null,
    }),
    reducers: {
        addPrescription: prescriptionAdapter.addOne,
        addManyPrescriptions: prescriptionAdapter.addMany,
        updatePrescription: prescriptionAdapter.updateOne,
        removePrescription: prescriptionAdapter.removeOne,
        deletePrescription: prescriptionAdapter.removeOne,
        deleteManyPrescriptions: prescriptionAdapter.removeMany,
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setPrescriptionStatus: (state, action) => {
            const { prescriptionId, status } = action.payload;
            const existingPrescription = state.entities[prescriptionId];
            if (existingPrescription) {
                existingPrescription.status = status;
            }
        }
    },
    extraReducers: (builder) => {
        // Add your extra reducers here
    },
});

export const {
    addPrescription,
    addManyPrescriptions,
    updatePrescription,
    removePrescription,
    deletePrescription,
    deleteManyPrescriptions,
    setPrescriptionStatus,
    setLoading,
} = prescriptionSlice.actions;

export const {
    selectAll: selectAllPrescriptions,
    selectById: selectPrescriptionById,
    selectIds: selectPrescriptionIds,
    selectEntities: selectPrescriptionEntities,
    selectTotal: selectTotalPrescriptions,
} = prescriptionAdapter.getSelectors((state: RootState) => state.prescription);

export const selectActivePrescription = createSelector(
    [selectPrescriptionEntities], // Your existing entities selector
    (entities) =>
        Object.values(entities).filter((entity) => entity.status === "active")
);

export const selectPrescriptionLoading = (state: RootState) =>
    state.prescription.isLoading;

export default prescriptionSlice.reducer;