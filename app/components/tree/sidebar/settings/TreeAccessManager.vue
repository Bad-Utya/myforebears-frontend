<script setup lang="ts">
import sendListTreeAccessEmailsRequest from '~/services/familytree/listTreeAccessEmails'
import sendAddTreeAccessEmailRequest from '~/services/familytree/addTreeAccessEmail'
import sendDeleteTreeAccessEmailRequest from '~/services/familytree/deleteTreeAccessEmail'

const { t } = useI18n()

const props = defineProps<{ treeId: string, editable: boolean }>()

const emails = ref<string[]>([])
const pending = ref(false)
const newEmail = ref('')

async function fetchEmails() {
  if (!props.treeId) return
  const res = await sendListTreeAccessEmailsRequest(props.treeId)
  emails.value = res.data?.emails || []
}

async function addEmail() {
  if (!newEmail.value.trim()) return
  pending.value = true
  try {
    await sendAddTreeAccessEmailRequest(props.treeId, newEmail.value.trim())
    newEmail.value = ''
    await fetchEmails()
  } finally { pending.value = false }
}

async function removeEmail(email: string) {
  pending.value = true
  try {
    await sendDeleteTreeAccessEmailRequest(props.treeId, email)
    await fetchEmails()
  } finally { pending.value = false }
}

onMounted(fetchEmails)
watch(() => props.treeId, fetchEmails)
</script>

<template>
  <section class="rounded-xl border border-default p-4">
    <header>
      <p class="text-sm font-semibold">
        {{ t('tree.access_list.title') }}
      </p>
      <p class="text-xs text-muted">
        {{ t('tree.access_list.description') }}
      </p>
    </header>

    <div class="mt-4 flex gap-2">
      <UInput
        v-model="newEmail"
        class="flex-1"
        :placeholder="t('tree.access_list.placeholder')"
        :disabled="!editable"
      />
      <UButton
        color="neutral"
        variant="soft"
        :loading="pending"
        @click="addEmail"
      >
        {{ t('tree.access_list.add_button') }}
      </UButton>
    </div>

    <div v-if="emails.length" class="mt-4 flex flex-col gap-2">
      <div
        v-for="email in emails"
        :key="email"
        class="flex items-center justify-between p-2 border border-default rounded-lg bg-elevated/10"
      >
        <span class="text-sm truncate">{{ email }}</span>
        <UButton
          color="error"
          variant="ghost"
          icon="i-lucide-trash-2"
          size="xs"
          @click="removeEmail(email)"
        />
      </div>
    </div>
  </section>
</template>
