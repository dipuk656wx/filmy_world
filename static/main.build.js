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
var mainWindow;
electron_1.app.whenReady().then(function () {
    mainWindow = (0, main_window_1.default)();
});
electron_1.app.on("window-all-closed", function () {
    electron_1.app.quit();
});
electron_1.app.on("activate", function () {
    mainWindow.show();
});


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
        icon: path.join(__dirname, "/images/course_world.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !electron_1.app.isPackaged,
            webSecurity: false, // Allow external API requests
            allowRunningInsecureContent: true,
        },
    });
    mainWindow.removeMenu();
    mainWindow.setTitle("Filmy World");
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