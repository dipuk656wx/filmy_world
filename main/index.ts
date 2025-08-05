import { app, BrowserWindow } from "electron";
import createMainWindow from "./main-window";
let mainWindow: BrowserWindow;
app.whenReady().then(() => {
  mainWindow = createMainWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
app.on("activate", () => {
  mainWindow.show();
});