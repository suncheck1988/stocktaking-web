export interface Error {
  property?: string
  message: string
  code?: number
}

export enum ErrorCode {
  EmailConfirmExpired = 1,
  PasswordIncorrect = 2
}
