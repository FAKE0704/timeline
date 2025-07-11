import React, { useEffect, useRef, useCallback } from 'react';
import { useTimeline } from './TimelineContext';

const TimelineCanvas = () => {
  const canvasRef = useRef(null);
  const { timelineData, yOffset, scale, setScale } = useTimeline();
  const animationFrameId = useRef(null);

  const render = useCallback(() => {
    console.log("Render triggered");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = '#c77676ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw timeline arrow (always visible)
    const margin = 50;
    const timelineLength = (canvas.width - 2 * margin) * scale;
    const firstX = (canvas.width - timelineLength) / 2;
    const lastX = firstX + timelineLength;
    const lineY = canvas.height / 2 + yOffset + 30;

    // Arrow line
    ctx.beginPath();
    ctx.moveTo(firstX, lineY);
    ctx.lineTo(lastX, lineY);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(lastX, lineY);
    ctx.lineTo(lastX - 15, lineY - 8);
    ctx.lineTo(lastX - 15, lineY + 8);
    ctx.closePath();
    ctx.fillStyle = '#ff0000';
    ctx.fill();

    // Draw timeline data
    if (timelineData.length > 0) {
      const sortedEvents = [...timelineData].sort((a, b) => a.timestamp - b.timestamp);
      const minTime = sortedEvents[0].timestamp;
      const maxTime = sortedEvents[sortedEvents.length - 1].timestamp;
      const totalDuration = maxTime - minTime;

      sortedEvents.forEach(event => {
        const position = totalDuration > 0 ? (event.timestamp - minTime) / totalDuration : 0.5;
        const x = firstX + position * (lastX - firstX);
        
        // Draw event point on timeline
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(x, lineY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw event info
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(event.title, x, lineY + 30);
        ctx.fillText(event.date, x, lineY + 50);
      });
    }
  }, [timelineData, yOffset, scale]);

  useEffect(() => {
    console.log('Setting up canvas and initial render');
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    
    if (!canvas || !container) {
      console.error('Canvas or container ref not available');
      return;
    }

    const updateCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      console.log('Canvas dimensions set:', canvas.width, canvas.height);
      render();
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    // Initial size setup
    updateCanvasSize();
    
    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [render]);

  useEffect(() => {
    // Re-render when data changes
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(render);
  }, [timelineData, yOffset, render]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomDirection = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3.0, prev + zoomDirection)));
  }, [setScale]);

  return (
    <canvas 
      ref={canvasRef}
      id="timeline-canvas"
      style={{ display: 'block' }}
      onWheel={handleWheel}
    />
  );
};

export default TimelineCanvas;
