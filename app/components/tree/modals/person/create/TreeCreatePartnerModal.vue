<script setup lang="ts">
import { treeFieldUi } from '~/utils/ui/theme/treeTheme'
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'

import sendAddPartnerRequest from '~/services/familytree/addPartner'
import AddPartnerRequest from '~/services/familytree/dtos/requests/AddPartnerRequest'
import showApiErrorToast from '~/utils/ui/notifications/showApiErrorToast'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  treeId: string
  person: PersonDTO
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

function resetForm() {
  createFirstName.value = ''
  createLastName.value = props.person.last_name ?? ''
  createPatronymic.value = ''
}

watch(() => props.open, (v) => v && resetForm(), { immediate: true })

function closeModal() {
  modalOpen.value = false
}

async function createPartner() {
  isCreating.value = true
  try {
    await sendAddPartnerRequest(
      props.treeId,
      new AddPartnerRequest(
        props.person.id!,
        createFirstName.value,
        createLastName.value,
        createPatronymic.value
      )
    )

    toast.add({
      title: t('tree.add_partner.success_title'),
      description: t('tree.add_partner.success_description'),
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
    :title="t('tree.add_partner.title')"
    :description="t('tree.add_partner.description', { name: person.first_name || '...' })"
  >
    <template #body>
      <form class="mx-auto flex w-full max-w-3xl flex-col gap-6" @submit.prevent="createPartner">

        <div class="grid grid-cols-2 gap-4">

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_partner.first_name') }}
            </p>
            <UInput
              v-model="createFirstName"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_partner.first_name')"
              :ui="treeFieldUi"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_partner.last_name') }}
            </p>
            <UInput
              v-model="createLastName"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_partner.last_name')"
              :ui="treeFieldUi"
            />
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold text-muted uppercase tracking-wider">
              {{ t('tree.add_partner.patronymic') }}
            </p>
            <UInput
              v-model="createPatronymic"
              color="neutral"
              variant="subtle"
              class="w-full"
              :placeholder="t('tree.add_partner.patronymic')"
              :ui="treeFieldUi"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2 items-center">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="closeModal"
          >
            {{ t('common.cancel') }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="isCreating"
          >
            {{ t('tree.add_partner.submit') }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>
</template>
