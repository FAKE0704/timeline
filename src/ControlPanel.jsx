import React from 'react';
import FileUploader from './FileUploader';
import ActionButtons from './ActionButtons';
import PreviewPanel from './PreviewPanel';

const ControlPanel = () => {
  return (
    <div className="control-panel" style={{ margin: '20px' }}>
      <FileUploader />
      <ActionButtons />
      <PreviewPanel />
    </div>
  );
};

export default ControlPanel;
