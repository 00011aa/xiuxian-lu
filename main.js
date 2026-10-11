/**
 * 修仙录 - Electron 主进程
 * 负责窗口管理和存档文件读写
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
const savesDir = path.join(app.getPath('userData'), 'saves');

// 确保存档目录存在
function ensureSavesDir() {
  if (!fs.existsSync(savesDir)) {
    fs.mkdirSync(savesDir, { recursive: true });
  }
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: '修仙录',
    backgroundColor: '#0a0a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  ensureSavesDir();
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

// ============ 存档 IPC 处理 ============

// 获取存档目录路径
ipcMain.handle('get-saves-dir', () => {
  return savesDir;
});

// 列出所有存档
ipcMain.handle('list-saves', () => {
  ensureSavesDir();
  try {
    const files = fs.readdirSync(savesDir).filter(f => f.endsWith('.json'));
    const saves = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(savesDir, file), 'utf-8');
        const data = JSON.parse(content);
        saves.push({
          fileName: file,
          name: data.player?.name || '无名',
          path: data.player?.path || '未知',
          realm: data.player?.realmName || '未知',
          playTime: data.player?.playTime || 0,
          savedAt: data.meta?.savedAt || 0,
          saveVersion: data.meta?.saveVersion || 1
        });
      } catch (e) {
        console.error('读取存档失败:', file, e.message);
      }
    }
    // 按保存时间倒序
    saves.sort((a, b) => b.savedAt - a.savedAt);
    return saves;
  } catch (e) {
    console.error('列存档失败:', e.message);
    return [];
  }
});

// 保存存档
ipcMain.handle('save-game', (event, { fileName, data }) => {
  ensureSavesDir();
  try {
    const filePath = path.join(savesDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, filePath };
  } catch (e) {
    console.error('保存失败:', e.message);
    return { success: false, error: e.message };
  }
});

// 加载存档
ipcMain.handle('load-game', (event, { fileName }) => {
  try {
    const filePath = path.join(savesDir, fileName);
    if (!fs.existsSync(filePath)) {
      return { success: false, error: '存档不存在' };
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (e) {
    console.error('加载失败:', e.message);
    return { success: false, error: e.message };
  }
});

// 删除存档
ipcMain.handle('delete-save', (event, { fileName }) => {
  try {
    const filePath = path.join(savesDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (e) {
    console.error('删除失败:', e.message);
    return { success: false, error: e.message };
  }
});

// 导出存档到指定位置
ipcMain.handle('export-save', async (event, { data }) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出存档',
      defaultPath: 'xiuxianlu_save.json',
      filters: [{ name: '存档文件', extensions: ['json'] }]
    });
    if (result.canceled) return { success: false, canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 从文件导入存档
ipcMain.handle('import-save', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '导入存档',
      filters: [{ name: '存档文件', extensions: ['json'] }],
      properties: ['openFile']
    });
    if (result.canceled) return { success: false, canceled: true };
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// 获取应用版本
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
