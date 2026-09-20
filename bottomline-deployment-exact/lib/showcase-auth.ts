export const SHOWCASE_AUTH_COOKIE = 'showcase_auth';

export const SHOWCASE_AUTH_MAX_AGE = 60 * 60 * 8;

export function getConfiguredCredentials() {
  return {
    username: process.env.SHOWCASE_USERNAME ?? 'portal',
    password: process.env.SHOWCASE_PASSWORD ?? 'portal2026',
  };
}
