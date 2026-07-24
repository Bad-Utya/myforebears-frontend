import { computed, reactive, shallowReactive, watch, type Ref } from 'vue'
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import sendGetCustomEntityAvatarRequest from '~/services/customTrees/getCustomEntityAvatar'

type AvatarState = {
  url: string | null
  loading: boolean
  loaded: boolean
  error: unknown
  promise: Promise<string | null> | null
  version: number
}

const avatarStates = shallowReactive(new Map<string, AvatarState>())

function createKey(treeId: string, entityId: string) {
  return `${treeId}:${entityId}`
}

function getState(key: string) {
  let state = avatarStates.get(key)

  if (!state) {
    state = reactive<AvatarState>({
      url: null,
      loading: false,
      loaded: false,
      error: null,
      promise: null,
      version: 0
    })
    avatarStates.set(key, state)
  }

  return state
}

function revokeUrl(state: AvatarState) {
  if (state.url?.startsWith('blob:')) URL.revokeObjectURL(state.url)
  state.url = null
}

export async function preloadCustomEntityAvatar(
  treeId: string,
  entityId: string,
  force = false
): Promise<string | null> {
  if (!treeId || !entityId) return null

  const state = getState(createKey(treeId, entityId))

  if (state.promise && !force) return state.promise
  if (state.loaded && !force) return state.url

  const version = ++state.version
  const request = (async () => {
    state.loading = true
    state.error = null

    try {
      const blob = await sendGetCustomEntityAvatarRequest(treeId, entityId)
      const nextUrl = URL.createObjectURL(blob)

      if (version !== state.version) {
        URL.revokeObjectURL(nextUrl)
        return state.url
      }

      revokeUrl(state)
      state.url = nextUrl
      return nextUrl
    } catch (error) {
      if (version !== state.version) return state.url

      revokeUrl(state)
      state.error = error
      return null
    } finally {
      if (version === state.version) {
        state.loaded = true
        state.loading = false
        state.promise = null
      }
    }
  })()

  state.promise = request
  return request
}

export async function preloadCustomEntityAvatars(treeId: string, entities: CustomEntityDTO[]) {
  await Promise.all(
    entities.map(entity => entity.id
      ? preloadCustomEntityAvatar(treeId, entity.id)
      : Promise.resolve(null))
  )
}

export function clearCustomEntityAvatarCache(treeId: string) {
  const prefix = `${treeId}:`

  for (const [key, state] of avatarStates) {
    if (!key.startsWith(prefix)) continue
    state.version++
    revokeUrl(state)
    avatarStates.delete(key)
  }
}

export function useCustomEntityAvatar(treeId: Ref<string>, entity: Ref<CustomEntityDTO>) {
  const key = computed(() => {
    const entityId = entity.value.id
    return treeId.value && entityId ? createKey(treeId.value, entityId) : null
  })

  const state = computed(() => key.value ? getState(key.value) : null)
  const avatarUrl = computed(() => state.value?.url ?? null)
  const loading = computed(() => state.value?.loading ?? false)
  const error = computed(() => state.value?.error ?? null)

  async function reload() {
    const entityId = entity.value.id
    if (!treeId.value || !entityId) return null
    return preloadCustomEntityAvatar(treeId.value, entityId, true)
  }

  function clear() {
    if (!state.value) return
    state.value.version++
    revokeUrl(state.value)
    state.value.loaded = true
  }

  watch(
    key,
    () => {
      const entityId = entity.value.id
      if (treeId.value && entityId) {
        void preloadCustomEntityAvatar(treeId.value, entityId)
      }
    },
    { immediate: true }
  )

  return { avatarUrl, loading, error, reload, clear }
}
