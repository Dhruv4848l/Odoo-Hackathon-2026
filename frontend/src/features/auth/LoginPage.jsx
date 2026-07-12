import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/authSlice';

const ECO_PARTICLES = [
  // Organic Leaves
  { id: 1, type: 'leaf', left: '10%', top: '15%', size: 'w-16 h-16', duration: '28s', delay: '0s', opacity: 'opacity-[0.15]' },
  { id: 2, type: 'leaf', left: '76%', top: '12%', size: 'w-20 h-20', duration: '32s', delay: '2.5s', opacity: 'opacity-[0.10]' },
  { id: 3, type: 'leaf', left: '22%', top: '72%', size: 'w-12 h-12', duration: '25s', delay: '1s', opacity: 'opacity-[0.16]' },
  { id: 4, type: 'leaf', left: '86%', top: '65%', size: 'w-16 h-16', duration: '34s', delay: '4s', opacity: 'opacity-[0.12]' },
  // Water Droplets
  { id: 5, type: 'droplet', left: '5%', top: '48%', size: 'w-8 h-8', duration: '20s', delay: '3.2s', opacity: 'opacity-[0.15]' },
  { id: 6, type: 'droplet', left: '74%', top: '78%', size: 'w-10 h-10', duration: '24s', delay: '1.5s', opacity: 'opacity-[0.18]' },
  // Sun Light Spots
  { id: 7, type: 'light-spot', left: '40%', top: '25%', size: 'w-6 h-6', duration: '18s', delay: '5s', opacity: 'opacity-[0.25]' },
  { id: 8, type: 'light-spot', left: '60%', top: '82%', size: 'w-8 h-8', duration: '22s', delay: '2s', opacity: 'opacity-[0.20]' },
];

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
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-[#040C08] overflow-hidden transition-all duration-500">
      
      {/* Full-Screen Sustainability Visual Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img 
          src="/login_hero.png" 
          className="w-full h-full object-cover select-none scale-105" 
          alt="Sustainability Canopy Background" 
        />
        {/* Soft forest overlay to darken and unify the left-to-right contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60 z-10"></div>
      </div>

      {/* Floating Animated ESG Blur Blobs (Overlay Vibe) */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-brand-primary/10 rounded-full blur-[120px] animate-blob pointer-events-none z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2E6DA4]/10 rounded-full blur-[130px] animate-blob animation-delay-2000 pointer-events-none z-10"></div>

      {/* Floating Eco Elements (3D Leaves & Droplets in 3D Space) */}
      {ECO_PARTICLES.map((p) => (
        <div
          key={p.id}
          className={`absolute ${p.size} ${p.opacity} animate-particle pointer-events-none select-none z-10`}
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            '--duration': p.duration,
          }}
        >
          {p.type === 'leaf' && (
            <svg className="w-full h-full text-[#2EE08A] fill-none stroke-current" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8A7 7 0 0 1 11 20z" />
              <path d="M19 2c-2.26 4.33-5.27 7.14-8 8" />
            </svg>
          )}
          {p.type === 'droplet' && (
            <svg className="w-full h-full text-[#4EA8DE] fill-current opacity-30" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          )}
          {p.type === 'light-spot' && (
            <div className="w-full h-full rounded-full bg-brand-secondary/20 blur-[5px]"></div>
          )}
        </div>
      ))}

      {/* Left side: ESG Platform Branding Message */}
      <div className="relative z-20 w-full lg:w-1/2 flex items-end p-8 lg:p-20 text-white min-h-[300px] lg:min-h-screen">
        <div className="animate-fade-in font-display max-w-md bg-[#040C08]/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2EE08A] mb-2">EcoSphere Platform</p>
          <h2 className="text-3xl lg:text-4xl font-black leading-tight drop-shadow-md">
            Pioneering the future of <br />corporate ESG collaboration.
          </h2>
          <p className="text-xs text-gray-300 mt-4 font-semibold font-sans leading-relaxed">
            Aligning environmental action, social wellness, and compliance goals into a unified corporate index.
          </p>
        </div>
      </div>

      {/* Right side: Floating Login Card Panel */}
      <div className="relative z-20 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 min-h-[500px] lg:min-h-screen">
        
        {/* Dark Glassmorphic Login Container */}
        <div className="w-full max-w-md space-y-6 bg-white/[0.04] backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.3)] animate-fade-in">
          
          {/* Brand Logo Header */}
          <div className="text-center">
            <img src="/logo-named-white.svg" className="h-10 mx-auto mb-2" alt="EcoSphere Logo" />
            <p className="text-xs text-gray-400 font-medium">
              Collaborative ESG Management Platform
            </p>
          </div>

          {/* Alerts / Error Messages */}
          {(validationError || error) && (
            <div className="p-3.5 bg-brand-alert/15 border-l-4 border-brand-alert text-red-200 rounded-xl text-xs font-bold animate-fade-in">
              {validationError || error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2EE08A]/20 focus:border-[#2EE08A] font-semibold transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2EE08A]/20 focus:border-[#2EE08A] font-semibold transition-all duration-200"
              />
              <div className="flex items-center mt-3">
                <input
                  id="show-password"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#2EE08A] focus:ring-[#2EE08A]/30 focus:ring-offset-[#040C08]"
                />
                <label htmlFor="show-password" className="ml-2 text-[10px] font-bold text-gray-300 uppercase tracking-wider cursor-pointer select-none">
                  Show Password
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F5C4D] hover:bg-[#277562] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#1F5C4D]/25 hover:shadow-[#2EE08A]/15 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
