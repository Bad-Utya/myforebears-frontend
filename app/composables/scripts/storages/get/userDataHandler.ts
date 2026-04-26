import {storeToRefs} from "pinia";
import {getAccessToken, getRefreshToken, refreshAccessToken} from "~/composables/scripts/cookies/getAccessToken";
import sendGetUserAvatarRequest from "~/composables/scripts/photos/getUserAvatar";
import sendGetMyUserInfoRequest from "~/composables/scripts/users/getMyUserInfo";
import type DataDTO from "~/composables/scripts/api/dtos/DataDTO";
import type UserInfoDTO from "~/composables/scripts/users/dtos/inner/UserInfoDTO";
import {type UserData, useUserDataStore} from "~/composables/scripts/storages/create/userData";

export default function useUserDataHandler() {
  const userDataStore = useUserDataStore();
  const {userData, pending, initialized} = storeToRefs(userDataStore);
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  async function loadCurrentUser() {
    const response = await sendGetMyUserInfoRequest() as DataDTO<UserInfoDTO>;

    return {
      id: response.data?.id,
      nickname: response.data?.nickname,
    } satisfies UserData;
  }

  async function enrichWithAvatar(baseData: UserData) {
    if (typeof baseData.id !== 'number') {
      return;
    }

    try {
      const avatarBlob = await sendGetUserAvatarRequest(baseData.id);
      baseData.avatarUrl = URL.createObjectURL(avatarBlob);
    } catch {
      // ignore avatar errors
    }
  }

  async function ensureLoaded() {
    if (pending.value) {
      return;
    }

    if (userData.value) {
      return;
    }

    userDataStore.setPending(true);
    try {
      if (!accessToken.value) {
        if (!refreshToken.value) {
          userDataStore.clearUserData();
          return;
        }

        const refreshedAccessToken = await refreshAccessToken();
        if (!refreshedAccessToken) {
          userDataStore.clearUserData();
          return;
        }
      }

      const baseData = await loadCurrentUser();
      await enrichWithAvatar(baseData);

      userDataStore.setUserData(baseData);
    } finally {
      userDataStore.setPending(false);
    }
  }

  return {
    userData,
    pending,
    initialized,
    ensureLoaded,
  };
}
