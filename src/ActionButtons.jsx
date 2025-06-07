import React from 'react';
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

  const handleGenerate = () => {
    if (!fileContent) {
      alert('请先选择时间轴数据文件');
      return;
    }
    setTimelineData(parseMarkdown(fileContent));
  };

  const handleMoveDown = () => {
    setYOffset(yOffset + 100);
  };

  const handleCenter = () => {
    setYOffset(0);
  };

  return (
    <div className="action-buttons" style={{ marginTop: '10px' }}>
      <button id="generate-btn" onClick={handleGenerate}>
        生成时间轴
      </button>
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
