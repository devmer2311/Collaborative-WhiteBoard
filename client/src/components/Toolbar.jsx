import React, { useState, useEffect } from 'react';
import { Trash2, Palette, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

const Toolbar = ({ settings, onSettingsChange, socket, roomId, isOpen, onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const colors = [
    '#000000', // Black
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && isOpen) {
        onToggle(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen, onToggle]);

  const handleColorChange = (color) => {
    onSettingsChange({ ...settings, color });
  };

  const handleStrokeWidthChange = (strokeWidth) => {
    onSettingsChange({ ...settings, strokeWidth: parseInt(strokeWidth) });
  };

  const handleClearCanvas = () => {
    if (socket && roomId) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  const toggleCollapse = () => {
    if (isMobile) {
      onToggle(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toolbarVisible = isMobile ? isOpen : true;
  const toolbarCollapsed = isMobile ? false : isCollapsed;

  return (
    <>
      {/* Mobile Toggle Button - Only visible on small screens */}
      <button
        onClick={toggleCollapse}
        className="md:hidden fixed top-20 left-4 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
        aria-label={isOpen ? "Close toolbar" : "Open toolbar"}
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Toolbar Container */}
      <div className={`
        bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex-shrink-0
        ${isMobile 
          ? `fixed top-0 left-0 z-40 w-72 h-full transform ${toolbarVisible ? 'translate-x-0' : '-translate-x-full'}`
          : `relative ${toolbarCollapsed ? 'w-16' : 'w-64'}`
        }
      `}>
        
        {/* Desktop Collapse Button */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-200 items-center justify-center z-10"
          aria-label={toolbarCollapsed ? "Expand toolbar" : "Collapse toolbar"}
        >
          {toolbarCollapsed ? 
            <ChevronRight className="w-3 h-3" /> : 
            <ChevronLeft className="w-3 h-3" />
          }
        </button>

        {/* Toolbar Content */}
        <div className={`p-4 h-full overflow-y-auto ${toolbarCollapsed ? 'md:px-2' : ''}`}>
          <div className="flex flex-col gap-6">
            
            {/* Colors Section */}
            <div className={toolbarCollapsed ? 'md:hidden' : ''}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 flex-shrink-0" />
                <span>Colors</span>
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 touch-manipulation ${
                      settings.color === color 
                        ? 'border-gray-400 shadow-md ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Collapsed Color Indicator */}
            <div className={`hidden ${toolbarCollapsed ? 'md:flex' : ''} flex-col items-center gap-2`}>
              <div
                className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200"
                style={{ backgroundColor: settings.color }}
                title={`Current color: ${settings.color}`}
                onClick={() => setIsCollapsed(false)}
              />
            </div>

            {/* Brush Size Section */}
            <div className={toolbarCollapsed ? 'md:hidden' : ''}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Brush Size
              </h3>
              <div className="space-y-4">
                {/* Size Display */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Size:</span>
                  <span className="text-sm font-medium text-gray-800">{settings.strokeWidth}px</span>
                </div>
                
                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={settings.strokeWidth}
                    onChange={(e) => handleStrokeWidthChange(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(settings.strokeWidth - 1) / 19 * 100}%, #E5E7EB ${(settings.strokeWidth - 1) / 19 * 100}%, #E5E7EB 100%)`
                    }}
                    aria-label={`Brush size: ${settings.strokeWidth} pixels`}
                  />
                </div>
                
                {/* Visual Size Preview */}
                <div className="flex items-center justify-center py-3">
                  <div
                    className="rounded-full bg-gray-800 transition-all duration-200"
                    style={{
                      width: `${Math.max(settings.strokeWidth, 4)}px`,
                      height: `${Math.max(settings.strokeWidth, 4)}px`
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Collapsed Size Indicator */}
            <div className={`hidden ${toolbarCollapsed ? 'md:flex' : ''} flex-col items-center gap-2`}>
              <div
                className="rounded-full bg-gray-800 cursor-pointer hover:scale-110 transition-transform duration-200"
                style={{
                  width: `${Math.max(settings.strokeWidth / 2, 3)}px`,
                  height: `${Math.max(settings.strokeWidth / 2, 3)}px`
                }}
                title={`Brush size: ${settings.strokeWidth}px`}
                onClick={() => setIsCollapsed(false)}
              />
              <span className="text-xs text-gray-500">{settings.strokeWidth}</span>
            </div>

            {/* Actions Section */}
            <div className={`pt-4 border-t border-gray-200 ${toolbarCollapsed ? 'md:pt-2' : ''}`}>
              <button
                onClick={handleClearCanvas}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-all duration-200 font-medium touch-manipulation ${
                  toolbarCollapsed ? 'md:px-2 md:py-2' : ''
                }`}
                title="Clear Canvas"
                aria-label="Clear the entire canvas"
              >
                <Trash2 className={`w-4 h-4 flex-shrink-0 ${toolbarCollapsed ? 'md:w-3 md:h-3' : ''}`} />
                <span className={toolbarCollapsed ? 'md:hidden' : ''}>Clear Canvas</span>
              </button>
            </div>

            {/* Mobile Close Button */}
            {isMobile && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => onToggle(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  <X className="w-4 h-4" />
                  Close Toolbar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
          .slider::-webkit-slider-thumb {
            width: 24px;
            height: 24px;
          }
          .slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Toolbar;