import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Wifi, WifiOff } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';
import { io } from 'socket.io-client';

const Whiteboard = ({ roomId, onLeaveRoom }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [drawingSettings, setDrawingSettings] = useState({
    color: '#000000',
    strokeWidth: 2
  });
  const [cursors, setCursors] = useState({});
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  useEffect(() => {
    // Get server URL from environment variable
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    
    // Initialize socket connection
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('room-users', (roomUsers) => {
      setUsers(roomUsers);
    });

    newSocket.on('cursor-move', ({ userId, position }) => {
      setCursors(prev => ({
        ...prev,
        [userId]: position
      }));
    });

    newSocket.on('user-left', (userId) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Handle reconnection
    newSocket.on('reconnect', () => {
      console.log('Reconnected to server');
      setIsConnected(true);
      newSocket.emit('join-room', roomId);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [roomId]);

  // Prevent page scrolling and zooming on mobile
  useEffect(() => {
    // Prevent default touch behaviors that cause scrolling
    const preventDefaultTouch = (e) => {
      // Allow scrolling only in toolbar area
      const toolbar = document.querySelector('[data-toolbar]');
      if (toolbar && toolbar.contains(e.target)) {
        return;
      }
      
      // Prevent default for canvas area
      if (e.touches && e.touches.length > 1) {
        // Prevent pinch zoom
        e.preventDefault();
      }
    };

    const preventScroll = (e) => {
      // Prevent scrolling when touching the canvas area
      const toolbar = document.querySelector('[data-toolbar]');
      if (toolbar && toolbar.contains(e.target)) {
        return;
      }
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('touchend', preventDefaultTouch, { passive: false });

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    const preventZoom = (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    document.addEventListener('touchend', preventZoom, { passive: false });

    // Set viewport meta tag to prevent zooming
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    return () => {
      document.removeEventListener('touchstart', preventDefaultTouch);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('touchend', preventDefaultTouch);
      document.removeEventListener('touchend', preventZoom);
      
      // Restore viewport
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Close toolbar on mobile when window is resized to desktop
      if (window.innerWidth >= 768) {
        setIsToolbarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', roomId);
      socket.disconnect();
    }
    onLeaveRoom();
  };

  const handleCursorMove = (position) => {
    if (socket && isConnected) {
      socket.emit('cursor-move', { roomId, position });
    }
  };

  const handleToolbarToggle = (isOpen) => {
    setIsToolbarOpen(isOpen);
  };

  // Handle escape key to close toolbar on mobile
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isToolbarOpen) {
        setIsToolbarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isToolbarOpen]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden touch-none">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Leave Room</span>
            <span className="font-medium text-sm sm:hidden">Leave</span>
          </button>
          
          <div className="h-4 sm:h-6 w-px bg-gray-300 hidden xs:block flex-shrink-0"></div>
          
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-gray-500 hidden sm:inline flex-shrink-0">Room:</span>
            <code className="bg-gray-100 px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm font-mono font-semibold text-gray-800 truncate">
              {roomId}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* User Count */}
          <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
            <Users className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              <span className="hidden sm:inline">{users.length} online</span>
              <span className="sm:hidden">{users.length}</span>
            </span>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - with top padding to account for fixed header */}
      <div className="flex-1 flex relative min-h-0 pt-16">
        {/* Toolbar */}
        <div data-toolbar>
          <Toolbar 
            settings={drawingSettings}
            onSettingsChange={setDrawingSettings}
            socket={socket}
            roomId={roomId}
            isOpen={isToolbarOpen}
            onToggle={handleToolbarToggle}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Canvas Container */}
          <div className="absolute inset-0">
            <DrawingCanvas
              socket={socket}
              roomId={roomId}
              settings={drawingSettings}
              onCursorMove={handleCursorMove}
            />
            <UserCursors cursors={cursors} />
          </div>

          {/* Connection Status Overlay */}
          {!isConnected && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
              <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4 text-center">
                <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Lost</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Trying to reconnect to the whiteboard...
                </p>
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {socket === null && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Connecting to whiteboard...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toolbar Overlay Backdrop */}
      {isToolbarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsToolbarOpen(false)}
          aria-label="Close toolbar"
        />
      )}
    </div>
  );
};

export default Whiteboard;
