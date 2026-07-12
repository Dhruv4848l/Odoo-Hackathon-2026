import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import socialReducer from './socialSlice';
import scoringReducer from './scoringSlice';
import governanceReducer from './governanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    social: socialReducer,
    scoring: scoringReducer,
    governance: governanceReducer,
  },
});

export default store;
