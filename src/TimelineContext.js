import React, { createContext, useState, useContext } from 'react';

const TimelineContext = createContext();

export const TimelineProvider = ({ children }) => {
  const [timelineData, setTimelineData] = useState([]);
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
