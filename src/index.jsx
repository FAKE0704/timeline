import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TimelineApp from './TimelineApp';

// 创建React根节点
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染主应用组件
root.render(
  <React.StrictMode>
    <TimelineApp />
  </React.StrictMode>
);
