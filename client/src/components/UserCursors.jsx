import React from 'react';
import { MousePointer2 } from 'lucide-react';

const UserCursors = ({ cursors }) => {
  const colors = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#F97316', '#06B6D4'
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(cursors).map(([userId, position], index) => (
        <div
          key={userId}
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          <MousePointer2 
            className="w-5 h-5 drop-shadow-sm"
            style={{ color: colors[index % colors.length] }}
          />
          <div 
            className="absolute top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white shadow-sm whitespace-nowrap"
            style={{ backgroundColor: colors[index % colors.length] }}
          >
            User {userId.slice(-4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCursors;