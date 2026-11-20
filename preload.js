const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  chooseFiles: () => ipcRenderer.invoke('choose-files'),
  convert: (files) => ipcRenderer.invoke('convert', files),
  onProgress: (cb) => ipcRenderer.on('convert-progress', (event, data) => cb(data)),
  showItem: (filePath) => ipcRenderer.send('show-item', filePath),
  // Electron 33 取拖拽文件路径的官方方式
  getPathForFile: (file) => {
    try { return webUtils.getPathForFile(file); }
    catch (e) { return file.path || null; }
  }
});
