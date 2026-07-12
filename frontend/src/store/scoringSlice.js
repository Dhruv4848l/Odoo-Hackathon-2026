import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as scoringApi from '../api/scoring.api';

// Default settings used as fallback when API is unavailable (e.g., dev mode with mock token)
const DEFAULT_SETTINGS = {
  envWeight: 0.4,
  socialWeight: 0.3,
  govWeight: 0.3,
  evidenceRequiredForCSR: true,
  evidenceRequiredForCompliance: true,
};

// axiosClient interceptor already unwraps response.data (the full body), so:
// response from axiosClient = { success: true, data: {...} }
// We just need .data to get the actual payload

export const fetchScores = createAsyncThunk(
  'scoring/fetchScores',
  async (_, { rejectWithValue }) => {
    try {
      const body = await scoringApi.getScores();
      return body.data ?? [];
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to load scores');
    }
  }
);

export const fetchSettings = createAsyncThunk(
  'scoring/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const body = await scoringApi.getSettings();
      return body.data ?? DEFAULT_SETTINGS;
    } catch (err) {
      // If API fails (e.g., 401 in dev mode), return defaults so the UI still renders
      return DEFAULT_SETTINGS;
    }
  }
);

const scoringSlice = createSlice({
  name: 'scoring',
  initialState: {
    scores: [],
    settings: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Scores
      .addCase(fetchScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(fetchScores.rejected, (state, action) => {
        state.loading = false;
        state.scores = [];
        state.error = action.payload;
      })

      // Settings — always resolves (defaults on error so screen never gets stuck)
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.loading = false;
        state.settings = DEFAULT_SETTINGS;
      });
  },
});

export default scoringSlice.reducer;
