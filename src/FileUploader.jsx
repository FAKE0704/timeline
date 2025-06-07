import React from 'react';
import { useTimeline } from './TimelineContext';

const FileUploader = () => {
  const { setFileContent } = useTimeline();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="file-uploader">
      <h2>Upload Timeline File</h2>
      <label htmlFor="file-input" className="upload-button">
        Choose File
        <input 
          type="file" 
          id="file-input" 
          accept=".md"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export default FileUploader;
