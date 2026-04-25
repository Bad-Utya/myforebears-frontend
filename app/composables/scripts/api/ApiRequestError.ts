import type {IFetchError} from "ofetch";

export type ApiErrorData = {
  code: string;
  message: string;
};

export const DEFAULT_API_ERROR: ApiErrorData = {
  code: 'request_failed',
  message: 'Request failed',
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
      error.statusCode
    );
  }

  static createFromAny(error: any) {
    if (error instanceof ApiRequestError) {
      return error;
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
