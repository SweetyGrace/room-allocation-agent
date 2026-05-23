import { createSlice } from "@reduxjs/toolkit";

interface zoomMeetingState {
  meetingData: unknown;
}

const initialState: zoomMeetingState = {
  meetingData: {},
};

const zoomDataSlice = createSlice({
  name: "meetingState",
  initialState,
  reducers: {
    addMeetingData: (state, data) => {
      state.meetingData = data.payload;
    },
  },
});

export const { addMeetingData } = zoomDataSlice.actions;

export default zoomDataSlice.reducer;
