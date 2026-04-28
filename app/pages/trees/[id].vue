<script setup lang="ts">
import AvatarCropper from '~/components/common/AvatarCropper.vue'
import SideBar from '~/components/common/SideBar.vue'
import TreeCardCover from '~/components/common/TreeCardCover.vue'
import TreeCanvas from '~/components/tree/TreeCanvas.vue'
import type DataDTO from '~/composables/scripts/api/dtos/DataDTO'
import type PersonDTO from '~/composables/scripts/familytree/dtos/inner/PersonDTO'
import type RelationshipDTO from '~/composables/scripts/familytree/dtos/inner/RelationshipDTO'
import type TreeDTO from '~/composables/scripts/familytree/dtos/inner/TreeDTO'
import type { GetTreeContentResponse } from '~/composables/scripts/familytree/dtos/responses/GetTreeContentResponse'
import type { GetTreeResponse } from '~/composables/scripts/familytree/dtos/responses/GetTreeResponse'
import sendGetTreeContentRequest from '~/composables/scripts/familytree/getTreeContent'
import sendGetTreeRequest from '~/composables/scripts/familytree/getTree'
import sendUpdateTreeSettingsRequest from '~/composables/scripts/familytree/updateTreeSettings'
import sendGetTreeAvatarRequest from '~/composables/scripts/photos/getTreeAvatar'
import sendUploadTreeAvatarRequest from '~/composables/scripts/photos/uploadTreeAvatar'
import useUserDataHandler from '~/composables/scripts/storages/get/userDataHandler'
import adaptTreeVisualisation, { type TreeVisualLayout } from '~/composables/scripts/tree/adaptTreeVisualisation'
import resolveTreeRootPersonId, { getTreePersonId } from '~/composables/scripts/tree/resolveTreeRootPersonId'
import showApiErrorToast from '~/composables/scripts/ui/showApiErrorToast'
import sendRenderCoordinatesForClientRequest from '~/composables/scripts/visualisations/renderCoordinatesForClient'

const route = useRoute()
const toast = useToast()
const { userData, ensureLoaded } = useUserDataHandler()
const treeId = computed(() => {
  const routeId = route.params.id
  return Array.isArray(routeId) ? routeId[0] : routeId
})

const treeCanvasRef = ref<InstanceType<typeof TreeCanvas> | null>(null)
const pending = ref(true)
const treeName = ref('Tree')
const treeAuthorNickname = ref('Unknown creator')
const treeCreatorId = ref<string | number | null>(null)
const treeCreatorCreatedAtUnix = ref<number | undefined>(undefined)
const treeCreatedAtUnix = ref<number | undefined>(undefined)
const treeNodeCount = ref(0)
const treeIsPublicOnMainPage = ref(false)
const treeIsViewRestricted = ref(false)
const treeAvatarUrl = ref<string | null>(null)
const treeSettingsOpen = ref(false)
const treeSettingsPending = ref(false)
const treeAvatarFileInput = ref<HTMLInputElement | null>(null)
const treeAvatarCropper = ref<{ exportFile: (fileName?: string, size?: number) => Promise<File> } | null>(null)
const treeAvatarSourceUrl = ref<string | null>(null)
const treeSettingsName = ref('')
const treeSettingsPublicOnMainPage = ref(false)
const treeSettingsViewRestricted = ref(false)
const rootPerson = ref<PersonDTO>()
const persons = ref<PersonDTO[]>([])
const relationships = ref<RelationshipDTO[]>([])
const layout = ref<TreeVisualLayout>({
  nodes: [],
  connections: [],
  width: 320,
  height: 320
})

const isEditable = computed(() => {
  const currentUserId = userData.value?.id

  if (currentUserId == null || treeCreatorId.value == null) {
    return false
  }

  return String(treeCreatorId.value) === String(currentUserId)
})

