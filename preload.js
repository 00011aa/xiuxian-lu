/**
 * 修仙录 - Preload 脚本
 * 在隔离上下文中向渲染进程暴露安全的 API
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('SaveAPI', {
  getSavesDir: () => ipcRenderer.invoke('get-saves-dir'),
  listSaves: () => ipcRenderer.invoke('list-saves'),
  saveGame: (fileName, data) => ipcRenderer.invoke('save-game', { fileName, data }),
  loadGame: (fileName) => ipcRenderer.invoke('load-game', { fileName }),
  deleteSave: (fileName) => ipcRenderer.invoke('delete-save', { fileName }),
  exportSave: (data) => ipcRenderer.invoke('export-save', { data }),
  importSave: () => ipcRenderer.invoke('import-save'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
