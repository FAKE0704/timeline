import React, { createContext, useState, useContext } from 'react';

const TimelineContext = createContext();

// Default timeline data for initial display
const DEFAULT_TIMELINE_DATA = [
  { title: 'Project Start', date: '2025-01-01' },
  { title: 'Alpha Release', date: '2025-03-15' },
  { title: 'Beta Testing', date: '2025-05-20' },
  { title: 'Official Launch', date: '2025-07-01' }
];

export const TimelineProvider = ({ children }) => {
  const [timelineData, setTimelineData] = useState(DEFAULT_TIMELINE_DATA);
  const [yOffset, setYOffset] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [needsRedraw, setNeedsRedraw] = useState(true);

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
        setNeedsRedraw
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => useContext(TimelineContext);