const creatorJoinedLabel = computed(() => formatUnixDate(treeCreatorCreatedAtUnix.value, 'Registration date unavailable'))
const treeCreatedLabel = computed(() => formatUnixDate(treeCreatedAtUnix.value, 'Creation date unavailable'))
const peopleCountLabel = computed(() => {
  const count = treeNodeCount.value || persons.value.length
  return `${count} ${count === 1 ? 'person' : 'people'}`
})

function formatUnixDate(value?: number, fallback = 'Unknown date') {
  if (!value) {
    return fallback
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(value * 1000)
}

function revokeTreeAvatarUrl() {
  if (!treeAvatarUrl.value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(treeAvatarUrl.value)
}

function revokeTreeAvatarSourceUrl() {
  if (!treeAvatarSourceUrl.value?.startsWith('blob:')) {
    return
  }

  URL.revokeObjectURL(treeAvatarSourceUrl.value)
}

function syncTreeSettingsForm() {
  treeSettingsName.value = treeName.value
  treeSettingsPublicOnMainPage.value = treeIsPublicOnMainPage.value
  treeSettingsViewRestricted.value = treeIsViewRestricted.value
}

function resetTreeAvatarEditor() {
  revokeTreeAvatarSourceUrl()
  treeAvatarSourceUrl.value = null

  if (treeAvatarFileInput.value) {
    treeAvatarFileInput.value.value = ''
  }
}

function openTreeSettings() {
  syncTreeSettingsForm()
  treeSettingsOpen.value = true
}

function closeTreeSettings() {
  treeSettingsOpen.value = false
  resetTreeAvatarEditor()
}

async function loadTreeAvatar() {
  if (!treeId.value) {
    revokeTreeAvatarUrl()
    treeAvatarUrl.value = null
    return
  }

  try {
    const avatarBlob = await sendGetTreeAvatarRequest(treeId.value)
    const nextAvatarUrl = URL.createObjectURL(avatarBlob)

    revokeTreeAvatarUrl()
    treeAvatarUrl.value = nextAvatarUrl
  } catch {
    revokeTreeAvatarUrl()
    treeAvatarUrl.value = null
  }
}

async function buildTreeAvatarFile() {
  if (!treeAvatarCropper.value) {
    return null
  }

  return await treeAvatarCropper.value.exportFile('tree-avatar.png', 512)
}

async function handleTreeAvatarFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Please choose an image file',
      color: 'error'
    })
    input.value = ''
    return
  }

  try {
    revokeTreeAvatarSourceUrl()
    treeAvatarSourceUrl.value = URL.createObjectURL(file)
  } catch (error) {
    showApiErrorToast(error)
  }
}

async function saveTreeSettings() {
  if (!treeId.value || treeSettingsPending.value) {
    return
  }

  treeSettingsPending.value = true

  try {
    const response = await sendUpdateTreeSettingsRequest(
      treeId.value,
      treeSettingsPublicOnMainPage.value,
      treeSettingsViewRestricted.value,
      treeSettingsName.value.trim() || treeName.value
    ) as DataDTO<{ tree?: TreeDTO }>

    const updatedTree = response.data?.tree
    treeName.value = updatedTree?.name ?? (treeSettingsName.value.trim() || treeName.value)
    treeAuthorNickname.value = updatedTree?.creator_nickname ?? treeAuthorNickname.value
    treeCreatorCreatedAtUnix.value = updatedTree?.creator_created_at_unix ?? treeCreatorCreatedAtUnix.value
    treeCreatedAtUnix.value = updatedTree?.created_at_unix ?? treeCreatedAtUnix.value
    treeNodeCount.value = updatedTree?.node_count ?? treeNodeCount.value
    treeIsPublicOnMainPage.value = updatedTree?.is_public_on_main_page ?? treeSettingsPublicOnMainPage.value
    treeIsViewRestricted.value = updatedTree?.is_view_restricted ?? treeSettingsViewRestricted.value

    const avatarFile = await buildTreeAvatarFile()

    if (avatarFile) {
      await sendUploadTreeAvatarRequest(treeId.value, avatarFile)
      await loadTreeAvatar()
    }

    closeTreeSettings()
    toast.add({
      title: 'Tree updated',
      description: 'Tree settings were saved.',
      color: 'success'
    })
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    treeSettingsPending.value = false
  }
}

