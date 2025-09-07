import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import List from './List';

const root = ReactDOM.createRoot(document.getElementById('root')!);
const Component = window.location.pathname.startsWith('/lists/') ? List : App;

root.render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>,
);
