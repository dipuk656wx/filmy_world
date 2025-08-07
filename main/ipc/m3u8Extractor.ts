import { BrowserWindow, ipcMain } from 'electron';

interface M3U8ExtractorOptions {
  url: string;
  timeout?: number;
  userAgent?: string;
  waitForLoad?: boolean;
}

export function setupM3U8ExtractorIPC() {
  ipcMain.handle('extract-m3u8', async (event, options: M3U8ExtractorOptions) => {
    const { 
      url, 
      timeout = 30000, 
      userAgent,
      waitForLoad = true
    } = options;
    
    return new Promise<string>((resolve, reject) => {
      let hiddenWindow: BrowserWindow | null = null;
      let timeoutId: NodeJS.Timeout;
      let hasResolved = false;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (hiddenWindow && !hiddenWindow.isDestroyed()) {
          hiddenWindow.destroy();
        }
      };

      const resolveWithResult = (result: string) => {
        if (hasResolved) return;
        hasResolved = true;
        cleanup();
        resolve(result);
      };

      const rejectWithError = (error: Error) => {
        if (hasResolved) return;
        hasResolved = true;
        cleanup();
        reject(error);
      };

      try {
        // Create hidden window
        hiddenWindow = new BrowserWindow({
          show: false,
          width: 1280,
          height: 720,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            // Enable loading of mixed content
            experimentalFeatures: true,
          },
        });

        // Set user agent if provided
        if (userAgent) {
          hiddenWindow.webContents.setUserAgent(userAgent);
        }

        // Set timeout
        timeoutId = setTimeout(() => {
          rejectWithError(new Error('Timeout: No M3U8 link found within the specified time'));
        }, timeout);

        // Intercept network requests
        hiddenWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
          // Check if the URL ends with .m3u8 or contains m3u8
          if (details.url.endsWith('.m3u8') || details.url.includes('.m3u8')) {
            // Return the first M3U8 found immediately
            resolveWithResult(details.url);
            return;
          }
          
          // Allow the request to continue
          callback({});
        });

        // Handle page load completion
        hiddenWindow.webContents.once('did-finish-load', () => {
          if (waitForLoad) {
            // Wait a bit for potential AJAX requests and dynamic content
            setTimeout(() => {
              rejectWithError(new Error('No M3U8 link found on the page'));
            }, 5000);
          }
        });

        // Handle navigation errors
        hiddenWindow.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
          rejectWithError(new Error(`Failed to load page: ${errorDescription} (Code: ${errorCode})`));
        });

        // Load the target URL
        hiddenWindow.loadURL(url).catch((error) => {
          rejectWithError(new Error(`Failed to load URL: ${error.message}`));
        });

      } catch (error) {
        rejectWithError(error instanceof Error ? error : new Error('Unknown error occurred'));
      }
    });
  });
}
