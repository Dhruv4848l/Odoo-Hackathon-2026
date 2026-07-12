import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store/store';
import './index.css';
import App from './App.jsx';

// ── DEV BYPASS: seed a mock Admin session so all screens are visible without a real login ──
// TODO: Remove this block before production / final integration merge
if (import.meta.env.DEV && !localStorage.getItem('ecosphere_token')) {
  localStorage.setItem('ecosphere_token', 'mock-dev-token');
  localStorage.setItem('ecosphere_user', JSON.stringify({
    name: 'Dhruv (Dev D)',
    email: 'devd@ecosphere.com',
    role: 'Admin',
  }));
}
// ── END DEV BYPASS ──


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
