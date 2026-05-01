import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'No-Show';

interface AppointmentState {
  status: AppointmentStatus;
}

const initialState: AppointmentState = {
  status: 'Upcoming',
};

export const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointmentStatus: (state, action: PayloadAction<AppointmentStatus>) => {
      state.status = action.payload;
    },
  },
});

export const { setAppointmentStatus } = appointmentSlice.actions;
export default appointmentSlice.reducer;
