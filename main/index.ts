import updateElectron from 'update-electron-app';

updateElectron();

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  Tray,
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

interface IDanmakuWindowInfo {
  roomId: string;
}

const danmakuWindowIds = new Map<number, IDanmakuWindowInfo>();

interface IWindowState {
  shouldKeepFocus: boolean;
}

const defaultWindowState: IWindowState = {
  shouldKeepFocus: false,
};

const windowStateMap = new Map<number, IWindowState>();

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
      label: 'Close',
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

const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
  return win;
};

const createDanmakuWindow = (roomId: string) => {
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
  function setIgnoreMouseEvents(ignore: boolean) {
    const windowState = windowStateMap.get(win.id) ?? defaultWindowState;
    if (windowState.shouldKeepFocus) {
      return;
    }
    win.setIgnoreMouseEvents(ignore);
  }
  win.on('blur', () => {
    setIgnoreMouseEvents(true);
  });
  win.on('focus', () => {
    setIgnoreMouseEvents(false);
  });
  win.on('resize', () => {
    setIgnoreMouseEvents(false);
  });
  win.on('will-resize', () => {
    setIgnoreMouseEvents(false);
  });

  if (process.env.NODE_ENV === 'production') {
    win.loadFile(path.join(__dirname, '../renderer/danmaku.html'));
  } else {
    win.loadURL('http://localhost:5173/danmaku.html');
  }

  const disposable = new Disposable();
  danmakuWindowIds.set(win.id, {
    roomId,
  });
  disposable.add({
    dispose: () => {
      danmakuWindowIds.delete(win.id);
    },
  });
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
  });
  win.webContents.openDevTools();
};

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function buildTray() {
  const danmakuWindow = Array.from(
    danmakuWindowIds.entries(),
    ([id, { roomId }]) => ({
      label: `${id}: Room ${roomId}`,
      type: 'submenu',
      submenu: [
        {
          label: 'Close',
          click: () => {
            const win = BrowserWindow.fromId(id);
            if (win) {
              win.close();
            }
          },
        },
        {
          label: 'Keep focus',
          type: 'checkbox',
          checked: (windowStateMap.get(id) ?? defaultWindowState)
            .shouldKeepFocus,
          click: () => {
            const oldState = windowStateMap.get(id) ?? defaultWindowState;
            windowStateMap.set(id, {
              ...oldState,
              shouldKeepFocus: !oldState.shouldKeepFocus,
            });
            const win = BrowserWindow.fromId(id);
            if (win) {
              win.setIgnoreMouseEvents(false);
              win.focus();
            }
          },
        },
      ],
    })
  ) as Electron.MenuItemConstructorOptions[];
  if (danmakuWindow.length > 0) {
    danmakuWindow.push({ type: 'separator' });
  }
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Main Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          mainWindow = createMainWindow();
        }
      },
    },
    { type: 'separator' },
    ...danmakuWindow,
    {
      label: 'Quit',
      role: 'quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Bililive');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.on('close', () => {
    mainWindow = null;
  });

  tray = new Tray('./assets/icons/png/24x24.png');
  buildTray();
  tray.on('click', () => {
    buildTray();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
