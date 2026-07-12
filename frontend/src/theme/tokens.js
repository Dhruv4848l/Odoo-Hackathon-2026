// Canopy Theme Tokens for EcoSphere ESG Management Platform
// Based on Section 11 of the EcoSphere ESG Platform Roadmap

export const tokens = {
  colors: {
    brand: {
      primary: '#1F5C4D',    // Deep forest green (Environmental & Core)
      secondary: '#C9862A',  // Warm gold (Gamification & Rewards)
      info: '#2E6DA4',       // Slate blue (Social module)
      alert: '#8E3B46',      // Muted maroon (Governance & Compliance)
    },
    neutral: {
      background: '#F7F5F0', // Warm off-white
      surface: '#FFFFFF',    // Pure white for cards/panels
      text: '#2B2B2B',       // Near-black ink
      textMuted: '#6B7280',  // Slate gray for captions
      border: '#E5E7EB',     // Light gray for borders
    },
    module: {
      environmental: '#1F5C4D',
      social: '#2E6DA4',
      governance: '#8E3B46',
      gamification: '#C9862A',
    }
  },
  fonts: {
    sans: 'Inter, system-ui, sans-serif',
    display: 'Poppins, system-ui, sans-serif',
  },
  borderRadius: {
    standard: '8px',
    large: '12px',
    full: '9999px',
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
};
