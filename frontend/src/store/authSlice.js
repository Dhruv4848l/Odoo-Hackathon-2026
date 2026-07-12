import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial state from localStorage if available
const token = localStorage.getItem('ecosphere_token');
const userJson = localStorage.getItem('ecosphere_user');
let user = null;

if (userJson) {
  try {
    user = JSON.parse(userJson);
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
  }
}

const initialState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      
      localStorage.setItem('ecosphere_token', action.payload.token);
      localStorage.setItem('ecosphere_user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      localStorage.removeItem('ecosphere_token');
      localStorage.removeItem('ecosphere_user');
    },
    updateUserXP: (state, action) => {
      if (state.user) {
        state.user.xp = action.payload.xp;
        state.user.points = action.payload.points;
        localStorage.setItem('ecosphere_user', JSON.stringify(state.user));
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserXP,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
