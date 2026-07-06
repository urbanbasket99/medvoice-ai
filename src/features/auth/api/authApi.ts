import { httpClient } from "./httpClient";
import type {
  AccessTokenApiResponse,
  LoginApiResponse,
  MessageApiResponse,
  UserApiResponse,
} from "./authApi.types";
import type {
  AccessTokenResult,
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
  LoginResult,
} from "../types/auth.types";

const toAuthUser = (user: UserApiResponse): AuthUser => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  isActive: user.is_active,
  isSuperuser: user.is_superuser,
  roles: user.roles,
  permissions: user.permissions,
});

const toAccessTokenResult = (token: AccessTokenApiResponse): AccessTokenResult => ({
  accessToken: token.access_token,
  tokenType: token.token_type,
  expiresIn: token.expires_in,
});

/**
 * Thin wrapper around the `/auth` endpoints. Every function here returns
 * the app's camelCase domain types — never the raw API response — so the
 * rest of the codebase is insulated from the wire format.
 */
export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const { data } = await httpClient.post<LoginApiResponse>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });
    return { ...toAccessTokenResult(data), user: toAuthUser(data.user) };
  },

  async refresh(): Promise<AccessTokenResult> {
    const { data } = await httpClient.post<AccessTokenApiResponse>("/auth/refresh");
    return toAccessTokenResult(data);
  },

  async logout(): Promise<void> {
    await httpClient.post<MessageApiResponse>("/auth/logout");
  },

  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await httpClient.get<UserApiResponse>("/auth/me");
    return toAuthUser(data);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await httpClient.post<MessageApiResponse>("/auth/change-password", {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    });
  },
};
