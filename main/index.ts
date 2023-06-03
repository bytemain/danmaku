import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
import path from 'path';

import { setup } from './bililive';

require('update-electron-app')();

ipcMain.handle('ping', () => 'pong');

ipcMain.handle('open-danmaku', (event, roomId) => {
  createDanmakuWindow(roomId);
});

ipcMain.handle('danmaku-menu', (event) => {
  const transparencyStep = 10;
  const transparencyMax = 100;
  const transparencyMin = 20;

  let currentTransparency = transparencyMax;

  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const opacity = win.getOpacity();
    currentTransparency = Math.floor(opacity * 100);
  }

  const transparencyMenu = [] as Electron.MenuItemConstructorOptions[];

  for (let i = transparencyMin; i <= transparencyMax; i += transparencyStep) {
    transparencyMenu.push({
      label: `${i}%`,
      type: 'radio',
      checked: i === currentTransparency,
      click: () => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.setOpacity(i / 100);
      },
    });
  }

  const template = [
    {
      label: 'Transparency',
      type: 'submenu',
      submenu: transparencyMenu,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.close();
      },
    },
  ] as MenuItemConstructorOptions[];
  const menu = Menu.buildFromTemplate(template);
  menu.popup({
    window: BrowserWindow.fromWebContents(event.sender),
  });
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
};

const createDanmakuWindow = (roomId) => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    closable: true,
    frame: false,
    hasShadow: true,
    maximizable: false,
    fullscreenable: false,
    resizable: true,
    // transparent: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/danmaku/index.js'),
      additionalArguments: ['--roomId=' + roomId],
    },
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(path.join(__dirname, '../renderer/dist/danmaku.html'));
  } else {
    win.loadURL('http://localhost:5173/danmaku.html');
  }
  win.webContents.on('did-stop-loading', async () => {
    await setup(roomId);
    win.webContents.send('main-world-ready');
  });
  win.webContents.openDevTools();
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
