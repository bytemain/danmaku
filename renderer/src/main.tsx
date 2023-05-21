import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import type { IMainWorld } from '../../preload/index.d.ts';

declare global {
  const versions: IMainWorld['versions'];
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const information = document.getElementById('info');
if (information) {
  information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;
}

const func = async () => {
  const response = await versions.ping();
  console.log(response); // prints out 'pong'
};

func();
