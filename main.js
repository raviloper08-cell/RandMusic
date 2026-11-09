const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0c0c0e',
    title: 'R&Music',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    show: false
  });

  mainWindow.loadFile('index.html');

  // Показываем окно только когда готово (чтобы не было белой вспышки)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Открываем внешние ссылки в браузере, а не внутри приложения
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Простое меню
const template = [
  {
    label: 'R&Music',
    submenu: [
      { role: 'about', label: 'О приложении' },
      { type: 'separator' },
      { role: 'quit', label: 'Выход' }
    ]
  },
  {
    label: 'Вид',
    submenu: [
      { role: 'reload', label: 'Обновить' },
      { role: 'toggleDevTools', label: 'Инструменты разработчика' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Сбросить масштаб' },
      { role: 'zoomIn', label: 'Увеличить' },
      { role: 'zoomOut', label: 'Уменьшить' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Полный экран' }
    ]
  }
];

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
