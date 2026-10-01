// src/main/backend-manager.ts

import { app } from 'electron';

import {
  spawn,
  type ChildProcess,
} from 'node:child_process';

import {
  existsSync,
  mkdirSync,
} from 'node:fs';

import http from 'node:http';

import net from 'node:net';

import path from 'node:path';


// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_HOST =
  '127.0.0.1';

const BACKEND_PORT =
  8765;

const BACKEND_HEALTH_PATH =
  '/health';

const HEALTH_CHECK_INTERVAL_MS =
  250;

/*
 * A packaged PyInstaller one-file executable can take significantly longer
 * on a cold Windows launch because the archive must be extracted and the
 * Python dependency graph must initialize.
 *
 * 60 seconds prevents a legitimate slow first launch from being treated
 * as a backend failure.
 */
const HEALTH_CHECK_TIMEOUT_MS =
  60_000;

const HEALTH_REQUEST_TIMEOUT_MS =
  2_000;


// ============================================================================
// TYPES
// ============================================================================

export interface BackendManagerOptions {
  executablePath?: string;

  host?: string;

  port?: number;

  healthTimeoutMs?: number;

  healthIntervalMs?: number;
}


// ============================================================================
// BACKEND MANAGER
// ============================================================================

export class BackendManager {
  private process: ChildProcess | null =
    null;

  private startingPromise:
    Promise<void> | null =
    null;

  private stoppingPromise:
    Promise<void> | null =
    null;

  private readonly executablePathOverride:
    string | undefined;

  private readonly host:
    string;

  private readonly port:
    number;

  private readonly healthTimeoutMs:
    number;

  private readonly healthIntervalMs:
    number;

  private backendStdout =
    '';

  private backendStderr =
    '';


  constructor(
    options: BackendManagerOptions = {},
  ) {
    this.executablePathOverride =
      options.executablePath;

    this.host =
      options.host ??
      BACKEND_HOST;

    this.port =
      options.port ??
      BACKEND_PORT;

    this.healthTimeoutMs =
      options.healthTimeoutMs ??
      HEALTH_CHECK_TIMEOUT_MS;

    this.healthIntervalMs =
      options.healthIntervalMs ??
      HEALTH_CHECK_INTERVAL_MS;
  }


  // ==========================================================================
  // URLS
  // ==========================================================================

  public get baseUrl(): string {
    return (
      `http://${this.host}:${this.port}`
    );
  }


  public get healthUrl(): string {
    return (
      `${this.baseUrl}${BACKEND_HEALTH_PATH}`
    );
  }


  // ==========================================================================
  // PROCESS STATE
  // ==========================================================================

  public get pid(): number | null {
    return (
      this.process?.pid ??
      null
    );
  }


  public get isRunning(): boolean {
    return (
      this.process !== null &&
      this.process.exitCode === null &&
      !this.process.killed
    );
  }


  // ==========================================================================
  // START
  // ==========================================================================

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log(
        'Mailstro: Backend is already running.',
        {
          pid:
            this.pid,
        },
      );

