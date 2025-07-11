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

    // Draw timeline arrow (always visible)
    const margin = 50;
    const firstX = margin;
    const lastX = canvas.width - margin;
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
    console.log('Setting up canvas and initial render');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref not available');
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log('Canvas dimensions set:', canvas.width, canvas.height);

    const handleResize = () => {
      console.log('Window resized - updating canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);

    // Immediate initial render
    console.log('Triggering initial render');
    render();
    
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
