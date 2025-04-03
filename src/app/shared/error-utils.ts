import { HttpErrorResponse } from '@angular/common/http';

/**
 * Type guard to check if an error is an HttpErrorResponse
 * @param error - The error to check
 * @returns True if the error is an HttpErrorResponse
 */
export function isHttpError(error: any): error is HttpErrorResponse;

/**
 * Type guard to check if an error is an HttpErrorResponse with a specific status code
 * @param error - The error to check
 * @param statusCode - The HTTP status code to check for
 * @returns True if the error is an HttpErrorResponse with the specified status code
 */
export function isHttpError(error: any, statusCode: number): error is HttpErrorResponse;

/**
 * Implementation of the isHttpError type guard
 */
export function isHttpError(error: any, statusCode?: number): error is HttpErrorResponse {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }

  return statusCode === undefined || error.status === statusCode;
}
