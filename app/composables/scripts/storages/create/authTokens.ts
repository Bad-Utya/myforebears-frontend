export type AuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export default function useAuthTokensState() {
  return useState<AuthTokens>('auth-tokens', () => ({
    accessToken: null,
    refreshToken: null,
  }));
}

