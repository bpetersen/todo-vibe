import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import List from './List';
import ListManager from './ListManager';

const root = ReactDOM.createRoot(document.getElementById('root')!);
const path = window.location.pathname;
const Component =
  path === '/lists'
    ? ListManager
    : path.startsWith('/lists/')
      ? List
      : App;

root.render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>,
);
