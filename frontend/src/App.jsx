import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import AppRoutes from './routes/AppRoutes';
import { addNotification } from './store/governanceSlice';
import { Bell, X } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    if (isAuthenticated && user) {
      const userId = user.id || user._id;
      socket.emit('register', userId);

      // Listen for real-time notification pushes
      socket.on('notification', (notification) => {
        dispatch(addNotification(notification));
        
        // Trigger visual toast popup
        setToast(notification);

        // Auto close after 6 seconds
        const timer = setTimeout(() => {
          setToast(null);
        }, 6000);

        return () => clearTimeout(timer);
      });
    }

    return () => {
      socket.off('notification');
    };
  }, [socket, isAuthenticated, user, dispatch]);

  // Determine toast accent color based on type
  const getToastColor = (type) => {
    switch (type) {
      case 'Alert': return 'border-brand-alert';      // Governance/Compliance (Maroon)
      case 'Reward': return 'border-brand-secondary'; // Gamification (Gold)
      case 'Policy': return 'border-brand-info';      // Social/Policies (Blue)
      default: return 'border-brand-primary';         // Core/Environmental (Green)
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg text-neutral-text font-sans selection:bg-brand-primary selection:text-white">
      {/* Real-time Floating Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce md:animate-none">
          <div className={`flex w-full max-w-sm overflow-hidden bg-neutral-surface rounded-lg shadow-md border-l-4 ${getToastColor(toast.type)} transition-all duration-300 transform translate-y-0`}>
            <div className="flex items-center justify-center w-12 bg-neutral-bg">
              <Bell className="w-6 h-6 text-brand-primary animate-pulse" />
            </div>
            
            <div className="px-4 py-2 -mx-3">
              <div className="mx-3">
                <span className="font-semibold text-brand-primary font-display">{toast.type} Notification</span>
                <p className="text-sm text-neutral-textMuted mt-0.5">{toast.message}</p>
              </div>
            </div>

            <button 
              onClick={() => setToast(null)}
              className="p-1 ml-auto text-neutral-textMuted hover:text-neutral-text transition-colors duration-150 focus:outline-none"
            >
              <X className="w-5 h-5 mr-1 mt-1" />
            </button>
          </div>
        </div>
      )}

      {/* Main Routes */}
      <AppRoutes />
    </div>
  );
}

export default App;