async function loadTreeData() {
  if (!treeId.value) {
    return
  }

  const [treeResponse, treeContentResponse] = await Promise.all([
    sendGetTreeRequest(treeId.value) as Promise<DataDTO<GetTreeResponse>>,
    sendGetTreeContentRequest(treeId.value) as Promise<DataDTO<GetTreeContentResponse>>
  ])
  const tree = treeResponse.data?.tree
  const treeContent = treeContentResponse.data

  treeName.value = tree?.name ?? tree?.title ?? `Tree ${treeId.value}`
  treeAuthorNickname.value = tree?.creator_nickname ?? 'Unknown creator'
  treeCreatorId.value = tree?.creator_id ?? null
  treeCreatorCreatedAtUnix.value = tree?.creator_created_at_unix
  treeCreatedAtUnix.value = tree?.created_at_unix
  treeNodeCount.value = tree?.node_count ?? 0
  treeIsPublicOnMainPage.value = tree?.is_public_on_main_page ?? false
  treeIsViewRestricted.value = tree?.is_view_restricted ?? false
  persons.value = Array.isArray(treeContent?.persons) ? treeContent.persons : []
  relationships.value = Array.isArray(treeContent?.relationships) ? treeContent.relationships : []

  syncTreeSettingsForm()

  const rootPersonId = resolveTreeRootPersonId(tree, persons.value)
  rootPerson.value = persons.value.find(person => getTreePersonId(person) === rootPersonId)

  try {
    const coordinatesResponse = await sendRenderCoordinatesForClientRequest(
      treeId.value,
      rootPersonId,
      getVisualisationMaxDepth()
    ) as DataDTO<Record<string, unknown>>

    layout.value = adaptTreeVisualisation(
      coordinatesResponse.data,
      persons.value,
      relationships.value,
      rootPersonId
    )
  } catch (visualisationError) {
    console.warn('Failed to load visualisation coordinates, using fallback layout.', visualisationError)
    layout.value = adaptTreeVisualisation(
      undefined,
      persons.value,
      relationships.value,
      rootPersonId
    )
  }

  await loadTreeAvatar()
  await nextTick()
  fitCanvas()
}

function getVisualisationMaxDepth() {
  return Math.max(8, Math.min(128, persons.value.length * 2))
}

function fitCanvas() {
  treeCanvasRef.value?.fitToView()
}

