import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import scoringReducer from './scoringSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scoring: scoringReducer,
    // Other slices added by respective developers:
    // environmental: environmentalReducer,
    // social: socialReducer,
    // governance: governanceReducer,
  },
});

export default store;
