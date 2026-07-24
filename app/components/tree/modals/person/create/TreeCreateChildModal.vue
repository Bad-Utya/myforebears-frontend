<script setup lang="ts">
import { treeFieldUi } from '~/utils/ui/theme/treeTheme'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'

import sendAddChildRequest from '~/services/familytree/addChild'
import AddChildRequest from '~/services/familytree/dtos/requests/AddChildRequest'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

const { t } = useI18n()

type ChildGender = 'MALE' | 'FEMALE'

const props = defineProps<{
  open: boolean
  treeId: string
  person: PersonDTO
  partnerId?: string
  relatedPersonIds?: string[]
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
const selectedChildGender = ref<ChildGender>('MALE')

const createRelatedPersonIds = ref<string[]>([])

function resetForm() {
  createFirstName.value = ''
  createLastName.value = props.person.last_name ?? ''
  createPatronymic.value = ''
  selectedChildGender.value = 'MALE'

  if (props.relatedPersonIds) {
    createRelatedPersonIds.value = props.relatedPersonIds
  } else if (!props.person.id) {
    createRelatedPersonIds.value = []
  } else if (props.partnerId) {
    createRelatedPersonIds.value = [props.person.id, props.partnerId]
  } else {
    createRelatedPersonIds.value = [props.person.id]
  }
}

watch(() => props.open, (v) => v && resetForm(), { immediate: true })

function closeModal() {
  modalOpen.value = false
}

async function createChild() {
  isCreating.value = true
  try {
    const [p1, p2] = createRelatedPersonIds.value

    await sendAddChildRequest(
      props.treeId,
      new AddChildRequest(
        createFirstName.value,
        createLastName.value,
        createPatronymic.value,
        selectedChildGender.value,
        p1 ?? '',
        p2 ?? ''
      )
    )

    toast.add({
      title: t('tree.add_child.success_title'),
      description: t('tree.add_child.success_description'),
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
    :title="t('tree.add_child.title')"
    :description="t('tree.add_child.description')"
  >
    <template #body>
      <form class="mx-auto flex w-full max-w-3xl flex-col gap-6" @submit.prevent="createChild">

        <div class="grid grid-cols-2 grid-rows-2 gap-4">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_child.first_name') }}
            </p>
            <UInput
              v-model="createFirstName"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_child.first_name')"
              :ui="treeFieldUi"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_child.last_name') }}
            </p>
            <UInput
              v-model="createLastName"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_child.last_name')"
              :ui="treeFieldUi"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_child.patronymic') }}
            </p>
            <UInput
              v-model="createPatronymic"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_child.patronymic')"
              :ui="treeFieldUi"
            />
          </div>
        </div>

        <div class="flex flex-row w-full justify-between items-center">
          <div class="inline-flex text-center w-fit rounded-lg border border-default bg-neutral-900/5">
            <UButton
              type="button"
              size="md"
              :variant="selectedChildGender === 'MALE' ? 'soft' : 'ghost'"
              :color="selectedChildGender === 'MALE' ? 'primary' : 'neutral'"
              class="px-4 transition-all"
              @click="selectedChildGender = 'MALE'"
            >
              {{ t('tree.add_child.male') }}
            </UButton>

            <UButton
              type="button"
              size="md"
              :variant="selectedChildGender === 'FEMALE' ? 'soft' : 'ghost'"
              :color="selectedChildGender === 'FEMALE' ? 'primary' : 'neutral'"
              class="px-4 transition-all"
              @click="selectedChildGender = 'FEMALE'"
            >
              {{ t('tree.add_child.female') }}
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
              {{ t('tree.add_child.submit') }}
            </UButton>
          </div>
        </div>
      </form>
    </template>
  </UModal>
</template>