      return;
    }


    if (this.startingPromise) {
      console.log(
        'Mailstro: Backend startup already in progress.',
      );

      return this.startingPromise;
    }


    this.startingPromise =
      this.startInternal();


    try {
      await this.startingPromise;

    } finally {
      this.startingPromise = null;
    }
  }


  private async startInternal(): Promise<void> {
    const startupStartedAt =
      Date.now();


    const executablePath =
      this.resolveExecutablePath();


    // =========================================================================
    // EXECUTABLE VALIDATION
    // =========================================================================

    if (!existsSync(executablePath)) {
      throw new Error(
        [
          'Mailstro backend executable was not found.',
          '',
          `Expected path: ${executablePath}`,
        ].join('\n'),
      );
    }


    // =========================================================================
    // WRITABLE DATA DIRECTORY
    // =========================================================================

    const dataDirectory =
      this.resolveDataDirectory();


    mkdirSync(
      dataDirectory,
      {
        recursive: true,
      },
    );


    this.backendStdout =
      '';

    this.backendStderr =
      '';


    // =========================================================================
    // BACKEND ENVIRONMENT
    // =========================================================================

    const backendEnvironment:
      NodeJS.ProcessEnv = {
        ...process.env,

        MAILSTRO_DATA_DIR:
          dataDirectory,

        MAILSTRO_HOST:
          this.host,

        MAILSTRO_PORT:
          String(
            this.port,
          ),

        PYTHONUNBUFFERED:
          '1',
      };


    // =========================================================================
    // BACKEND WORKING DIRECTORY
    // =========================================================================

    const backendWorkingDirectory =
      path.dirname(
        executablePath,
      );


    // =========================================================================
    // STARTUP DIAGNOSTICS
    // =========================================================================

    console.log(
      'Mailstro: Starting backend.',
    );

    console.log(
      'Mailstro: Backend executable:',
      executablePath,
    );

    console.log(
      'Mailstro: Backend executable exists:',
      existsSync(
        executablePath,
      ),
    );

    console.log(
      'Mailstro: Backend working directory:',
      backendWorkingDirectory,
    );

    console.log(
      'Mailstro: Backend data directory:',
      dataDirectory,
    );

    console.log(
      'Mailstro: Backend URL:',
      this.baseUrl,
    );

    console.log(
      'Mailstro: Backend health URL:',
      this.healthUrl,
    );

    console.log(
      'Mailstro: Backend health timeout:',
      `${this.healthTimeoutMs}ms`,
    );


    // =========================================================================
    // SPAWN
    // =========================================================================

    const child =
      spawn(
        executablePath,
        [],
        {
          cwd:
            backendWorkingDirectory,

          env:
            backendEnvironment,

          windowsHide:
            true,

          shell:
            false,

          stdio: [
            'ignore',
            'pipe',
            'pipe',
          ],
        },
      );


    this.process =
      child;


    console.log(
      'Mailstro: Backend process spawned.',
      {
        pid:
          child.pid,

        spawnfile:
          child.spawnfile,

        spawnargs:
          child.spawnargs,

        cwd:
          backendWorkingDirectory,
      },
    );


    // =========================================================================
    // STDOUT
    // =========================================================================

    child.stdout?.on(
      'data',
      (
        chunk: Buffer,
      ) => {
        const output =
          chunk.toString(
            'utf8',
          );


        this.backendStdout =
          this.appendLog(
            this.backendStdout,
            output,
          );


        const trimmed =
          output.trim();


        if (trimmed) {
          console.log(
            `[Mailstro Backend] ${trimmed}`,
          );
        }
      },
    );


    // =========================================================================
    // STDERR
    // =========================================================================

    child.stderr?.on(
      'data',
      (
        chunk: Buffer,
      ) => {
        const output =
          chunk.toString(
            'utf8',
          );


        this.backendStderr =
          this.appendLog(
            this.backendStderr,
            output,
          );


        const trimmed =
          output.trim();


        if (trimmed) {
          console.error(
            `[Mailstro Backend] ${trimmed}`,
          );
        }
      },
    );


    // =========================================================================
    // SPAWN ERROR
    // =========================================================================

    const childErrorPromise =
      new Promise<never>(
        (
          _resolve,
          reject,
        ) => {
          child.once(
            'error',
            (
              error,
            ) => {
              console.error(
                'Mailstro: Backend child process error.',
                error,
              );


              reject(
                new Error(
                  [
                    'Mailstro backend process failed to start.',
                    '',
                    `Executable: ${executablePath}`,
                    `Working directory: ${backendWorkingDirectory}`,
                    `Error: ${error.message}`,
                    '',
                    this.formatBackendLogs(),
                  ].join('\n'),
                ),
              );
            },
          );
        },
      );


    // =========================================================================
    // PROCESS CLOSE
    // =========================================================================

    child.once(
      'close',
      (
        code,
        signal,
      ) => {
        console.log(
          'Mailstro: Backend process closed.',
          {
            pid:
              child.pid,

            code,

            signal,
          },
        );
      },
    );


    // =========================================================================
    // PROCESS EXIT
    // =========================================================================

    const childExitPromise =
      new Promise<never>(
        (
          _resolve,
          reject,
        ) => {
          child.once(
            'exit',
            (
              code,
              signal,
            ) => {
              if (
                this.process === child
              ) {
                this.process = null;
              }


              console.error(
                'Mailstro: Backend process exited.',
                {
                  pid:
                    child.pid,

                  code,

                  signal,
                },
              );


              reject(
                new Error(
                  [
                    'Mailstro backend exited before becoming healthy.',
                    '',
                    `Executable: ${executablePath}`,
                    `Working directory: ${backendWorkingDirectory}`,
                    `Exit code: ${code ?? 'unknown'}`,
                    `Signal: ${signal ?? 'none'}`,
                    '',
                    this.formatBackendLogs(),
                  ].join('\n'),
                ),
              );
            },
          );
        },
      );


    // =========================================================================
    // WAIT FOR HEALTH
    // =========================================================================

    try {
      await Promise.race([
        this.waitForHealth(),
        childErrorPromise,
        childExitPromise,
      ]);

    } catch (error) {
      console.error(
        'Mailstro: Backend startup failed.',
        error,
      );


      await this.stop();

      throw error;
    }


    const startupDuration =
      Date.now() -
      startupStartedAt;


    console.log(
      'Mailstro: Backend is healthy.',
      {
        pid:
          child.pid,

        url:
          this.baseUrl,

        startupDurationMs:
          startupDuration,
      },
    );
  }


  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  public async waitForHealth(): Promise<void> {
    const startedAt =
      Date.now();


    let attempt =
      0;


    let lastError:
      | Error
      | null =
      null;


    while (
      Date.now() - startedAt <
      this.healthTimeoutMs
    ) {
      attempt += 1;


      // ----------------------------------------------------------------------
      // PROCESS MUST EXIST
      // ----------------------------------------------------------------------

      if (
        this.process === null
      ) {
        throw new Error(
          [
            'Mailstro backend process is no longer running.',
            '',
            this.formatBackendLogs(),
          ].join('\n'),
        );
      }


      // ----------------------------------------------------------------------
      // PROCESS MUST NOT HAVE EXITED
      // ----------------------------------------------------------------------

      if (
        this.process.exitCode !== null
      ) {
        throw new Error(
          [
            'Mailstro backend exited before becoming healthy.',
            '',
            `Exit code: ${this.process.exitCode}`,
            '',
            this.formatBackendLogs(),
          ].join('\n'),
        );
      }


      console.log(
        'Mailstro: Health check attempt.',
        {
          attempt,

          elapsedMs:
            Date.now() -
            startedAt,

          pid:
            this.pid,

          url:
            this.healthUrl,
        },
      );


      // ----------------------------------------------------------------------
      // TCP CHECK
      // ----------------------------------------------------------------------

      try {
        await this.checkTcpConnection();


        console.log(
          'Mailstro: Backend TCP connection succeeded.',
          {
            attempt,

            elapsedMs:
              Date.now() -
              startedAt,

            host:
              this.host,

            port:
              this.port,
          },
        );

      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error(
                String(
                  error,
                ),
              );


        console.log(
          'Mailstro: Backend TCP connection failed.',
          {
            attempt,

            elapsedMs:
              Date.now() -
              startedAt,

            error:
              lastError.message,
          },
        );


        await this.sleep(
          this.healthIntervalMs,
        );


        continue;
      }


      // ----------------------------------------------------------------------
      // HTTP HEALTH CHECK
      // ----------------------------------------------------------------------

      try {
        const health =
          await this.requestHealth();


        console.log(
          'Mailstro: Backend health response received.',
          {
            attempt,

            elapsedMs:
              Date.now() -
              startedAt,

            statusCode:
              health.statusCode,

            body:
              health.body,
          },
        );


        if (
          health.statusCode >= 200 &&
          health.statusCode < 300
        ) {
          let body:
            unknown =
            null;


          try {
            body =
              JSON.parse(
                health.body,
              );

          } catch {
            body =
              null;
          }


          // ------------------------------------------------------------------
          // EXPECTED HEALTH PAYLOAD
          // ------------------------------------------------------------------

          if (
            body &&
            typeof body === 'object' &&
            'success' in body &&
            'status' in body &&
            (
              body as {
                success?: unknown;
              }
            ).success === true &&
            (
              body as {
                status?: unknown;
              }
            ).status === 'healthy'
          ) {
            console.log(
              'Mailstro: Backend health check succeeded.',
              {
                attempt,

                elapsedMs:
                  Date.now() -
                  startedAt,

                pid:
                  this.pid,
              },
            );


            return;
          }


          lastError =
            new Error(
              [
                'Backend health endpoint responded,',
                'but returned an invalid health payload.',
                '',
                `HTTP ${health.statusCode}`,
                `Response: ${health.body}`,
              ].join('\n'),
            );

        } else {
          lastError =
            new Error(
              [
                `Backend health returned HTTP ${health.statusCode}.`,
                '',
                health.body,
              ].join('\n'),
            );
        }

      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error(
                String(
                  error,
                ),
              );


        console.log(
          'Mailstro: Backend HTTP health check failed.',
          {
            attempt,

            elapsedMs:
              Date.now() -
              startedAt,

            error:
              lastError.message,
          },
        );
      }


      await this.sleep(
        this.healthIntervalMs,
      );
    }


    throw new Error(
      [
        'Mailstro backend failed to become healthy within the startup timeout.',
        '',
        `Health URL: ${this.healthUrl}`,
        '',
        `Timeout: ${this.healthTimeoutMs}ms`,
        '',
        lastError
          ? `Last error: ${lastError.message}`
          : 'No health response received.',
        '',
        `Backend PID: ${this.pid ?? 'unknown'}`,
        '',
        this.formatBackendLogs(),
      ]
        .filter(
          (
            value,
          ) => value !== '',
        )
        .join('\n'),
    );
  }


  // ==========================================================================
  // TCP CONNECTIVITY CHECK
  // ==========================================================================

  private checkTcpConnection(): Promise<void> {
    return new Promise(
      (
        resolve,
        reject,
      ) => {
        const socket =
          net.createConnection({
            host:
              this.host,

            port:
              this.port,
          });


        let settled =
          false;


        const cleanup =
          () => {
            socket.removeAllListeners();
            socket.destroy();
          };


        const succeed =
          () => {
            if (
              settled
            ) {
              return;
            }


            settled =
              true;


            cleanup();


            resolve();
          };


        const fail =
          (
            error: Error,
          ) => {
            if (
              settled
            ) {
              return;
            }


            settled =
              true;


            cleanup();


            reject(
              error,
            );
          };


        socket.once(
          'connect',
          () => {
            succeed();
          },
        );


        socket.once(
          'error',
          (
            error,
          ) => {
            fail(
              error,
            );
          },
        );


        socket.setTimeout(
          HEALTH_REQUEST_TIMEOUT_MS,
          () => {
            fail(
              new Error(
                `TCP connection to ${this.host}:${this.port} timed out.`,
              ),
            );
          },
        );
      },
    );
  }


  // ==========================================================================
  // HEALTH REQUEST
  // ==========================================================================

  private requestHealth(): Promise<{
    statusCode: number;
    body: string;
  }> {
    return new Promise(
      (
        resolve,
        reject,
      ) => {
        const request =
          http.request(
            {
              hostname:
                this.host,

              port:
                this.port,

              path:
                BACKEND_HEALTH_PATH,

              method:
                'GET',

              headers: {
                Accept:
                  'application/json',
              },
            },

            (
              response,
            ) => {
              const chunks:
                Buffer[] =
                [];


              response.on(
                'data',
                (
                  chunk: Buffer,
                ) => {
                  chunks.push(
                    chunk,
                  );
                },
              );


              response.once(
                'end',
                () => {
                  resolve({
                    statusCode:
                      response.statusCode ??
                      0,

                    body:
                      Buffer
                        .concat(
                          chunks,
                        )
                        .toString(
                          'utf8',
                        ),
                  });
                },
              );
            },
          );


        request.setTimeout(
          HEALTH_REQUEST_TIMEOUT_MS,
          () => {
            request.destroy(
              new Error(
                'Backend health request timed out.',
              ),
            );
          },
        );


        request.once(
          'error',
          (
            error,
          ) => {
            reject(
              error,
            );
          },
        );


        request.end();
      },
    );
  }


  // ==========================================================================
  // STOP
  // ==========================================================================

  public async stop(): Promise<void> {
    if (
      !this.process
    ) {
      return;
    }


    if (
      this.stoppingPromise
    ) {
      return this.stoppingPromise;
    }


    this.stoppingPromise =
      this.stopInternal();


    try {
      await this.stoppingPromise;

    } finally {
      this.stoppingPromise = null;
    }
  }


  private async stopInternal(): Promise<void> {
    const child =
      this.process;


    if (!child) {
      return;
    }


    console.log(
      'Mailstro: Stopping backend.',
      {
        pid:
          child.pid,
      },
    );


    // ------------------------------------------------------------------------
    // ALREADY EXITED
    // ------------------------------------------------------------------------

    if (
      child.exitCode !== null
    ) {
      this.process = null;

      return;
    }


    // ------------------------------------------------------------------------
    // WINDOWS
    // ------------------------------------------------------------------------

    if (
      process.platform === 'win32' &&
      child.pid
    ) {
      await this.killWindowsProcessTree(
        child.pid,
      );


      this.process = null;

      return;
    }


    // ------------------------------------------------------------------------
    // POSIX
    // ------------------------------------------------------------------------

    try {
      child.kill(
        'SIGTERM',
      );

    } catch {
      // Process may already have exited.
    }


    await this.waitForProcessExit(
      child,
      5_000,
    );


    this.process = null;
  }


  // ==========================================================================
  // WINDOWS PROCESS TREE
  // ==========================================================================

  private async killWindowsProcessTree(
    pid: number,
  ): Promise<void> {
    await new Promise<void>(
      (
        resolve,
      ) => {
        const killer =
          spawn(
            'taskkill',
            [
              '/PID',
              String(
                pid,
              ),
              '/T',
              '/F',
            ],
            {
              windowsHide:
                true,

              stdio:
                'ignore',
            },
          );


        killer.once(
          'error',
          () => {
            resolve();
          },
        );


        killer.once(
          'exit',
          () => {
            resolve();
          },
        );
      },
    );
  }


  // ==========================================================================
  // WAIT FOR PROCESS EXIT
  // ==========================================================================

  private async waitForProcessExit(
    child: ChildProcess,
    timeoutMs: number,
  ): Promise<void> {
    if (
      child.exitCode !== null
    ) {
      return;
    }


    await new Promise<void>(
      (
        resolve,
      ) => {
        let settled =
          false;


        const cleanup =
          () => {
            child.removeListener(
              'exit',
              onExit,
            );
          };


        const finish =
          () => {
            if (
              settled
            ) {
              return;
            }


            settled =
              true;


            cleanup();


            resolve();
          };


        const onExit =
          () => {
            finish();
          };


        child.once(
          'exit',
          onExit,
        );


        setTimeout(
          finish,
          timeoutMs,
        );
      },
    );
  }


  // ==========================================================================
  // EXECUTABLE PATH
  // ==========================================================================

  private resolveExecutablePath(): string {
    // ------------------------------------------------------------------------
    // EXPLICIT OVERRIDE
    // ------------------------------------------------------------------------

    if (
      this.executablePathOverride
    ) {
      return path.resolve(
        this.executablePathOverride,
      );
    }


    // ------------------------------------------------------------------------
    // PACKAGED ELECTRON
    // ------------------------------------------------------------------------

    if (
      app.isPackaged
    ) {
      return path.join(
        process.resourcesPath,
        'backend',
        'mailstro-backend.exe',
      );
    }


    // ------------------------------------------------------------------------
    // DEVELOPMENT
    // ------------------------------------------------------------------------

    return path.join(
      app.getAppPath(),
      'backend',
      'mailstro-backend.exe',
    );
  }


  // ==========================================================================
  // DATA DIRECTORY
  // ==========================================================================

  private resolveDataDirectory(): string {
    return path.join(
      app.getPath('userData'),
      'backend-data',
    );
  }


  // ==========================================================================
  // LOG BUFFER
  // ==========================================================================

  private appendLog(
    existing: string,
    incoming: string,
  ): string {
    const combined =
      existing + incoming;


    return (
      combined.length > 12_000
        ? combined.slice(
            -12_000,
          )
        : combined
    );
  }


  private formatBackendLogs(): string {
    const stdout =
      this.backendStdout.trim();


    const stderr =
      this.backendStderr.trim();


    const sections:
      string[] =
      [];


    if (stdout) {
      sections.push(
        [
          'BACKEND STDOUT:',
          stdout,
        ].join('\n'),
      );
    }


    if (stderr) {
      sections.push(
        [
          'BACKEND STDERR:',
          stderr,
        ].join('\n'),
      );
    }


    return (
      sections.length > 0
        ? sections.join('\n\n')
        : 'No backend output was captured.'
    );
  }


  // ==========================================================================
  // SLEEP
  // ==========================================================================

  private sleep(
    milliseconds: number,
  ): Promise<void> {
    return new Promise(
      (
        resolve,
      ) => {
        setTimeout(
          resolve,
          milliseconds,
        );
      },
    );
  }
}


// ============================================================================
// SINGLETON
// ============================================================================

export const backendManager =
  new BackendManager();


// ============================================================================
// PUBLIC HELPERS
// ============================================================================

export async function startBackend(): Promise<void> {
  await backendManager.start();
}


export async function stopBackend(): Promise<void> {
  await backendManager.stop();
}


export default backendManager;