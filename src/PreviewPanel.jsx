import React from 'react';
import { useTimeline } from './TimelineContext';

const PreviewPanel = () => {
  const { fileContent } = useTimeline();

  return (
    <div id="preview-area" style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', maxHeight: '200px', overflow: 'auto' }}>
      <h4 style={{ margin: '0 0 5px 0' }}>文件预览：</h4>
      <pre id="preview-content" style={{ whiteSpace: 'pre-wrap', margin: '0' }}>
        {fileContent ? 
          fileContent.slice(0, 500) + 
          (fileContent.length > 500 ? '\n...' : '') 
          : '请上传时间轴数据文件'}
      </pre>
    </div>
  );
};

export default PreviewPanel;
