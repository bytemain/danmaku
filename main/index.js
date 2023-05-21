const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('path');

require('update-electron-app')();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  ipcMain.handle('ping', () => 'pong');

  ipcMain.handle('open-danmaku', () => {
    createDanmakuWindow();
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
};

const createDanmakuWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/danmaku/index.js'),
    },
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(path.join(__dirname, '../renderer/dist/danmaku.html'));
  } else {
    win.loadURL('http://localhost:5173/danmaku.html');
  }
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
