const { Menu, app, shell } = require('electron');

function buildAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'About Supermarket Manager',
          click: (menuItem, browserWindow) => {
            const { dialog } = require('electron');
            dialog.showMessageBox(browserWindow, {
              type: 'info',
              title: 'About Supermarket Manager',
              message: 'Supermarket Manager v1.0.0',
              detail: 'A desktop application for supermarket goods management.\n\nBuilt with Electron + React + C Backend.',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: async (menuItem, browserWindow) => {
            browserWindow.webContents.send('menu-export');
          }
        },
        {
          label: 'Import Data',
          accelerator: 'CmdOrCtrl+I',
          click: async (menuItem, browserWindow) => {
            browserWindow.webContents.send('menu-import');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'View on GitHub',
          click: () => {
            shell.openExternal('https://github.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  return menu;
}

module.exports = { buildAppMenu };
