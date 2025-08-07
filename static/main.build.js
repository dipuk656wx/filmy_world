/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./main/index.ts":
/*!***********************!*\
  !*** ./main/index.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var electron_1 = __webpack_require__(/*! electron */ "electron");
var main_window_1 = __importDefault(__webpack_require__(/*! ./main-window */ "./main/main-window.ts"));
var m3u8Extractor_1 = __webpack_require__(/*! ./ipc/m3u8Extractor */ "./main/ipc/m3u8Extractor.ts");
var mainWindow;
electron_1.app.whenReady().then(function () {
    mainWindow = (0, main_window_1.default)();
    (0, m3u8Extractor_1.setupM3U8ExtractorIPC)();
});
electron_1.app.on("window-all-closed", function () {
    electron_1.app.quit();
});
electron_1.app.on("activate", function () {
    mainWindow.show();
});


/***/ }),

/***/ "./main/ipc/m3u8Extractor.ts":
/*!***********************************!*\
  !*** ./main/ipc/m3u8Extractor.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupM3U8ExtractorIPC = setupM3U8ExtractorIPC;
var electron_1 = __webpack_require__(/*! electron */ "electron");
function setupM3U8ExtractorIPC() {
    var _this = this;
    electron_1.ipcMain.handle('extract-m3u8', function (event, options) { return __awaiter(_this, void 0, void 0, function () {
        var url, _a, timeout, userAgent, _b, waitForLoad;
        return __generator(this, function (_c) {
            url = options.url, _a = options.timeout, timeout = _a === void 0 ? 30000 : _a, userAgent = options.userAgent, _b = options.waitForLoad, waitForLoad = _b === void 0 ? true : _b;
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var hiddenWindow = null;
                    var timeoutId;
                    var hasResolved = false;
                    var cleanup = function () {
                        if (timeoutId)
                            clearTimeout(timeoutId);
                        if (hiddenWindow && !hiddenWindow.isDestroyed()) {
                            hiddenWindow.destroy();
                        }
                    };
                    var resolveWithResult = function (result) {
                        if (hasResolved)
                            return;
                        hasResolved = true;
                        cleanup();
                        resolve(result);
                    };
                    var rejectWithError = function (error) {
                        if (hasResolved)
                            return;
                        hasResolved = true;
                        cleanup();
                        reject(error);
                    };
                    try {
                        // Create hidden window
                        hiddenWindow = new electron_1.BrowserWindow({
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
                        timeoutId = setTimeout(function () {
                            rejectWithError(new Error('Timeout: No M3U8 link found within the specified time'));
                        }, timeout);
                        // Intercept network requests
                        hiddenWindow.webContents.session.webRequest.onBeforeRequest(function (details, callback) {
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
                        hiddenWindow.webContents.once('did-finish-load', function () {
                            if (waitForLoad) {
                                // Wait a bit for potential AJAX requests and dynamic content
                                setTimeout(function () {
                                    rejectWithError(new Error('No M3U8 link found on the page'));
                                }, 5000);
                            }
                        });
                        // Handle navigation errors
                        hiddenWindow.webContents.once('did-fail-load', function (event, errorCode, errorDescription) {
                            rejectWithError(new Error("Failed to load page: ".concat(errorDescription, " (Code: ").concat(errorCode, ")")));
                        });
                        // Load the target URL
                        hiddenWindow.loadURL(url).catch(function (error) {
                            rejectWithError(new Error("Failed to load URL: ".concat(error.message)));
                        });
                    }
                    catch (error) {
                        rejectWithError(error instanceof Error ? error : new Error('Unknown error occurred'));
                    }
                })];
        });
    }); });
}


/***/ }),

/***/ "./main/main-window.ts":
/*!*****************************!*\
  !*** ./main/main-window.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
var electron_1 = __webpack_require__(/*! electron */ "electron");
var fs_1 = __webpack_require__(/*! fs */ "fs");
var path = __importStar(__webpack_require__(/*! path */ "path"));
var mainWindow = null;
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        minWidth: 980,
        minHeight: 680,
        show: false,
        backgroundColor: "#181818",
        alwaysOnTop: false,
        icon: path.join(__dirname, "/images/showtime_icon.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !electron_1.app.isPackaged,
            webSecurity: false, // Allow external API requests
            allowRunningInsecureContent: true,
        },
    });
    mainWindow.removeMenu();
    mainWindow.setTitle("Showtime");
    mainWindow.loadFile(path.join(__dirname, "..", "static", "index.html"));
    // Only open DevTools in development and after window is ready
    mainWindow.once("ready-to-show", function () {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
        if (!electron_1.app.isPackaged) {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.openDevTools();
        }
    });
    if (!electron_1.app.isPackaged) {
        (0, fs_1.watch)(__dirname, function () {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.reload();
        });
    }
    return mainWindow;
}
exports["default"] = createMainWindow;


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./main/index.ts");
/******/ 	
/******/ })()
;