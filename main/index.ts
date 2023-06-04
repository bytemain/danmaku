import updateElectron from 'update-electron-app';

updateElectron();

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
import path from 'path';

import {
  AgentEventListener,
  DanmakuClient,
} from '@lib/bililive/main/live/danmaku';
import { danmakuNotificationChannel } from 'common/ipc';
import { Disposable } from 'common/disposable';
import { EMessageEventType } from '@lib/bililive/common/types/danmaku';

function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null;
}

ipcMain.handle('get-owner-browser-window-id', (event) => {
  return BrowserWindow.fromWebContents(event.sender).id;
});

ipcMain.handle('open-danmaku', (event, roomId) => {
  createDanmakuWindow(roomId);
});

let currentTransparency = 80;

ipcMain.handle('danmaku-menu', (event) => {
  const transparencyStep = 10;
  const transparencyMax = 100;
  const transparencyMin = 20;

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
      label: 'Always on top',
      type: 'checkbox',
      checked: win ? win.isAlwaysOnTop() : false,
      click: () => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.setAlwaysOnTop(!win.isAlwaysOnTop());
      },
    },
    {
      label: 'Reload',
      click: () => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) win.reload();
      },
    },
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
    opacity: currentTransparency / 100,
    // transparent: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/danmaku/index.js'),
      additionalArguments: ['--roomId=' + roomId],
    },
  });
  win.on('blur', () => {
    win.setIgnoreMouseEvents(true);
  });
  win.on('focus', () => {
    win.setIgnoreMouseEvents(false);
  });
  win.on('resize', () => {
    win.setIgnoreMouseEvents(false);
  });
  win.on('will-resize', () => {
    win.setIgnoreMouseEvents(false);
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(path.join(__dirname, '../renderer/dist/danmaku.html'));
  } else {
    win.loadURL('http://localhost:5173/danmaku.html');
  }

  const disposable = new Disposable();
  win.on('close', () => {
    console.log('cleanup');
    // 移除所有的事件监听
    disposable.dispose();
  });
  win.on('closed', () => {
    win = null;
  });

  win.webContents.once('did-stop-loading', async () => {
    const danmakuClient = DanmakuClient.instance(roomId);

    const channelId = danmakuNotificationChannel + win.id;

    const eventEmitter = new AgentEventListener();

    disposable.add(danmakuClient.addEventEmitter(eventEmitter));
    disposable.add(
      eventEmitter.onCommand((command) => {
        if (!win) {
          disposable.dispose();
          return;
        }
        win.webContents.send(channelId, {
          type: EMessageEventType.COMMAND,
          command: {
            name: command.name,
            data: isObject(command.data) ? command.data : command.data.toJSON(),
          },
        });
      })
    );

    eventEmitter.onPopularity((popularity) => {
      if (!win) {
        disposable.dispose();
        return;
      }

      win.webContents.send(channelId, {
        type: EMessageEventType.POPULARITY,
        popularity: popularity.toJSON(),
      });
    });

    ipcMain.once('main-world-setup-channel-done' + win.id, () => {
      danmakuClient.replayEvent(eventEmitter);
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
