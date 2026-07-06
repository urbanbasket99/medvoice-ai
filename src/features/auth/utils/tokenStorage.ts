/**
 * In-memory (not `localStorage`/`sessionStorage`) holder for the current
 * access token. Keeping it out of any browser storage means it cannot be
 * read by a malicious script via storage APIs — an XSS payload can still
 * abuse an in-memory token for the lifetime of the page, but it disappears
 * on reload/tab close, unlike a persisted token. The refresh token never
 * reaches JavaScript at all (see `api/httpClient.ts`).
 */
let currentAccessToken: string | null = null;

export const tokenStorage = {
  get(): string | null {
    return currentAccessToken;
  },
  set(token: string | null): void {
    currentAccessToken = token;
  },
  clear(): void {
    currentAccessToken = null;
  },
};
