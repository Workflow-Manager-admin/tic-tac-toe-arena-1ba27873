import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // App includes Snake & Ladder game as well

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
