import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import socialReducer from './socialSlice';
import scoringReducer from './scoringSlice';
// import environmentalReducer from './environmentalSlice'; // Dev A
// import governanceReducer from './governanceSlice';       // Dev C

export const store = configureStore({
  reducer: {
    auth: authReducer,
    social: socialReducer,
    scoring: scoringReducer,
    // environmental: environmentalReducer,
    // governance: governanceReducer,
  },
});

export default store;
