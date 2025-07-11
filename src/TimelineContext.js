import React, { createContext, useState, useContext, useEffect } from 'react';

const TimelineContext = createContext();

export const TimelineProvider = ({ children }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [yOffset, setYOffset] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [needsRedraw, setNeedsRedraw] = useState(true);
  const [scale, setScale] = useState(1.0);

  const parseMarkdown = (content) => {
    const events = [];
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    
    for (const line of lines) {
      const match = line.match(/^(\d{4}-\d{2}-\d{2}):\s+(.+)$/);
      if (match) {
        const date = match[1];
        const title = match[2];
        const timestamp = new Date(`${date}T12:00`).getTime();
        
        if (!isNaN(timestamp)) {
          events.push({
            timestamp,
            title,
            date,
            type: 'event',
            color: [0.2, 0.4, 1.0]
          });
        }
      }
    }
    return events;
  };

  useEffect(() => {
    console.log('Initializing timeline data');
    const defaultContent = `
2025-01-01: Project Kick-off
2025-01-15: Initial Design Complete
2025-02-01: Development Sprint 1 Starts
2025-02-15: Sprint 1 Ends, Review
2025-03-01: Sprint 2 Starts
    `.trim();
    
    if (!fileContent) {
      console.log('Setting default timeline data');
      setTimelineData(parseMarkdown(defaultContent));
    } else {
      console.log('Using file content for timeline data');
    }
  }, []);

  useEffect(() => {
    if (fileContent) {
      setTimelineData(parseMarkdown(fileContent));
    }
  }, [fileContent]);

  return (
    <TimelineContext.Provider
      value={{
        timelineData,
        setTimelineData,
        yOffset,
        setYOffset,
        fileContent,
        setFileContent,
        isRendering,
        setIsRendering,
        needsRedraw,
        setNeedsRedraw,
        parseMarkdown,
        scale,
        setScale
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => useContext(TimelineContext);
