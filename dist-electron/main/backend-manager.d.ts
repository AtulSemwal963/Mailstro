export interface BackendManagerOptions {
    executablePath?: string;
    host?: string;
    port?: number;
    healthTimeoutMs?: number;
    healthIntervalMs?: number;
}
export declare class BackendManager {
    private process;
    private startingPromise;
    private stoppingPromise;
    private readonly executablePathOverride;
    private readonly host;
    private readonly port;
    private readonly healthTimeoutMs;
    private readonly healthIntervalMs;
    private backendStdout;
    private backendStderr;
    constructor(options?: BackendManagerOptions);
    get baseUrl(): string;
    get healthUrl(): string;
    get pid(): number | null;
    get isRunning(): boolean;
    start(): Promise<void>;
    private startInternal;
    waitForHealth(): Promise<void>;
    private checkTcpConnection;
    private requestHealth;
    stop(): Promise<void>;
    private stopInternal;
    private killWindowsProcessTree;
    private waitForProcessExit;
    private resolveExecutablePath;
    private resolveDataDirectory;
    private appendLog;
    private formatBackendLogs;
    private sleep;
}
export declare const backendManager: BackendManager;
export declare function startBackend(): Promise<void>;
export declare function stopBackend(): Promise<void>;
export default backendManager;
