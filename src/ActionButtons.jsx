import React, { useEffect } from 'react';
import { useTimeline } from './TimelineContext';

const ActionButtons = () => {
  const { 
    fileContent, 
    setTimelineData,
    yOffset,
    setYOffset
  } = useTimeline();

  const parseMarkdown = (content) => {
    const events = [];
    for (const line of content.split('\n')) {
      const match = line.match(/^(\d{4}[-\/]\d{2}[-\/]\d{2})(?:\s+(\d{1,2}:\d{2})?)?:\s+(.+)$/);
      if (match) {
        const date = match[1].replace('/', '-');
        const time = match[2] || '12:00';
        const timestamp = new Date(`${date}T${time}`).getTime();
        
        if (!isNaN(timestamp)) {
          events.push({
            timestamp,
            title: match[3],
            type: 'event',
            color: [0.2, 0.4, 1.0]
          });
        }
      }
    }
    return events;
  };

  // Automatically generate timeline on mount and when file content changes
  useEffect(() => {
    let content = fileContent;
    if (!content) {
      // Use default content if no file is uploaded
      content = `
2025-01-01: Project Kick-off
2025-01-15: Initial Design Complete
2025-02-01: Development Sprint 1 Starts
2025-02-15: Sprint 1 Ends, Review
2025-03-01: Sprint 2 Starts
      `.trim();
    }
    setTimelineData(parseMarkdown(content));
  }, [fileContent, setTimelineData]);

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
