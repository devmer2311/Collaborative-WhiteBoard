import React, { useState } from 'react';
import { Users, ArrowRight, Palette } from 'lucide-react';

const RoomJoin = ({ onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setIsJoining(true);
    // Simulate API call delay for better UX
    setTimeout(() => {
      onJoinRoom(roomCode.toUpperCase());
      setIsJoining(false);
    }, 500);
  };

  const handleCreateRoom = () => {
    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaborative Whiteboard</h1>
          <p className="text-gray-600">Create or join a room to start drawing together</p>
        </div>

        {/* Join Room Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg font-mono tracking-wider"
                maxLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={!roomCode.trim() || isJoining}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Join Room
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Create New Room */}
          <button
            onClick={handleCreateRoom}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Palette className="w-5 h-5" />
            Create New Room
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-blue-600">
            Made With ❤️ by the <a href="https://github.com/devmer2311/" target="_blank" rel="noopener noreferrer">Dev Mer</a>
          </p>
      
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Collaborative Whiteboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;