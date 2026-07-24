<script setup lang="ts">
import type CustomTreeDTO from '~/services/customTrees/dtos/inner/CustomTreeDTO'
import UpdateCustomTreeRequest from '~/services/customTrees/dtos/requests/UpdateCustomTreeRequest'
import sendUpdateCustomTreeRequest from '~/services/customTrees/updateCustomTree'
import sendDeleteCustomTreeRequest from '~/services/customTrees/deleteCustomTree'
import sendListCustomTreeAccessEmailsRequest from '~/services/customTrees/listCustomTreeAccessEmails'
import sendAddCustomTreeAccessEmailRequest from '~/services/customTrees/addCustomTreeAccessEmail'
import sendDeleteCustomTreeAccessEmailRequest from '~/services/customTrees/deleteCustomTreeAccessEmail'
import sendReplaceCustomTreeTagsRequest from '~/services/tags/replaceCustomTreeTags'
import sendGetCustomTreeTagsRequest from '~/services/tags/getCustomTreeTags'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import type TagDTO from '~/services/tags/dtos/inner/TagDTO'

const props = defineProps<{
  treeId: string
  tree: CustomTreeDTO | null
  entities: CustomEntityDTO[]
  editable: boolean
  pending: boolean
}>()
const emit = defineEmits<{ updated: [tree: CustomTreeDTO], deleted: [] }>()
const { t } = useI18n()
const name = ref('')
const description = ref('')
const relationUp = ref('')
const relationDown = ref('')
const rootEntityId = ref<string>()
const isPublic = ref(false)
const isRestricted = ref(false)
const saving = ref(false)
const emails = ref<string[]>([])
const newEmail = ref('')
const selectedTagCodes = ref<string[]>([])
const assignedTags = ref<TagDTO[]>([])

watch(() => props.tree, (tree) => {
  name.value = tree?.name ?? ''
  description.value = tree?.description ?? ''
  relationUp.value = tree?.relation_up ?? ''
  relationDown.value = tree?.relation_down ?? ''
  rootEntityId.value = tree?.root_entity_id
  isPublic.value = Boolean(tree?.is_public_on_main_page)
  isRestricted.value = Boolean(tree?.is_view_restricted)
  assignedTags.value = tree?.tags ?? []
  selectedTagCodes.value = assignedTags.value.flatMap(tag => tag.code ? [tag.code] : [])
}, { immediate: true })

watch(isPublic, (value) => {
  if (value) isRestricted.value = false
})

async function loadAccess() {
  if (!props.treeId || !props.editable) return
  const response = await sendListCustomTreeAccessEmailsRequest(props.treeId)
  emails.value = response.data?.emails ?? []
}

async function loadAssignedTags() {
  if (!props.treeId) return
  const response = await sendGetCustomTreeTagsRequest(props.treeId)
  assignedTags.value = response.data?.tags ?? []
  selectedTagCodes.value = assignedTags.value.flatMap(tag => tag.code ? [tag.code] : [])
}

onMounted(() => Promise.all([loadAccess(), loadAssignedTags()]))

async function save() {
  saving.value = true
  try {
    const response = await sendUpdateCustomTreeRequest(props.treeId, new UpdateCustomTreeRequest(
      name.value.trim(), description.value.trim() || undefined, rootEntityId.value,
      relationUp.value.trim(), relationDown.value.trim(), isPublic.value, isRestricted.value
    ))
    const tagsResponse = await sendReplaceCustomTreeTagsRequest(props.treeId, selectedTagCodes.value)
    const updatedTree = tagsResponse.data?.tree ?? response.data?.tree
    await loadAssignedTags()
    if (updatedTree) emit('updated', { ...updatedTree, tags: assignedTags.value })
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    saving.value = false
  }
}

async function addEmail() {
  if (!newEmail.value.trim()) return
  saving.value = true
  try {
    await sendAddCustomTreeAccessEmailRequest(props.treeId, newEmail.value.trim())
    newEmail.value = ''
    await loadAccess()
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    saving.value = false
  }
}

async function removeEmail(email: string) {
  await sendDeleteCustomTreeAccessEmailRequest(props.treeId, email)
  await loadAccess()
}

async function removeTree() {
  if (!window.confirm(t('tree.danger_zone.confirm_delete', { name: name.value }))) return
  saving.value = true
  try {
    await sendDeleteCustomTreeRequest(props.treeId)
    emit('deleted')
  } catch (error) {
    showApiErrorToast(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    v-if="pending"
    class="space-y-3"
  >
    <USkeleton
      v-for="i in 5"
      :key="i"
      class="h-12 rounded-xl"
    />
  </div>
  <div
    v-else
    class="flex flex-col gap-4 pb-2"
  >
    <section class="flex flex-col gap-4 rounded-xl border border-default p-4">
      <UFormField :label="t('tree.settings.name_placeholder')">
        <UInput
          v-model="name"
          class="w-full"
          :disabled="!editable"
        />
      </UFormField>
      <UFormField :label="t('tree.settings.description_placeholder')">
        <UTextarea
          v-model="description"
          class="w-full"
          :rows="3"
          :disabled="!editable"
        />
      </UFormField>
      <div class="grid grid-cols-2 gap-3">
        <UFormField :label="t('custom_tree.relation_up')">
          <UInput
            v-model="relationUp"
            :disabled="!editable"
          />
        </UFormField>
        <UFormField :label="t('custom_tree.relation_down')">
          <UInput
            v-model="relationDown"
            :disabled="!editable"
          />
        </UFormField>
      </div>
      <UFormField :label="t('custom_tree.root_entity')">
        <USelect
          v-model="rootEntityId"
          class="w-full"
          value-key="value"
          :items="entities.map(entity => ({ label: entity.name, value: entity.id }))"
          :disabled="!editable"
        />
      </UFormField>
      <UCheckbox
        v-model="isPublic"
        :label="t('tree.settings.public_checkbox')"
        :disabled="!editable"
      />
      <UCheckbox
        v-model="isRestricted"
        :label="t('tree.settings.restricted_checkbox')"
        :disabled="!editable || isPublic"
      />
      <TagsEditor
        v-model="selectedTagCodes"
        :current-tags="assignedTags"
        :editable="editable"
      />
      <UButton
        class="w-fit"
        :loading="saving"
        :disabled="!editable || !name.trim()"
        @click="save"
      >
        {{ t('tree.settings.save_button') }}
      </UButton>
    </section>

    <section class="rounded-xl border border-default p-4">
      <p class="text-sm font-semibold">
        {{ t('tree.access_list.title') }}
      </p>
      <p class="text-xs text-muted">
        {{ t('tree.access_list.description') }}
      </p>
      <div class="mt-4 flex gap-2">
        <UInput
          v-model="newEmail"
          class="flex-1"
          :disabled="!editable"
        /><UButton
          :loading="saving"
          :disabled="!editable"
          @click="addEmail"
        >
          {{ t('tree.access_list.add_button') }}
        </UButton>
      </div>
      <div class="mt-3 space-y-2">
        <div
          v-for="email in emails"
          :key="email"
          class="flex items-center justify-between rounded-lg border border-default p-2"
        >
          <span class="truncate text-sm">{{ email }}</span><UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            @click="removeEmail(email)"
          />
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-red-500/30 p-4">
      <p class="text-sm font-semibold text-red-500">
        {{ t('tree.danger_zone.title') }}
      </p>
      <UButton
        class="mt-4"
        color="error"
        variant="soft"
        :disabled="!editable"
        :loading="saving"
        @click="removeTree"
      >
        {{ t('tree.danger_zone.delete_button') }}
      </UButton>
    </section>
  </div>
</template>
