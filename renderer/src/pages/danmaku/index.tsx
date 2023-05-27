import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <button>1234</button>
  </React.StrictMode>
);

const information = document.getElementById('info');
if (information) {
  information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;
}

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  operation.rightClick();
});
