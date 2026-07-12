import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    fetchStart: (state) => { state.loading = true; },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStart, fetchSuccess, fetchFailure } = scoringSlice.actions;
export default scoringSlice.reducer;