async function handleStructureChanged() {
  pending.value = true

  try {
    await loadTreeData()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
}

function handlePersonUpdated(updatedPerson: PersonDTO) {
  const updatedPersonId = getTreePersonId(updatedPerson)

  persons.value = persons.value.map((person) => {
    return getTreePersonId(person) === updatedPersonId ? updatedPerson : person
  })
  rootPerson.value = persons.value.find(person => getTreePersonId(person) === updatedPersonId) ?? rootPerson.value
  layout.value = {
    ...layout.value,
    nodes: layout.value.nodes.map((node) => {
      return node.id === updatedPersonId
        ? { ...node, person: updatedPerson }
        : node
    })
  }
}

onMounted(async () => {
  if (!treeId.value) {
    pending.value = false
    return
  }

  try {
    await ensureLoaded()
    await loadTreeData()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    pending.value = false
  }
})

onBeforeUnmount(() => {
  revokeTreeAvatarUrl()
  resetTreeAvatarEditor()
})
</script>

<template>
  <div class="flex min-h-screen">
    <SideBar :active-tab="null" />

    <UMain class="tree-page relative h-screen min-w-0 flex-1 overflow-hidden p-0">
      <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4">
        <div class="pointer-events-auto max-w-md rounded-3xl border border-default bg-elevated/90 p-4 backdrop-blur">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Family tree
          </p>
          <h1 class="mt-2 text-2xl font-semibold text-highlighted">
            {{ treeName }}
          </h1>
          <div class="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-2">
            <p>By {{ treeAuthorNickname }}</p>
            <p>{{ peopleCountLabel }}</p>
            <p>Creator joined {{ creatorJoinedLabel }}</p>
            <p>Created {{ treeCreatedLabel }}</p>
          </div>
        </div>

        <div v-if="isEditable" class="pointer-events-auto">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-settings-2"
            @click="openTreeSettings"
          >
            Tree settings
          </UButton>
        </div>
      </div>

      <TreeCanvas
        ref="treeCanvasRef"
        :tree-id="treeId ?? ''"
        :tree-name="treeName"
        :nodes="layout.nodes"
        :connections="layout.connections"
        :relationships="relationships"
        :width="layout.width"
        :height="layout.height"
        :editable="isEditable"
        @updated="handlePersonUpdated"
        @structure-changed="handleStructureChanged"
      />
    </UMain>

    <UModal
      v-model:open="treeSettingsOpen"
      title="Tree settings"
      description="Manage tree name, visibility, and avatar in one place."
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="saveTreeSettings">
          <UFormField label="Tree name" required>
            <UInput v-model="treeSettingsName" placeholder="My family tree" />
          </UFormField>

          <div class="grid gap-3 rounded-2xl border border-default bg-default/60 p-4">
            <UCheckbox
              v-model="treeSettingsPublicOnMainPage"
              label="Show on main page"
              description="Allow this tree to appear in public feeds and showcases."
            />
            <UCheckbox
              v-model="treeSettingsViewRestricted"
              label="Restrict viewing"
              description="Require explicit access for non-public visitors."
            />
          </div>

          <div class="space-y-3 rounded-2xl border border-default bg-default/60 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-highlighted">
                  Tree avatar
                </p>
                <p class="text-xs text-muted">
                  Upload and crop the image used for tree cards and previews.
                </p>
              </div>

              <UButton
                type="button"
                color="neutral"
                variant="outline"
                @click="treeAvatarFileInput?.click()"
              >
                Choose image
              </UButton>
            </div>

            <input
              ref="treeAvatarFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleTreeAvatarFileChange"
            >

            <div v-if="treeAvatarSourceUrl" class="space-y-3">
              <div class="tree-settings__cropper mx-auto overflow-hidden rounded-4xl border border-default bg-elevated/70">
                <AvatarCropper
                  ref="treeAvatarCropper"
                  :src="treeAvatarSourceUrl"
                  :aspect-ratio="3 / 4"
                  class="mx-auto block h-full w-full object-contain"
                />
              </div>
              <p class="text-xs text-muted">
                New avatar will be uploaded with the same portrait ratio used in tree cards.
              </p>
            </div>

            <div v-else class="tree-settings__preview mx-auto overflow-hidden rounded-4xl border border-default bg-muted/40">
              <img
                v-if="treeAvatarUrl"
                :src="treeAvatarUrl"
                :alt="treeName"
                class="h-40 w-full object-cover"
              >
              <TreeCardCover
                v-else
                :seed="treeId ?? treeName"
                class="h-40 w-full"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <UButton type="button" color="neutral" variant="ghost" @click="closeTreeSettings">
              Cancel
            </UButton>
            <UButton type="submit" :loading="treeSettingsPending">
              Save
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.tree-page {
  background: var(--ui-bg);
}

.tree-settings__cropper,
.tree-settings__preview {
  width: min(100%, 15rem);
  aspect-ratio: 3 / 4;
}

.tree-settings__cropper :deep(.vue-advanced-cropper) {
  min-height: 18rem;
}
</style>
