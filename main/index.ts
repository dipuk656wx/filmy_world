import { app, BrowserWindow } from "electron";
import createMainWindow from "./main-window";
import { setupM3U8ExtractorIPC } from "./ipc/m3u8Extractor";

let mainWindow: BrowserWindow;
app.whenReady().then(() => {
  mainWindow = createMainWindow();
  setupM3U8ExtractorIPC();
});

app.on("window-all-closed", () => {
  app.quit();
});
app.on("activate", () => {
  mainWindow.show();
});