/**
 * Raw (snake_case) wire shapes returned by the backend — mirrors
 * `backend/app/api/schemas/auth.py` exactly. `authApi.ts` is the only
 * module allowed to see these; everything else in the app works with the
 * camelCase types in `types/auth.types.ts`.
 */

export interface UserApiResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  roles: string[];
  permissions: string[];
}

export interface AccessTokenApiResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginApiResponse extends AccessTokenApiResponse {
  user: UserApiResponse;
}

export type RefreshApiResponse = AccessTokenApiResponse;

export interface MessageApiResponse {
  message: string;
}
