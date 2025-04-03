import { HttpErrorResponse } from '@angular/common/http';

/**
 * Type guard to check if an error is an HttpErrorResponse with a specific status code
 * @param error - The error to check
 * @param statusCode - The HTTP status code to check for
 * @returns True if the error is an HttpErrorResponse with the specified status code
 */
export function isHttpError(error: unknown, statusCode?: number): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse && (statusCode === undefined || error.status === statusCode);
}