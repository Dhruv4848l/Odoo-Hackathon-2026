import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import governanceApi from '../api/governance.api';

// Async Thunks for Policies
export const fetchPolicies = createAsyncThunk(
  'governance/fetchPolicies',
  async (category, { rejectWithValue }) => {
    try {
      const response = await governanceApi.getPolicies(category);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch policies');
    }
  }
);

export const createPolicy = createAsyncThunk(
  'governance/createPolicy',
  async (policyData, { rejectWithValue }) => {
    try {
      const response = await governanceApi.createPolicy(policyData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create policy');
    }
  }
);

// Async Thunks for Acknowledgements
export const acknowledgePolicy = createAsyncThunk(
  'governance/acknowledgePolicy',
  async ({ policyId, signature }, { rejectWithValue }) => {
    try {
      const response = await governanceApi.acknowledgePolicy(policyId, signature);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to acknowledge policy');
    }
  }
);

export const fetchAcknowledgementRate = createAsyncThunk(
  'governance/fetchAcknowledgementRate',
  async (policyId, { rejectWithValue }) => {
    try {
      const response = await governanceApi.getAcknowledgementRate(policyId);
      return response; // Contains policy details and rate reports
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch acknowledgement rates');
    }
  }
);

// Async Thunks for Audits
export const fetchAudits = createAsyncThunk(
  'governance/fetchAudits',
  async (params, { rejectWithValue }) => {
    try {
      const response = await governanceApi.getAudits(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch audits');
    }
  }
);

export const scheduleAudit = createAsyncThunk(
  'governance/scheduleAudit',
  async (auditData, { rejectWithValue }) => {
    try {
      const response = await governanceApi.scheduleAudit(auditData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to schedule audit');
    }
  }
);

export const updateAudit = createAsyncThunk(
  'governance/updateAudit',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await governanceApi.updateAudit(id, formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update audit');
    }
  }
);

// Async Thunks for Compliance Issues
export const fetchComplianceIssues = createAsyncThunk(
  'governance/fetchComplianceIssues',
  async (params, { rejectWithValue }) => {
    try {
      const response = await governanceApi.getComplianceIssues(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch compliance issues');
    }
  }
);

export const createComplianceIssue = createAsyncThunk(
  'governance/createComplianceIssue',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await governanceApi.createComplianceIssue(issueData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create compliance issue');
    }
  }
);

export const updateComplianceIssue = createAsyncThunk(
  'governance/updateComplianceIssue',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await governanceApi.updateComplianceIssue(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update compliance issue');
    }
  }
);

export const resolveComplianceIssue = createAsyncThunk(
  'governance/resolveComplianceIssue',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await governanceApi.resolveComplianceIssue(id, formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to resolve compliance issue');
    }
  }
);

// Async Thunks for Notifications
export const fetchNotifications = createAsyncThunk(
  'governance/fetchNotifications',
  async (unreadOnly, { rejectWithValue }) => {
    try {
      const response = await governanceApi.getNotifications(unreadOnly);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'governance/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await governanceApi.markNotificationRead(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'governance/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await governanceApi.markAllNotificationsRead();
      return true;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark all notifications as read');
    }
  }
);

const initialState = {
  policies: [],
  acknowledgementRate: null,
  audits: [],
  complianceIssues: [],
  notifications: [],
  unreadNotificationsCount: 0,
  loading: false,
  error: null,
};

const governanceSlice = createSlice({
  name: 'governance',
  initialState,
  reducers: {
    // Reducer for real-time notification pushes via Sockets
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadNotificationsCount += 1;
    },
    clearGovernanceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Policies
      .addCase(fetchPolicies.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.policies.push(action.payload);
      })

      // Acknowledgement Rates
      .addCase(fetchAcknowledgementRate.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAcknowledgementRate.fulfilled, (state, action) => {
        state.loading = false;
        state.acknowledgementRate = action.payload;
      })
      .addCase(fetchAcknowledgementRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Audits
      .addCase(fetchAudits.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAudits.fulfilled, (state, action) => {
        state.loading = false;
        state.audits = action.payload;
      })
      .addCase(fetchAudits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(scheduleAudit.fulfilled, (state, action) => {
        state.audits.push(action.payload);
      })
      .addCase(updateAudit.fulfilled, (state, action) => {
        const index = state.audits.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.audits[index] = action.payload;
        }
      })

      // Compliance Issues
      .addCase(fetchComplianceIssues.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComplianceIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.complianceIssues = action.payload;
      })
      .addCase(fetchComplianceIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createComplianceIssue.fulfilled, (state, action) => {
        state.complianceIssues.push(action.payload);
      })
      .addCase(updateComplianceIssue.fulfilled, (state, action) => {
        const index = state.complianceIssues.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.complianceIssues[index] = action.payload;
        }
      })
      .addCase(resolveComplianceIssue.fulfilled, (state, action) => {
        const index = state.complianceIssues.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) {
          state.complianceIssues[index] = action.payload;
        }
      })

      // Notifications
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadNotificationsCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (index !== -1 && !state.notifications[index].read) {
          state.notifications[index].read = true;
          state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => { n.read = true; });
        state.unreadNotificationsCount = 0;
      });
  },
});

export const { addNotification, clearGovernanceError } = governanceSlice.actions;

export default governanceSlice.reducer;
