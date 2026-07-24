<script setup lang="ts">
import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'
import TreePersonAvatar from '~/components/images/avatars/TreePersonAvatar.vue'
import TreePersonModal from '~/components/tree/modals/person/TreePersonModal.vue'
import useTreePersonAvatar from '~/composables/trees/persons/useTreePersonAvatar'

const { t } = useI18n()

const props = defineProps<{
  treeId: string
  person: PersonDTO
  editable?: boolean
}>()

const emit = defineEmits<{
  updated: [person: PersonDTO]
  structureChanged: []
}>()

const { avatarUrl, reload } = useTreePersonAvatar(
  computed(() => props.treeId),
  computed(() => props.person)
)

const modalOpen = ref(false)

const fullName = computed(() => {
  const parts = [
    props.person.first_name,
    props.person.last_name
  ].filter(Boolean)

  return parts.length ? parts.join(' ') : t('tree.person.unknown')
})

const birthYear = computed(() => props.person.birth_event?.date_iso?.slice(0, 4))

const genderLabel = computed(() => {
  if (props.person.gender === 'GENDER_MALE') {
    return t('tree.persons.gender_male')
  }

  if (props.person.gender === 'GENDER_FEMALE') {
    return t('tree.persons.gender_female')
  }

  return t('tree.persons.filters.both')
})

async function handleUpdated(updatedPerson: PersonDTO) {
  emit('updated', updatedPerson)
  await reload()
}
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-2xl border border-default bg-card-bg px-4 py-3 text-left transition-colors hover:bg-white/6"
    @click="modalOpen = true"
  >
    <TreePersonAvatar
      :person="props.person"
      :avatar-url="avatarUrl ?? undefined"
      :size="12"
    />

    <div class="min-w-0">
      <p class="truncate text-sm font-semibold text-highlighted">
        {{ fullName }}
      </p>
      <p class="truncate text-xs text-muted">
        {{ genderLabel }}
        <span v-if="birthYear">
          · {{ birthYear }}
        </span>
      </p>
    </div>
  </button>

  <TreePersonModal
    v-model:open="modalOpen"
    :tree-id="props.treeId"
    :person="props.person"
    :avatar-url="avatarUrl ?? undefined"
    :editable="props.editable"
    @updated="handleUpdated"
    @structure-changed="emit('structureChanged')"
  />
</template>
