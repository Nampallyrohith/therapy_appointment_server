export class UserAlreadyExistsError extends Error {}
export class NotFound extends Error {}
export class PasswordNotMatch extends Error {}
export class InvalidToken extends Error {}
export class ExchangeTokenError extends Error {}
export class DoctorAlreadyExistsError extends Error {}
export class DatabaseError extends Error {
  readonly code: string;
  readonly constraint: string | null;
  constructor(
    message: string,
    code: string,
    constraint: string | null,
    opts: ErrorOptions = {}
  ) {
    super(message, opts);
    this.name = "DatabaseError";
    this.code = code;
    this.constraint = constraint;
  }

  toString() {
    return `${this.name}: ${this.message} (code: ${this.code} constraint: ${this.constraint})`;
  }
}
export class DoctorCreationError extends Error {}
