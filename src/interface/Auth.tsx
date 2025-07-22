export interface LoginData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
}

export interface PasswordData {
  newPassword: string;
  oldPassword: string;
  userId: string | null;
}
