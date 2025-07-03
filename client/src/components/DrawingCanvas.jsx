import React, { useRef, useEffect, useState, useCallback } from 'react';

const DrawingCanvas = ({ socket, roomId, settings, onCursorMove }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [lastTouch, setLastTouch] = useState(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (!socket) return;

    socket.on('draw-start', (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    });

    socket.on('draw-move', (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    });

    socket.on('draw-end', () => {
      // Drawing ended
    });

    socket.on('clear-canvas', () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.on('load-drawing', (drawingData) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawingData.forEach(stroke => {
        if (stroke.type === 'clear') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else if (stroke.type === 'stroke' && stroke.path.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          stroke.path.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.stroke();
        }
      });
    });

    return () => {
      socket.off('draw-start');
      socket.off('draw-move');
      socket.off('draw-end');
      socket.off('clear-canvas');
      socket.off('load-drawing');
    };
  }, [socket]);

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault(); // Prevent scrolling on touch
    
    const pos = getEventPos(e);
    setIsDrawing(true);
    setCurrentPath([pos]);
    setLastTouch(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = settings.color;
    ctx.lineWidth = settings.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (socket) {
      socket.emit('draw-start', {
        roomId,
        x: pos.x,
        y: pos.y,
        color: settings.color,
        strokeWidth: settings.strokeWidth
      });
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch

    const pos = getEventPos(e);
    setCurrentPath(prev => [...prev, pos]);
    setLastTouch(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    if (socket) {
      socket.emit('draw-move', {
        roomId,
        x: pos.x,
        y: pos.y
      });
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    setIsDrawing(false);
    setCurrentPath([]);
    setLastTouch(null);

    if (socket) {
      socket.emit('draw-end', { roomId });
    }
  };

  const handleMouseMove = (e) => {
    const pos = getEventPos(e);
    onCursorMove(pos);
    
    if (isDrawing) {
      draw(e);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling
    
    const pos = getEventPos(e);
    onCursorMove(pos);
    
    if (isDrawing) {
      draw(e);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    startDrawing(e);
  };

  const handleTouchEnd = (e) => {
    stopDrawing(e);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair bg-white touch-none"
      // Mouse events
      onMouseDown={startDrawing}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      // Touch events
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      // Prevent context menu on long press
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

export default DrawingCanvas;
