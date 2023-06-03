import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
import path from 'path';

import { DanmakuClient } from './bililive/live/danmaku';
import { EDanmakuEventName } from 'common/types/danmaku';
import { danmakuNotificationChannel } from 'common/ipc';
import { Disposable } from 'common/disposable';

require('update-electron-app')();

ipcMain.handle('ping', () => 'pong');

ipcMain.handle('get-owner-browser-window-id', (event) => {
  return BrowserWindow.fromWebContents(event.sender).id;
});

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

const stopEvent = (value: any, cb: () => void) => {
  if (!value) {
    cb();
  }
};

const createDanmakuWindow = (roomId) => {
  let win = new BrowserWindow({
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

  let disposable = new Disposable();
  win.on('close', () => {
    // 移除所有的事件监听
    disposable.dispose();
  });
  win.on('closed', () => {
    win = null;
  });

  win.webContents.on('did-stop-loading', async () => {
    const danmakuClient = DanmakuClient.instance(roomId);

    disposable.add(
      danmakuClient.onGift((gift) => {
        if (!win) {
          disposable.dispose();
          return;
        }
        win.webContents.send(danmakuNotificationChannel + win.id, {
          type: EDanmakuEventName.GIFT,
          gift,
        });
      })
    );
    danmakuClient.onDanmaku((danmaku) => {
      if (!win) {
        disposable.dispose();
        return;
      }

      console.log(
        'danmakuNotificationChannel + win.id',
        danmakuNotificationChannel + win.id
      );
      win.webContents.send(danmakuNotificationChannel + win.id, {
        type: EDanmakuEventName.DANMAKU,
        danmaku: danmaku.toJSON(),
      });
    });
    danmakuClient.onPopularity((count) => {
      if (!win) {
        disposable.dispose();
        return;
      }

      console.log(
        'danmakuNotificationChannel + win.id',
        danmakuNotificationChannel + win.id
      );

      win.webContents.send(danmakuNotificationChannel + win.id, {
        type: EDanmakuEventName.POPULARITY,
        popularity: count,
      });
    });
    danmakuClient.onWelcome((welcome) => {
      if (!win) {
        disposable.dispose();
        return;
      }

      win.webContents.send(danmakuNotificationChannel + win.id, {
        type: EDanmakuEventName.WELCOME,
        welcome,
      });
    });

    await danmakuClient.start();
    win.webContents.send('main-world-setup-channel' + win.id);
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
