import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Other slices will be added here by respective developers:
    // environmental: environmentalReducer,
    // social: socialReducer,
    // governance: governanceReducer,
    // scoring: scoringReducer,
  },
});

export default store;
