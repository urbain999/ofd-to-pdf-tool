const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 720,
    height: 560,
    minWidth: 560,
    minHeight: 460,
    title: 'OFD 转 PDF 工具',
    backgroundColor: '#f5f7fa',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 渲染进程请求打开系统文件选择框
ipcMain.handle('choose-files', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: '选择 OFD 文件',
    filters: [{ name: 'OFD 版式文档', extensions: ['ofd'] }],
    properties: ['openFile', 'multiSelections']
  });
  if (result.canceled) return [];
  return result.filePaths;
});

// 在资源管理器中显示文件
ipcMain.on('show-item', (event, filePath) => {
  if (filePath && fs.existsSync(filePath)) shell.showItemInFolder(filePath);
});

// 执行转换：files 为路径数组，逐个转，进度回调推送到界面
ipcMain.handle('convert', async (event, files) => {
  // 动态加载转换内核（打包后从 asar 内读取）
  let convertFn;
  try {
    const mod = require('@miconvert/ofd-to-pdf');
    convertFn = mod.convert || mod.default || mod;
  } catch (e) {
    return { ok: 0, fail: files.length, results: [{ name: '内核加载失败', error: e.message }] };
  }

  let ok = 0, fail = 0;
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const input = files[i];
    const name = path.basename(input);
    const output = path.join(path.dirname(input), path.basename(input, path.extname(input)) + '.pdf');
    event.sender.send('convert-progress', { index: i + 1, total: files.length, name, phase: 'start' });
    try {
      await convertFn(input, output, { silent: true });
      const size = fs.existsSync(output) ? fs.statSync(output).size : 0;
      if (size > 0) {
        ok++;
        results.push({ name, output, size, ok: true });
        event.sender.send('convert-progress', { index: i + 1, total: files.length, name, phase: 'done', size });
      } else {
        fail++;
        results.push({ name, ok: false, error: '输出文件为空' });
        event.sender.send('convert-progress', { index: i + 1, total: files.length, name, phase: 'fail', error: '输出文件为空' });
      }
    } catch (e) {
      fail++;
      const msg = e && e.message ? e.message : String(e);
      results.push({ name, ok: false, error: msg });
      event.sender.send('convert-progress', { index: i + 1, total: files.length, name, phase: 'fail', error: msg });
    }
  }
  return { ok, fail, results };
});
