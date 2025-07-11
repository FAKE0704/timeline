import React, { useEffect } from 'react';
import { useTimeline } from './TimelineContext';

const ActionButtons = () => {
  const { 
    fileContent, 
    setTimelineData,
    yOffset,
    setYOffset
  } = useTimeline();

  const { parseMarkdown } = useTimeline();

  // Handle file upload changes
  useEffect(() => {
    if (fileContent && parseMarkdown) {
      const events = parseMarkdown(fileContent);
      setTimelineData(events);
    }
  }, [fileContent, parseMarkdown, setTimelineData]);

  const handleMoveDown = () => {
    setYOffset(yOffset + 100);
  };

  const handleCenter = () => {
    setYOffset(0);
  };

  return (
    <div className="action-buttons" style={{ marginTop: '10px' }}>
      {/* Generate button removed - timeline now shows automatically */}
      <button 
        id="move-down-btn" 
        style={{ marginLeft: '10px' }}
        onClick={handleMoveDown}
      >
        下移时间轴
      </button>
      <button 
        id="center-btn" 
        style={{ marginLeft: '10px' }}
        onClick={handleCenter}
      >
        回到中心
      </button>
    </div>
  );
};

export default ActionButtons;
