<script setup lang="ts">
import TreePersonModal from '~/components/tree/modals/person/TreePersonModal.vue'

import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'

import TreePersonAvatar
  from '~/components/images/avatars/TreePersonAvatar.vue'

import useTreePersonAvatar
  from '~/composables/trees/persons/useTreePersonAvatar'

type ParentRole = 'FATHER' | 'MOTHER'

const props = defineProps<{
  treeId: string
  person: PersonDTO
  x: number
  y: number
  width: number
  height: number
  isRoot?: boolean
  editable?: boolean
  partnerId?: string
  roleLabel?: string
  availableParentRoles?: ParentRole[]
}>()

const emit = defineEmits<{
  updated: [person: PersonDTO]
  structureChanged: []
}>()

const {
  avatarUrl,
  reload
} = useTreePersonAvatar(
  computed(() => props.treeId),
  computed(() => props.person)
)

const modalOpen = ref(false)

const cardStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.width}px`,
  height: `${props.height}px`
}))

const fullName = computed(() => {
  const nameParts = [
    props.person.first_name,
    props.person.last_name
  ].filter(Boolean)

  return nameParts.length > 0
    ? nameParts.join(' ')
    : 'Unknown person'
})

const toneClass = computed(() => {
  switch (props.person.gender) {
    case 'GENDER_MALE':
      return 'tree-node--male'

    case 'GENDER_FEMALE':
      return 'tree-node--female'

    default:
      return 'tree-node--unspecified'
  }
})

function openModal() {
  modalOpen.value = true
}

async function handleUpdated(updatedPerson: PersonDTO) {
  emit('updated', updatedPerson)

  await reload()
}

onMounted(() => {
  reload().then();
})
</script>

<template>
  <article
    data-tree-node="true"
    class="tree-node absolute overflow-visible select-none"
    :class="toneClass"
    :style="cardStyle"
  >
    <div
      class="tree-node__card relative h-full cursor-pointer overflow-hidden rounded-2xl"
      :class="{ 'border-4 border-white/40': isRoot }"
      @click="openModal"
    >
      <div class="relative flex h-full items-center gap-2 p-4">
        <TreePersonAvatar
          :key="person.id"
          :person="person"
          :avatar-url="avatarUrl!"
          :size="12"
        />

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted">
            {{ fullName }}
          </p>
        </div>
      </div>
    </div>
  </article>

  <TreePersonModal
    v-model:open="modalOpen"
    :avatar-url="avatarUrl!"
    :tree-id="treeId"
    :person="person"
    :editable="editable"
    :is-root="isRoot"
    :role-label="roleLabel"
    @updated="handleUpdated"
    @structure-changed="emit('structureChanged')"
  />
</template>

<style scoped>
.tree-node {
  z-index: 2;
}

.tree-node__card {
  background: var(--tree-node-bg);
}

.tree-node__card:hover {
  background: var(--tree-node-bg-hover);
}

.tree-node--male {
  --tree-node-bg: var(--color-tree-node-male-bg);
  --tree-node-bg-hover: var(--color-tree-node-male-bg-hover);
  --tree-avatar-bg: var(--color-tree-node-male-avatar-bg);
  --tree-avatar-text: var(--color-tree-node-male-avatar-text);
}

.tree-node--female {
  --tree-node-bg: var(--color-tree-node-female-bg);
  --tree-node-bg-hover: var(--color-tree-node-female-bg-hover);
  --tree-avatar-bg: var(--color-tree-node-female-avatar-bg);
  --tree-avatar-text: var(--color-tree-node-female-avatar-text);
}

.tree-node--unspecified {
  --tree-node-bg: var(--color-tree-node-unspecified-bg);
  --tree-node-bg-hover: var(--color-tree-node-unspecified-bg-hover);
  --tree-avatar-bg: var(--color-tree-node-unspecified-avatar-bg);
  --tree-avatar-text: var(--color-tree-node-unspecified-avatar-text);
}
</style>
