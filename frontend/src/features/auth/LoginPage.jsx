import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // Clear errors on load
  useEffect(() => {
    dispatch(clearError());
    setValidationError('');
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }
    dispatch(loginStart());
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      if (response.success) {
        dispatch(loginSuccess({ token: response.token, user: response.user }));
        navigate('/dashboard');
      } else {
        dispatch(loginFailure(response.message || 'Login failed. Please try again.'));
      }
    } catch (err) {
      dispatch(loginFailure(err.message || 'Invalid email or password.'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-bg py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500">
      <div className="w-full max-w-md space-y-6 bg-neutral-surface p-8 rounded-lg shadow-2xl border border-neutral-border/60 backdrop-blur-md">
        
        {/* Canopy Header Title */}
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-brand-primary tracking-tight">🌿 EcoSphere</h1>
          <p className="mt-2 text-sm text-neutral-textMuted font-sans">
            Collaborative ESG Management Platform
          </p>
        </div>

        {/* Alerts / Error Messages */}
        {(validationError || error) && (
          <div className="p-3 bg-brand-alert/10 border-l-4 border-brand-alert text-brand-alert rounded text-sm font-medium">
            {validationError || error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLoginSubmit}>
          <div>
            <label className="block text-xs font-semibold text-neutral-textMuted uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full p-3 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-neutral-bg/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-textMuted uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-neutral-bg/20"
            />
            <div className="flex items-center mt-2">
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-border text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="show-password" className="ml-2 text-xs font-semibold text-neutral-textMuted uppercase tracking-wider cursor-pointer select-none">
                Show Password
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-3 rounded hover:bg-brand-primary/95 font-medium transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
