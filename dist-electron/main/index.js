"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const backend_manager_1 = require("./backend-manager");
// ============================================================================
// WINDOWS
// ============================================================================
let splashWindow = null;
let mainWindow = null;
// ============================================================================
// APPLICATION STATE
// ============================================================================
const isDev = !!process.env.VITE_DEV_SERVER_URL;
let splashReady = false;
let backendReady = false;
let mainWindowOpened = false;
let isQuitting = false;
let splashTimerStarted = false;
// ============================================================================
// PATHS
// ============================================================================
function getPreloadPath() {
    return node_path_1.default.join(__dirname, '../preload/index.js');
}
function getRendererPath() {
    return node_path_1.default.join(__dirname, '../../dist/index.html');
}
function getIconPath() {
    return isDev
        ? node_path_1.default.join(__dirname, '../../src/assets/icon.png')
        : node_path_1.default.join(__dirname, '../../dist/assets/icon.png');
}
// ============================================================================
// WINDOW OPTIONS
// ============================================================================
function getWindowOptions() {
    return {
        width: 1200,
        height: 800,
        icon: getIconPath(),
        frame: true,
        resizable: true,
        minimizable: true,
        maximizable: true,
        closable: true,
        show: false,
        backgroundColor: '#09090b',
        webPreferences: {
            preload: getPreloadPath(),
            nodeIntegration: false,
            contextIsolation: true,
        },
    };
}
// ============================================================================
// BACKEND + SPLASH COORDINATION
// ============================================================================
//
// Application startup:
//
//     Electron ready
//          |
//          +-------------------+
//          |                   |
//          v                   v
//     create splash       start backend
//          |                   |
//          v                   v
//     splash animation     /health ready
//          |                   |
//          +---------+---------+
//                    |
//                    v
//              open dashboard
//
// The dashboard cannot open until the backend is healthy.
//
// The splash animation still has a minimum duration of 4.5 seconds.
//
function tryOpenMainWindow() {
    if (mainWindowOpened
        || !splashReady
        || !backendReady
        || isQuitting) {
        return;
    }
    mainWindowOpened = true;
    openMainWindow();
}
// ============================================================================
// BACKEND STARTUP
// ============================================================================
async function initializeBackend() {
    try {
        console.log('Mailstro: Starting backend...');
        await (0, backend_manager_1.startBackend)();
        backendReady = true;
        console.log('Mailstro: Backend ready.', {
            baseUrl: backend_manager_1.backendManager.baseUrl,
            pid: backend_manager_1.backendManager.pid,
        });
        tryOpenMainWindow();
    }
    catch (error) {
        backendReady = false;
        console.error('Mailstro: Failed to start backend:', error);
        await showBackendStartupError(error);
    }
}
// ============================================================================
// BACKEND ERROR
// ============================================================================
async function showBackendStartupError(error) {
    if (isQuitting) {
        return;
    }
    const message = error instanceof Error
        ? error.message
        : String(error);
    isQuitting = true;
    electron_1.dialog.showErrorBox('Mailstro Backend Failed', [
        'The Mailstro backend could not be started.',
        '',
        message,
    ].join('\n'));
    try {
        await (0, backend_manager_1.stopBackend)();
    }
    catch (stopError) {
        console.error('Mailstro: Failed to stop backend after startup failure:', stopError);
    }
    electron_1.app.quit();
}
// ============================================================================
// SPLASH WINDOW
// ============================================================================
function createSplashWindow() {
    splashWindow =
        new electron_1.BrowserWindow(getWindowOptions());
    // --------------------------------------------------------------------------
    // MAXIMIZE
    // --------------------------------------------------------------------------
    splashWindow.maximize();
    // --------------------------------------------------------------------------
    // LOAD ERROR
    // --------------------------------------------------------------------------
    splashWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
        console.error(`Splash failed to load: ${errorCode} - ${errorDescription}`);
    });
    // --------------------------------------------------------------------------
    // READY
    // --------------------------------------------------------------------------
    splashWindow.once('ready-to-show', () => {
        if (!splashWindow
            || splashWindow.isDestroyed()) {
            return;
        }
        splashWindow.maximize();
        splashWindow.show();
        splashWindow.focus();
        console.log('Mailstro: Splash shown.');
        splashReady = true;
        startSplashTimer();
    });
    // --------------------------------------------------------------------------
    // LOAD SPLASH
    // --------------------------------------------------------------------------
    if (isDev) {
        splashWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/splash`);
    }
    else {
        splashWindow.loadFile(getRendererPath(), {
            hash: '/splash',
        });
    }
}
// ============================================================================
// SPLASH TIMER
// ============================================================================
//
// Backend startup and splash animation run independently.
//
// The dashboard is opened only after:
//
//     splashReady
//         +
//     backendReady
//         +
//     4.5 second splash duration
//
function startSplashTimer() {
    if (splashTimerStarted) {
        return;
    }
    splashTimerStarted = true;
    setTimeout(() => {
        tryOpenMainWindow();
    }, 4500);
}
// ============================================================================
// MAIN WINDOW
// ============================================================================
function openMainWindow() {
    console.log('Mailstro: Preparing main window.');
    createMainWindow();
}
function createMainWindow() {
    if (mainWindow
        && !mainWindow.isDestroyed()) {
        return;
    }
    mainWindow =
        new electron_1.BrowserWindow(getWindowOptions());
    // --------------------------------------------------------------------------
    // MATCH SPLASH GEOMETRY
    // --------------------------------------------------------------------------
    mainWindow.maximize();
    // --------------------------------------------------------------------------
    // LOAD ERROR
    // --------------------------------------------------------------------------
    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
        console.error(`Main window failed to load: ${errorCode} - ${errorDescription}`);
    });
    // --------------------------------------------------------------------------
    // LOAD DASHBOARD
    // --------------------------------------------------------------------------
    if (isDev) {
        mainWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/dashboard`);
    }
    else {
        mainWindow.loadFile(getRendererPath(), {
            hash: '/dashboard',
        });
    }
    // --------------------------------------------------------------------------
    // READY TO SHOW
    // --------------------------------------------------------------------------
    mainWindow.once('ready-to-show', () => {
        if (!mainWindow
            || mainWindow.isDestroyed()) {
            return;
        }
        mainWindow.maximize();
        mainWindow.show();
        mainWindow.focus();
        console.log('Mailstro: Dashboard shown.');
        // ----------------------------------------------------------------------
        // CLOSE SPLASH
        // ----------------------------------------------------------------------
        if (splashWindow
            && !splashWindow.isDestroyed()) {
            splashWindow.close();
            splashWindow = null;
        }
    });
    // --------------------------------------------------------------------------
    // MAIN WINDOW CLOSED
    // --------------------------------------------------------------------------
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// ============================================================================
// APPLICATION READY
// ============================================================================
electron_1.app.whenReady().then(() => {
    console.log('Mailstro: Electron ready.');
    // ------------------------------------------------------------------------
    // START SPLASH IMMEDIATELY
    // ------------------------------------------------------------------------
    createSplashWindow();
    // ------------------------------------------------------------------------
    // START BACKEND IN PARALLEL
    // ------------------------------------------------------------------------
    //
    // The splash can render while the backend executable is starting.
    //
    // The dashboard itself is blocked until the backend health check passes.
    //
    void initializeBackend();
});
// ============================================================================
// ELECTRON QUIT
// ============================================================================
//
// Electron's before-quit event is used so the backend process does not remain
// running after Mailstro closes.
//
// The event is intercepted once, backend is terminated, then Electron is
// allowed to quit.
//
electron_1.app.on('before-quit', (event) => {
    if (isQuitting) {
        return;
    }
    isQuitting = true;
    event.preventDefault();
    void (async () => {
        try {
            console.log('Mailstro: Shutting down backend...');
            await (0, backend_manager_1.stopBackend)();
        }
        catch (error) {
            console.error('Mailstro: Failed to stop backend cleanly:', error);
        }
        finally {
            electron_1.app.quit();
        }
    })();
});
// ============================================================================
// ALL WINDOWS CLOSED
// ============================================================================
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// ============================================================================
// MACOS ACTIVATION
// ============================================================================
//
// Normally irrelevant for the Windows package, but keeps Electron's lifecycle
// correct on macOS during development.
//
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0
        && !isQuitting) {
        createSplashWindow();
        void initializeBackend();
    }
});
