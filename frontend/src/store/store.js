import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import socialReducer from './socialSlice';
// import environmentalReducer from './environmentalSlice'; // Dev A
// import governanceReducer from './governanceSlice';       // Dev C
// import scoringReducer from './scoringSlice';             // Dev D

export const store = configureStore({
  reducer: {
    auth: authReducer,
    social: socialReducer,
    // environmental: environmentalReducer,
    // governance: governanceReducer,
    // scoring: scoringReducer,
  },
});

export default store;
