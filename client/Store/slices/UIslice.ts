import { createSlice } from "@reduxjs/toolkit";

interface UiState {
    isModalOpen: boolean;
    isActionSheetOpen: boolean;
    isSelectOpen: boolean;
    modalContent: {
        name: string;
        title: string;
        description: string;
        data: any;
    } | null;
    actionSheetContent: {
        name: string;
    };
    selectContent: {
        name: string;
    };
}
    
const initialState: UiState = {
    isModalOpen: false,
    modalContent:null,
    isActionSheetOpen: false,
    actionSheetContent: {
        name: "",
    },
    isSelectOpen: false,
    selectContent: {
        name: "",
    },
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openModal: (state, action) => {
            state.isModalOpen = true;
            state.modalContent = action.payload;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            state.modalContent = null;
        },
        openActionSheet: (state, action) => {
            state.isActionSheetOpen = true;
            state.actionSheetContent = action.payload;
        },
        closeActionSheet: (state) => {
            state.isActionSheetOpen = false;
            state.actionSheetContent = {
                name: "",
            };
        },
        openSelect: (state, action) => {
            state.isSelectOpen = true;
            state.selectContent = action.payload;
        },
        closeSelect: (state) => {
            state.isSelectOpen = false;
            state.selectContent = {
                name: "",
            };
        },
    },
});

export const { openModal, closeModal, openActionSheet, closeActionSheet, openSelect, closeSelect } = uiSlice.actions;

export default uiSlice.reducer;
