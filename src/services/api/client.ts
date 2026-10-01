// src/services/api/client.ts


// ============================================================================
// API BASE URL
// ============================================================================
//
// Development:
//     VITE_API_BASE_URL
//     fallback -> http://localhost:8000
//
// Packaged Electron:
//     backend is started by Electron on:
//     http://127.0.0.1:8765
//
// The Electron main process waits for /health before displaying the renderer,
// so the renderer can safely use the packaged backend endpoint here.
// ============================================================================

const DEVELOPMENT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const PRODUCTION_API_BASE_URL =
  'http://127.0.0.1:8765';

const API_BASE_URL =
  import.meta.env.DEV
    ? DEVELOPMENT_API_BASE_URL
    : PRODUCTION_API_BASE_URL;


// ============================================================================
// API ERROR
// ============================================================================

export class ApiError extends Error {
  public readonly status: number;

  public readonly data: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown,
  ) {
    super(message);

    this.name = 'ApiError';

    this.status =
      status;

    this.data =
      data;

    Object.setPrototypeOf(
      this,
      ApiError.prototype,
    );
  }
}


// ============================================================================
// REQUEST OPTIONS
// ============================================================================

type RequestOptions = {
  method?:
    | 'GET'
    | 'POST'
    | 'PATCH'
    | 'PUT'
    | 'DELETE';

  body?: unknown;

  headers?: Record<
    string,
    string
  >;

  signal?: AbortSignal;
};


// ============================================================================
// API CLIENT
// ============================================================================

class ApiClient {
  private readonly baseUrl: string;


  constructor(
    baseUrl: string,
  ) {
    this.baseUrl =
      baseUrl.replace(
        /\/+$/,
        '',
      );
  }


  // ==========================================================================
  // CORE REQUEST
  // ==========================================================================

