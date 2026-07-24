<script setup lang="ts">
import type CustomEntityDTO from '~/services/customTrees/dtos/inner/CustomEntityDTO'
import { useCustomEntityAvatar } from '~/composables/customTrees/useCustomEntityAvatar'
import CustomEntityAvatarPlaceholder from '~/components/customTree/CustomEntityAvatarPlaceholder.vue'

const props = withDefaults(defineProps<{
  treeId: string
  entity: CustomEntityDTO
  size?: number
  class?: string
}>(), {
  size: 12,
  class: undefined
})

const { avatarUrl, reload, clear } = useCustomEntityAvatar(
  computed(() => props.treeId),
  computed(() => props.entity)
)
const dimension = computed(() => `${props.size * 0.25}rem`)

defineExpose({ reload })
</script>

<template>
  <img
    v-if="avatarUrl"
    :src="avatarUrl"
    :alt="entity.name || $t('custom_tree.entity.unnamed')"
    class="shrink-0 rounded-full object-cover"
    :class="props.class"
    :style="{ width: dimension, height: dimension }"
    @error="clear"
  >
  <CustomEntityAvatarPlaceholder
    v-else
    :name="entity.name"
    :entity-id="entity.id"
    :size="size"
    :class="props.class"
  />
</template>
