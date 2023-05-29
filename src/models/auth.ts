export interface LoginDto {
  email?: string
  password?: string
}
export interface RegistrationRequestDto {
  name?: string
  email?: string
  password?: string
}

export interface RegistrationConfirmDto {
  token?: string
}

export interface RecreateEmailConfirmDto {
  token?: string
}

export interface ResetPasswordRequestDto {
  email?: string
}

export interface ResetPasswordConfirmDto {
  token?: string
  password?: string
}
