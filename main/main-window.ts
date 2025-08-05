import { app, BrowserWindow } from "electron";
import { watch } from "fs";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    minWidth: 980,
    minHeight: 680,
    show: false,
    backgroundColor: "#181818",
    alwaysOnTop: false,
    icon: path.join(__dirname, "/images/course_world.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !app.isPackaged,
      webSecurity: false, // Allow external API requests
      allowRunningInsecureContent: true,
    },
  });

  mainWindow.removeMenu();
  mainWindow.setTitle(`Filmy World`);
  mainWindow.loadFile(path.join(__dirname, "..", "static", "index.html"));

  // Only open DevTools in development and after window is ready
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (!app.isPackaged) {
      mainWindow?.webContents.openDevTools();
    }
  });

  if (!app.isPackaged) {
    watch(__dirname, () => {
      mainWindow?.reload();
    });
  }

  return mainWindow;
}

export default createMainWindow;

