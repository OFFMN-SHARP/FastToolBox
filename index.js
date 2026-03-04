const {
    app,BrowserWindow,ipcMain,screen,event
} = require('electron');
const path = require('path');
function createWindow() {
    const {width: WindowSize_width, height: WindowSize_height} = screen.getPrimaryDisplay().workAreaSize;
    const GUI_Window = new BrowserWindow({
        width: 500,
        height: 100,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        x:WindowSize_width-500,
        y:WindowSize_height-120,
        });
    GUI_Window.loadFile('index.html')
    ipcMain.on('close-window', () => {
        GUI_Window.close();
    });
    ipcMain.on('move-window', (event, deltaX, deltaY) => {
        const [currentX, currentY] = GUI_Window.getPosition();
        GUI_Window.setPosition(currentX + deltaX, currentY + deltaY);
    });
// 修正后的代码
ipcMain.on('run-command', (event, { command, isSudo }) => { // 1. 第一个参数是event，第二个是解构的数据
    const { exec } = require('child_process');
    const isWindows = process.platform === 'win32';
    const finalCommand = isSudo && !isWindows ? `sudo ${command}` : command; // 2. 使用解构得到的 isSudo

    exec(finalCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            event.reply('command-output', `Error: ${error.message}`); // 3. 使用正确的event对象回复
            return;
        }
        const output = stdout || stderr || 'Command executed (no output)';
        console.log(`Command output: ${output}`);
        event.reply('command-output', output); // 4. 回复实际的命令输出
    });
});
} 
app.whenReady().then(() => {
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