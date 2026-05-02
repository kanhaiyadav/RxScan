import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Reminder } from "@/types/domain";

interface RemindersState {
  items: Reminder[];
}

const initialState: RemindersState = {
  items: [],
};

const remindersSlice = createSlice({
  name: "reminders",
  initialState,
  reducers: {
    addReminder(state, action: PayloadAction<Reminder>) {
      state.items.push(action.payload);
    },
    markReminder(state, action: PayloadAction<{ id: string; status: Reminder["status"] }>) {
      const reminder = state.items.find((item) => item.id === action.payload.id);
      if (reminder) reminder.status = action.payload.status;
    },
    removeReminder(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addReminder, markReminder, removeReminder } = remindersSlice.actions;
export default remindersSlice.reducer;
