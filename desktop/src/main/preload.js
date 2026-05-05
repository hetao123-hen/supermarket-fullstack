const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  goods: {
    list: (params) => ipcRenderer.invoke('goods:list', params),

    add: (data) => ipcRenderer.invoke('goods:add', data),

    update: (id, data) => ipcRenderer.invoke('goods:update', id, data),

    delete: (id) => ipcRenderer.invoke('goods:delete', id),

    getById: (id) => ipcRenderer.invoke('goods:getById', id),

    dateSegments: () => ipcRenderer.invoke('goods:dateSegments'),

    export: () => ipcRenderer.invoke('goods:export'),

    import: () => ipcRenderer.invoke('goods:import'),
  },

  onMenuExport: (callback) => {
    ipcRenderer.on('menu-export', () => callback());
  },

  onMenuImport: (callback) => {
    ipcRenderer.on('menu-import', () => callback());
  },
});
