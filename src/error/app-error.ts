export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
