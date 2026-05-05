const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const database = require('./database');
const { buildAppMenu } = require('./menu');

let mainWindow = null;
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'Supermarket Manager',
    backgroundColor: '#f8fafc',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menu = buildAppMenu();
  Menu.setApplicationMenu(menu);
}

function registerIpcHandlers() {

  ipcMain.handle('goods:list', (event, params) => {
    return database.listGoods(params);
  });

  ipcMain.handle('goods:add', (event, data) => {
    return database.addGood(data);
  });

  ipcMain.handle('goods:update', (event, id, data) => {
    return database.updateGood(id, data);
  });

  ipcMain.handle('goods:delete', (event, id) => {
    return database.deleteGood(id);
  });

  ipcMain.handle('goods:getById', (event, id) => {
    return database.getGoodById(id);
  });

  ipcMain.handle('goods:dateSegments', () => {
    return database.getAvailableDateSegments();
  });

  ipcMain.handle('goods:export', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Goods Data',
      defaultPath: 'goods-export.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) return { success: false, message: 'Export cancelled' };

    const fs = require('fs');
    try {
      const goods = database.listGoods({});
      fs.writeFileSync(result.filePath, JSON.stringify(goods, null, 2), 'utf-8');
      return { success: true, message: 'Data exported successfully', path: result.filePath };
    } catch (e) {
      return { success: false, message: 'Export failed: ' + e.message };
    }
  });

  ipcMain.handle('goods:import', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Goods Data',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled) return { success: false, message: 'Import cancelled' };

    const fs = require('fs');
    try {
      const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return { success: false, message: 'Invalid data format: expected an array' };
      }

      let imported = 0;
      for (const item of data) {
        const res = database.addGood(item);
        if (res.success) imported++;
      }

      return { success: true, message: `Imported ${imported} goods successfully` };
    } catch (e) {
      return { success: false, message: 'Import failed: ' + e.message };
    }
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
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
