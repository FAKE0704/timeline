import React, { useEffect, useRef, useCallback } from 'react';
import { useTimeline } from './TimelineContext';

const TimelineCanvas = () => {
  const canvasRef = useRef(null);
  const { timelineData, yOffset } = useTimeline();
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

    // Draw timeline arrow
    if (timelineData.length > 0) {
      const firstX = 100;
      const lastX = 100 + (timelineData.length - 1) * 60;
      const lineY = canvas.height / 2 + yOffset - 20; // Position above points
      
      // Draw timeline arrow line
      ctx.beginPath();
      ctx.moveTo(firstX, lineY);
      ctx.lineTo(lastX, lineY);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw arrowhead
      ctx.beginPath();
      ctx.moveTo(lastX, lineY);
      ctx.lineTo(lastX - 10, lineY - 5);
      ctx.lineTo(lastX - 10, lineY + 5);
      ctx.closePath();
      ctx.fillStyle = 'black';
      ctx.fill();
    }

    // Draw timeline data
    timelineData.forEach((event, index) => {
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(100 + index * 60, canvas.height / 2 + yOffset, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(event.title, 75 + index * 60, canvas.height / 2 + yOffset + 20);
    });
  }, [timelineData, yOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-render on resize
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);

    // Initial render
    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
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

  return (
    <canvas 
      ref={canvasRef}
      id="timeline-canvas"
      style={{ display: 'block' }}
    />
  );
};

export default TimelineCanvas;
