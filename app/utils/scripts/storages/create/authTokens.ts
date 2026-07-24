import {defineStore} from "pinia";

type AuthTokensState = {
  accessToken: string | null;
};

export const useAuthTokensStore = defineStore('auth-tokens', {
  state: (): AuthTokensState => ({
    accessToken: null,
  }),

  actions: {
    setAccessToken(accessToken: string | null) {
      this.accessToken = accessToken;
    },

    clear() {
      this.accessToken = null;
    }
  }
});
