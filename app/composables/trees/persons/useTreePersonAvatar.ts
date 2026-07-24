import { onBeforeUnmount, ref, watch, toValue } from 'vue'

import sendGetPersonAvatarRequest
  from '~/services/photos/getPersonAvatar'

interface TreePerson {
  id?: string
}

export default function useTreePersonAvatar(
  treeId: MaybeRefOrGetter<string | undefined>,
  person: MaybeRefOrGetter<TreePerson | undefined>
) {
  const avatarUrl = ref<string | null>(null)

  const loading = ref(false)
  const error = ref<unknown>(null)

  let objectUrl: string | null = null

  function cleanupObjectUrl() {
    if (!objectUrl) {
      return
    }

    URL.revokeObjectURL(objectUrl)

    objectUrl = null
  }

  async function reload(): Promise<string | null> {
    const resolvedTreeId = toValue(treeId)
    const resolvedPerson = toValue(person)

    if (!resolvedTreeId || !resolvedPerson?.id) {
      avatarUrl.value = null

      return null
    }

    loading.value = true
    error.value = null

    console.log(1)
    try {
      console.log(2)
      cleanupObjectUrl()
      console.log(3)

      const avatarBlob = await sendGetPersonAvatarRequest(
        resolvedTreeId,
        resolvedPerson.id
      )
      console.log(4)

      objectUrl = URL.createObjectURL(avatarBlob)

      avatarUrl.value = objectUrl

      console.log(5)
      return avatarUrl.value
    } catch (e) {
      error.value = e
      console.log(6)

      avatarUrl.value = null

      return null
    } finally {
      loading.value = false
      console.log(7)

    }
  }

  watch(
    () => [
      toValue(treeId),
      toValue(person)?.id
    ],
    reload,
    {
      immediate: true
    }
  )

  onBeforeUnmount(() => {
    cleanupObjectUrl()
  })

  return {
    avatarUrl,
    loading,
    error,
    reload
  }
}
