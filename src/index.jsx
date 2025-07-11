import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TimelineApp from './TimelineApp';

console.log('Mounting React application...');

// 创建React根节点
const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('Root element not found!');
} else {
  console.log('Found root element:', rootEl);
  const root = ReactDOM.createRoot(rootEl);

  // 渲染主应用组件
  root.render(
    <React.StrictMode>
      <TimelineApp />
    </React.StrictMode>
  );
}
