/**
 * Thrown by service classes for expected business errors (4xx).
 * Controllers do not catch this — it propagates to the global error handler
 * which maps it to the appropriate HTTP response.
 */
export class ServiceError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}
