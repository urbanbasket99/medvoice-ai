/**
 * Frontend-facing (camelCase) representation of the authenticated user.
 * Mirrors the backend's `UserResponse` schema — see
 * `backend/app/api/schemas/auth.py`.
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isSuperuser: boolean;
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AccessTokenResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginResult extends AccessTokenResult {
  user: AuthUser;
}
