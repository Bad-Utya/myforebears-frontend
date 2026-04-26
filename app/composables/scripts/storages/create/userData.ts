import {defineStore} from "pinia";

export type UserData = {
  id?: number;
  email?: string;
  nickname?: string;
  avatarUrl?: string;
};

type UserDataState = {
  userData: UserData | null;
  pending: boolean;
  initialized: boolean;
};

function revokeAvatarUrl(avatarUrl?: string) {
  if (typeof URL === 'undefined') {
    return;
  }

  if (!avatarUrl?.startsWith('blob:')) {
    return;
  }

  URL.revokeObjectURL(avatarUrl);
}

export const useUserDataStore = defineStore('user-data', {
  state: (): UserDataState => ({
    userData: null,
    pending: false,
    initialized: false,
  }),

  actions: {
    setPending(value: boolean) {
      this.pending = value;
    },

    setUserData(nextUserData: UserData | null) {
      if (this.userData?.avatarUrl && this.userData.avatarUrl !== nextUserData?.avatarUrl) {
        revokeAvatarUrl(this.userData.avatarUrl);
      }

      this.userData = nextUserData;
      this.initialized = true;
    },

    patchUserData(partialUserData: Partial<UserData>) {
      const nextAvatarUrl = partialUserData.avatarUrl;

      if (this.userData?.avatarUrl && nextAvatarUrl !== undefined && this.userData.avatarUrl !== nextAvatarUrl) {
        revokeAvatarUrl(this.userData.avatarUrl);
      }

      this.userData = {
        ...(this.userData ?? {}),
        ...partialUserData,
      };
      this.initialized = true;
    },

    clearUserData() {
      revokeAvatarUrl(this.userData?.avatarUrl);
      this.userData = null;
      this.pending = false;
      this.initialized = true;
    }
  }
});
