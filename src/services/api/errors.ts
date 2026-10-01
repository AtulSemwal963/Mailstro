// src/services/api/errors.ts

/**
 * Standardized application error used by the frontend service layer.
 *
 * Domain services should throw ApiError rather than exposing
 * Axios/fetch-specific errors to the rest of the application.
 */
export class ApiError extends Error {
  /**
   * HTTP status code returned by the backend.
   *
   * Examples:
   * 400 - Bad Request
   * 401 - Unauthorized
   * 404 - Not Found
   * 500 - Internal Server Error
   *
   * Null means the request failed before an HTTP response
   * was received.
   */
  readonly status: number | null;

  /**
   * Backend-provided error detail, when available.
   */
  readonly detail: string | null;

  /**
   * Original backend response body, when available.
   */
  readonly data: unknown;

  /**
   * Whether the request reached the backend.
   */
  readonly hasResponse: boolean;

  constructor(
    message: string,
    options: {
      status?: number | null;
      detail?: string | null;
      data?: unknown;
      hasResponse?: boolean;
    } = {},
  ) {
    super(message);

    this.name = 'ApiError';

    this.status = options.status ?? null;
    this.detail = options.detail ?? null;
    this.data = options.data ?? null;
    this.hasResponse = options.hasResponse ?? false;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * True when the backend returned a 4xx response.
   */
  get isClientError(): boolean {
    return (
      this.status !== null &&
      this.status >= 400 &&
      this.status < 500
    );
  }

  /**
   * True when the backend returned a 5xx response.
   */
  get isServerError(): boolean {
    return (
      this.status !== null &&
      this.status >= 500 &&
      this.status < 600
    );
  }

  /**
   * True when no HTTP response was received.
   *
   * Usually indicates:
   * - backend is offline
   * - connection refused
   * - network failure
   * - request could not be completed
   */
  get isNetworkError(): boolean {
    return !this.hasResponse;
  }
}


/**
 * Shape commonly returned by FastAPI when an endpoint
 * raises HTTPException.
 *
 * Example:
 *
 * {
 *   "detail": "LLM settings are not configured."
 * }
 */
interface FastApiErrorResponse {
  detail?: unknown;
}


/**
 * Extract a useful error message from an unknown backend response.
 */
function extractErrorDetail(
  data: unknown,
): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const response = data as FastApiErrorResponse;

  if (typeof response.detail === 'string') {
    return response.detail;
  }

  if (Array.isArray(response.detail)) {
    return response.detail
      .map((item) => {
        if (
          item &&
          typeof item === 'object' &&
          'msg' in item
        ) {
          const msg = (item as { msg?: unknown }).msg;

          return typeof msg === 'string'
            ? msg
            : null;
        }

        return null;
      })
      .filter(
        (message): message is string =>
          message !== null,
      )
      .join(', ') || null;
  }

  return null;
}


/**
 * Convert an unknown HTTP/client error into ApiError.
 *
 * This function deliberately does not depend on Axios so that
 * the rest of the frontend service layer remains independent
 * of the HTTP implementation.
 */
export function normalizeApiError(
  error: unknown,
): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  /*
   * Axios-like error detection.
   *
   * We intentionally avoid importing Axios here. The API client
   * can pass Axios errors into this function while this module
   * remains transport-agnostic.
   */
  if (
    error &&
    typeof error === 'object'
  ) {
    const candidate = error as {
      response?: {
        status?: unknown;
        data?: unknown;
      };
      request?: unknown;
      message?: unknown;
      code?: unknown;
    };

    const response = candidate.response;

    if (response) {
      const status =
        typeof response.status === 'number'
          ? response.status
          : null;

      const detail =
        extractErrorDetail(response.data);

      return new ApiError(
        detail ??
          (typeof candidate.message === 'string'
            ? candidate.message
            : 'The server returned an error.'),
        {
          status,
          detail,
          data: response.data,
          hasResponse: true,
        },
      );
    }

    /*
     * A request exists but no response was received.
     *
     * This normally means the backend could not be reached.
     */
    if (candidate.request) {
      return new ApiError(
        'Unable to reach the Mailstro backend.',
        {
          status: null,
          detail: null,
          data: null,
          hasResponse: false,
        },
      );
    }

    if (typeof candidate.message === 'string') {
      return new ApiError(
        candidate.message,
        {
          status: null,
          detail: null,
          data: null,
          hasResponse: false,
        },
      );
    }
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message,
      {
        status: null,
        detail: null,
        data: null,
        hasResponse: false,
      },
    );
  }

  return new ApiError(
    'An unexpected error occurred.',
    {
      status: null,
      detail: null,
      data: null,
      hasResponse: false,
    },
  );
}


/**
 * Type guard for ApiError.
 */
export function isApiError(
  error: unknown,
): error is ApiError {
  return error instanceof ApiError;
}