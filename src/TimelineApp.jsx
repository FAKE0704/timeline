import React from 'react';
import { TimelineProvider } from './TimelineContext';
import ControlPanel from './ControlPanel';
import TimelineCanvas from './TimelineCanvas';

const TimelineApp = () => {
  return (
    <TimelineProvider>
      <div className="timeline-app">
        <ControlPanel />
        <div className="timeline-display-container">
          <TimelineCanvas />
        </div>
      </div>
    </TimelineProvider>
  );
};

export default TimelineApp;
