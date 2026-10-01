import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  send: (channel: string, data?: unknown) => void;
  on: (channel: string, func: (...args: unknown[]) => void) => void;
}

const api: ElectronAPI = {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (_event, ...args) => func(...args)),
};

contextBridge.exposeInMainWorld('electronAPI', api);