import React, { useEffect, useRef } from 'react';
import { useTimeline } from './TimelineContext';

const TimelineCanvas = () => {
  const canvasRef = useRef(null);
  const { timelineData, yOffset } = useTimeline();

  // 初始化WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL初始化失败');
      return;
    }

    // TODO: 添加WebGL初始化代码

    return () => {
      // 清理资源
    };
  }, []);

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      id="timeline-canvas"
      style={{ display: 'block' }}
    />
  );
};

export default TimelineCanvas;