  private async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      signal,
    } = options;


    // ------------------------------------------------------------------------
    // HEADERS
    // ------------------------------------------------------------------------

    const requestHeaders: Record<
      string,
      string
    > = {
      Accept:
        'application/json',

      ...headers,
    };


    // ------------------------------------------------------------------------
    // BODY
    // ------------------------------------------------------------------------
    //
    // JSON:
    //
    //     Content-Type: application/json
    //
    // FormData:
    //
    //     Content-Type is deliberately NOT set manually because fetch must
    //     generate the multipart boundary.
    // ------------------------------------------------------------------------

    let requestBody:
      BodyInit | undefined;


    if (
      body !== undefined
    ) {
      if (
        body instanceof FormData
      ) {
        requestBody =
          body;

      } else {
        requestHeaders[
          'Content-Type'
        ] =
          'application/json';

        requestBody =
          JSON.stringify(
            body,
          );
      }
    }


    // ------------------------------------------------------------------------
    // REQUEST URL
    // ------------------------------------------------------------------------

    const normalizedPath =
      path.startsWith('/')
        ? path
        : `/${path}`;


    const url =
      `${this.baseUrl}${normalizedPath}`;


    // ------------------------------------------------------------------------
    // LOGGING
    // ------------------------------------------------------------------------

    if (
      import.meta.env.DEV
    ) {
      console.log(
        'Mailstro API request:',
        {
          method,
          url,
        },
      );
    }


    // ------------------------------------------------------------------------
    // FETCH
    // ------------------------------------------------------------------------

    let response: Response;


    try {
      response =
        await fetch(
          url,
          {
            method,

            headers:
              requestHeaders,

            body:
              requestBody,

            signal,
          },
        );

    } catch (
      error
    ) {
      /*
       * Preserve the original fetch error.
       *
       * This allows the higher-level service layer to distinguish:
       *
       *     backend unavailable
       *     request aborted
       *     browser/network error
       *
       * from an actual HTTP API error.
       */

      throw error;
    }


    // ------------------------------------------------------------------------
    // RESPONSE PARSING
    // ------------------------------------------------------------------------

    const contentType =
      response.headers.get(
        'content-type',
      ) ?? '';


    let data: unknown;


    if (
      contentType.includes(
        'application/json',
      )
    ) {
      try {
        data =
          await response.json();

      } catch {
        data =
          null;
      }

    } else {
      data =
        await response.text();
    }


    // ------------------------------------------------------------------------
    // HTTP ERROR
    // ------------------------------------------------------------------------

    if (
      !response.ok
    ) {
      const message =
        this.extractErrorMessage(
          data,
          response.status,
        );


      throw new ApiError(
        message,
        response.status,
        data,
      );
    }


    // ------------------------------------------------------------------------
    // SUCCESS
    // ------------------------------------------------------------------------

    return data as T;
  }


  // ==========================================================================
  // ERROR MESSAGE EXTRACTION
  // ==========================================================================

  private extractErrorMessage(
    data: unknown,
    statusCode: number,
  ): string {
    // ------------------------------------------------------------------------
    // FASTAPI DETAIL
    // ------------------------------------------------------------------------

    if (
      typeof data === 'object' &&
      data !== null &&
      'detail' in data
    ) {
      const detail =
        (
          data as {
            detail?: unknown;
          }
        ).detail;


      if (
        typeof detail === 'string'
      ) {
        return detail;
      }


      if (
        Array.isArray(
          detail,
        )
      ) {
        const messages =
          detail
            .map(
              (
                item,
              ) => {
                if (
                  item &&
                  typeof item === 'object' &&
                  'msg' in item
                ) {
                  const message =
                    (
                      item as {
                        msg?: unknown;
                      }
                    ).msg;


                  return typeof message ===
                    'string'
                    ? message
                    : null;
                }


                if (
                  typeof item ===
                  'string'
                ) {
                  return item;
                }


                return null;
              },
            )
            .filter(
              (
                message,
              ): message is string =>
                message !== null,
            );


        if (
          messages.length > 0
        ) {
          return messages.join(
            ', ',
          );
        }
      }
    }


    // ------------------------------------------------------------------------
    // GENERIC ERROR FIELD
    // ------------------------------------------------------------------------

    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data
    ) {
      const error =
        (
          data as {
            error?: unknown;
          }
        ).error;


      if (
        typeof error === 'string' &&
        error.trim()
      ) {
        return error;
      }
    }


    // ------------------------------------------------------------------------
    // GENERIC MESSAGE FIELD
    // ------------------------------------------------------------------------

    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data
    ) {
      const message =
        (
          data as {
            message?: unknown;
          }
        ).message;


      if (
        typeof message === 'string' &&
        message.trim()
      ) {
        return message;
      }
    }


    // ------------------------------------------------------------------------
    // FALLBACK
    // ------------------------------------------------------------------------

    return (
      `Request failed with status ${statusCode}`
    );
  }


  // ==========================================================================
  // GET
  // ==========================================================================

  async get<T>(
    path: string,
    options?: Omit<
      RequestOptions,
      'method' | 'body'
    >,
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        ...options,

        method:
          'GET',
      },
    );
  }


  // ==========================================================================
  // POST JSON
  // ==========================================================================

  async post<T>(
    path: string,
    body?: unknown,
    options?: Omit<
      RequestOptions,
      'method' | 'body'
    >,
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        ...options,

        method:
          'POST',

        body,
      },
    );
  }


  // ==========================================================================
  // POST FORM DATA
  // ==========================================================================

  async postForm<T>(
    path: string,
    formData: FormData,
    options?: Omit<
      RequestOptions,
      'method' | 'body'
    >,
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        ...options,

        method:
          'POST',

        body:
          formData,
      },
    );
  }


  // ==========================================================================
  // PATCH JSON
  // ==========================================================================

  async patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<
      RequestOptions,
      'method' | 'body'
    >,
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        ...options,

        method:
          'PATCH',

        body,
      },
    );
  }


  // ==========================================================================
  // PUT JSON
  // ==========================================================================

  async put<T>(
    path: string,
    body?: unknown,
    options?: Omit<
      RequestOptions,
      'method' | 'body'
    >,
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        ...options,

        method:
          'PUT',

        body,
      },
    );
  }


  // ==========================================================================
  // DELETE
  // ==========================================================================

  async delete<T>(
    path: string,
    options?: Omit<
      RequestOptions,
      'method' | 'body'
    >,
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        ...options,

        method:
          'DELETE',
      },
    );
  }
}


// ============================================================================
// SINGLETON
// ============================================================================

export const apiClient =
  new ApiClient(
    API_BASE_URL,
  );


export default apiClient;