import type {IFetchError} from "ofetch";

export type ApiErrorData = {
  code: string;
  message: string;
};

export const DEFAULT_API_ERROR: ApiErrorData = {
  code: 'request_failed',
  message: 'Unexpected error happened, try again ',
};

export type FetchErrorData = {
  error?: string;
  message?: string;
};

export default class ApiRequestError extends Error {
  code: string;
  statusCode?: number;

  constructor(code: string, message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.statusCode = statusCode;
  }

  static createDefault() {
    return new ApiRequestError(DEFAULT_API_ERROR.code, DEFAULT_API_ERROR.message);
  }

  static createFromFetchError(error: IFetchError<FetchErrorData>) {
    return new ApiRequestError(
      error.data?.error ?? DEFAULT_API_ERROR.code,
      error.data?.message ?? error.statusText ?? error.message ?? DEFAULT_API_ERROR.message,
      error.statusCode ?? error.status
    );
  }

  // TODO: decompose
  static isUnauthorizedInvalidToken(error: unknown) {
    const apiError = ApiRequestError.createFromAny(error);
    const normalizedCode = apiError.code.trim().toLowerCase();
    const normalizedMessage = apiError.message.trim().toLowerCase();

    if (apiError.statusCode === 401) {
      return true;
    }

    return normalizedCode === 'invalid_token'
      || (normalizedCode === 'unauthorized' && normalizedMessage === 'invalid token');
  }

  static convertString(message: string): ApiRequestError {
    if (message.includes('401 Unauthorized')) {
      return new ApiRequestError('error.request.unauthorized', 'error.request.unauthorized.message', 401);
    }

    return ApiRequestError.createDefault();
  }

  static createFromAny(error: any) {
    if (error instanceof ApiRequestError) {
      return error;
    }

    if (error as string !== undefined) {
      return ApiRequestError.convertString(error as string);
    }

    if (typeof error === 'object' && error !== null) {
      const maybeApiError = error as {
        code?: unknown;
        message?: unknown;
        statusCode?: unknown;
      };

      if (typeof maybeApiError.code === 'string' && typeof maybeApiError.message === 'string') {
        return new ApiRequestError(
          maybeApiError.code,
          maybeApiError.message,
          typeof maybeApiError.statusCode === 'number' ? maybeApiError.statusCode : undefined
        );
      }
    }

    return ApiRequestError.createDefault();
  }
}
