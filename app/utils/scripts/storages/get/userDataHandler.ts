import {storeToRefs} from 'pinia'
import {getAccessToken, refreshAccessToken} from '~/utils/scripts/cookies/getAccessToken'
import sendGetUserAvatarRequest from '~/services/photos/getUserAvatar'
import sendGetMyUserInfoRequest from '~/services/users/getMyUserInfo'
import type DataDTO from '~/services/api/dtos/DataDTO'
import {type UserData, useUserDataStore} from '~/utils/scripts/storages/create/userData'
import useAppPreferencesHandler from "~/utils/scripts/storages/get/appPreferencesHandler";
import type {GetMyUserInfoResponse} from "~/services/users/dtos/responses/GetMyUserInfoResponse";

export default function useUserDataHandler() {
  const userDataStore = useUserDataStore()
  const { userData, pending, initialized } = storeToRefs(userDataStore)
  const accessToken = getAccessToken()

  async function loadCurrentUser() {
    const response = await sendGetMyUserInfoRequest() as DataDTO<GetMyUserInfoResponse>

    const user = response.data?.user

    return {
      id: user?.id,
      email: user?.email,
      nickname: user?.nickname,
      created_at_unix: user?.created_at_unix,
      theme: user?.theme,
      language: user?.language,
    }
  }

  async function enrichWithAvatar(baseData: UserData) {
    if (typeof baseData.id !== 'number') {
      return
    }

    try {
      const avatarBlob = await sendGetUserAvatarRequest(baseData.id)
      baseData.avatarUrl = URL.createObjectURL(avatarBlob)
    } catch {
      // ignore avatar errors
    }
  }

  async function ensureLoaded() {
    const {getServerPreferences} = useAppPreferencesHandler()

    if (pending.value) {
      return
    }

    if (userData.value) {
      return
    }

    userDataStore.setPending(true)
    try {
      if (!accessToken.value) {
        const refreshedAccessToken = await refreshAccessToken()
        if (!refreshedAccessToken) {
          userDataStore.clearUserData()
          return
        }
      }

      // TODO: obobshit'
      const baseData = await loadCurrentUser()

      // TODO: вынести эту логику в медиатор
      getServerPreferences(baseData?.theme, baseData?.language)

      const baseDataConverted = baseData as UserData

      await enrichWithAvatar(baseDataConverted)
      userDataStore.setUserData(baseDataConverted)
    } catch (e) {
      getServerPreferences(undefined, undefined)
    } finally {
      userDataStore.setPending(false)
    }
  }

  return {
    userData,
    pending,
    initialized,
    ensureLoaded
  }
}
