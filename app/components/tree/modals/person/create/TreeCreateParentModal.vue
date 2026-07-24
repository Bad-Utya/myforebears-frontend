<script setup lang="ts">
import {treeFieldUi} from '~/utils/ui/theme/treeTheme'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'

import sendAddParentRequest from '~/services/familytree/addParent'
import AddParentRequest from '~/services/familytree/dtos/requests/AddParentRequest'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

const {t} = useI18n()

export type ParentRole = 'FATHER' | 'MOTHER'

const props = defineProps<{
  open: boolean
  treeId: string
  person: PersonDTO
  availableParentRoles?: ParentRole[]
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'created': []
}>()

const toast = useToast()

const modalOpen = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const isCreating = ref(false)

const createFirstName = ref('')
const createLastName = ref('')
const createPatronymic = ref('')
const selectedParentRole = ref<ParentRole>('FATHER')

const canAddParent = computed(() =>
  (props.availableParentRoles?.length ?? 0) > 0
)

function resetForm() {
  createFirstName.value = ''
  createLastName.value = props.person.last_name ?? ''
  createPatronymic.value = ''
  selectedParentRole.value = props.availableParentRoles?.[0] ?? 'FATHER'
}

watch(() => props.open, (v) => v && resetForm(), {immediate: true})

function closeModal() {
  modalOpen.value = false
}

async function createParent() {
  isCreating.value = true

  if (!props.person.id) {
    return;
  }

  try {
    await sendAddParentRequest(
      props.treeId,
      new AddParentRequest(
        props.person.id,
        createFirstName.value,
        createLastName.value,
        createPatronymic.value,
        selectedParentRole.value
      )
    )

    toast.add({
      title: t('tree.add_parent.success_title'),
      description: t('tree.add_parent.success_description'),
      color: 'success'
    })

    closeModal()
    emit('created')
  } catch (e) {
    showApiErrorToast(e)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="t('tree.add_parent.title')"
    :description="t('tree.add_parent.description', { name: person.first_name || '...' })"
  >
    <template #body>
      <form class="mx-auto flex w-full max-w-3xl flex-col gap-6" @submit.prevent="createParent">

        <div class="grid grid-cols-2 grid-rows-2 gap-4">

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_parent.first_name') }}
            </p>
            <UInput
              v-model="createFirstName"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_parent.first_name')"
              :ui="treeFieldUi"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_parent.last_name') }}
            </p>
            <UInput
              v-model="createLastName"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_parent.last_name')"
              :ui="treeFieldUi"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_parent.patronymic') }}
            </p>
            <UInput
              v-model="createPatronymic"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_parent.patronymic')"
              :ui="treeFieldUi"
            />
          </div>
        </div>

        <div class="flex flex-row w-full justify-between items-center">
            <div class="inline-flex w-fit rounded-lg border border-default bg-neutral-900/5">
              <UButton
                v-for="role in props.availableParentRoles"
                :key="role"
                type="button"
                size="md"
                :variant="selectedParentRole === role ? 'soft' : 'ghost'"
                :color="selectedParentRole === role ? 'primary' : 'neutral'"
                class="px-4 transition-all"
                @click="selectedParentRole = role"
              >
                {{ role === 'FATHER' ? t('tree.add_parent.father') : t('tree.add_parent.mother') }}
              </UButton>
          </div>
          <div class="flex justify-end gap-2 items-center">
            <UButton
              type="button"
              color="neutral"
              size="md"
              variant="ghost"
              @click="closeModal"
            >
              {{ t('common.cancel') }}
            </UButton>
            <UButton
              type="submit"
              size="md"
              color="primary"
              :loading="isCreating"
            >
              {{ t('tree.add_parent.submit') }}
            </UButton>
          </div>
        </div>
      </form>
    </template>
  </UModal>
</template>
