import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as socialApi from '../api/social.api';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchCSRActivities = createAsyncThunk(
  'social/fetchCSRActivities',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await socialApi.getCSRActivities(filters);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createCSRActivity = createAsyncThunk(
  'social/createCSRActivity',
  async (payload, { rejectWithValue }) => {
    try {
      return await socialApi.createCSRActivity(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchChallenges = createAsyncThunk(
  'social/fetchChallenges',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await socialApi.getChallenges(filters);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchParticipations = createAsyncThunk(
  'social/fetchParticipations',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await socialApi.getParticipations(filters);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const approveParticipation = createAsyncThunk(
  'social/approveParticipation',
  async ({ id, decision }, { rejectWithValue }) => {
    try {
      return await socialApi.approveParticipation(id, decision);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'social/fetchLeaderboard',
  async ({ type, deptId } = {}, { rejectWithValue }) => {
    try {
      return await socialApi.getLeaderboard(type, deptId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchRewards = createAsyncThunk(
  'social/fetchRewards',
  async (_, { rejectWithValue }) => {
    try {
      return await socialApi.getRewards();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const redeemReward = createAsyncThunk(
  'social/redeemReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      return await socialApi.redeemReward(rewardId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyBadges = createAsyncThunk(
  'social/fetchMyBadges',
  async (_, { rejectWithValue }) => {
    try {
      return await socialApi.getMyBadges();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const joinChallenge = createAsyncThunk(
  'social/joinChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      return await socialApi.joinChallenge(challengeId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const signupForActivity = createAsyncThunk(
  'social/signupForActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      return await socialApi.signupForActivity(activityId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const initialState = {
  csrActivities: [],
  challenges: [],
  participations: [],
  leaderboard: [],
  rewards: [],
  myBadges: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    // CSR Activities
    builder
      .addCase(fetchCSRActivities.pending, pending)
      .addCase(fetchCSRActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.csrActivities = action.payload.data || [];
      })
      .addCase(fetchCSRActivities.rejected, rejected)

    // Challenges
      .addCase(fetchChallenges.pending, pending)
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload.data || [];
      })
      .addCase(fetchChallenges.rejected, rejected)

    // Participations (Approval Queue)
      .addCase(fetchParticipations.pending, pending)
      .addCase(fetchParticipations.fulfilled, (state, action) => {
        state.loading = false;
        state.participations = action.payload.data || [];
      })
      .addCase(fetchParticipations.rejected, rejected)

    // Approve participation
      .addCase(approveParticipation.pending, (state) => { state.actionLoading = true; })
      .addCase(approveParticipation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = `Participation ${action.payload.data?.approval_status?.toLowerCase()}`;
        const idx = state.participations.findIndex(p => p._id === action.payload.data?._id);
        if (idx !== -1) state.participations[idx] = action.payload.data;
      })
      .addCase(approveParticipation.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

    // Leaderboard
      .addCase(fetchLeaderboard.pending, pending)
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload.data || [];
      })
      .addCase(fetchLeaderboard.rejected, rejected)

    // Rewards
      .addCase(fetchRewards.pending, pending)
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload.data || [];
      })
      .addCase(fetchRewards.rejected, rejected)

    // Redeem reward
      .addCase(redeemReward.pending, (state) => { state.actionLoading = true; })
      .addCase(redeemReward.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = 'Redemption submitted successfully!';
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

    // My Badges
      .addCase(fetchMyBadges.pending, pending)
      .addCase(fetchMyBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.myBadges = action.payload.data || [];
      })
      .addCase(fetchMyBadges.rejected, rejected)

    // Join Challenge
      .addCase(joinChallenge.pending, (state) => { state.actionLoading = true; })
      .addCase(joinChallenge.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = 'Successfully joined challenge!';
      })
      .addCase(joinChallenge.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

    // Signup for Activity
      .addCase(signupForActivity.pending, (state) => { state.actionLoading = true; })
      .addCase(signupForActivity.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = 'Signed up for activity!';
      })
      .addCase(signupForActivity.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = socialSlice.actions;
export default socialSlice.reducer;
