<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder?: string;
  hideToggle?: boolean;
  revealed?: boolean;
}>(), {
  placeholder: 'Password',
  hideToggle: false,
  revealed: undefined
});

const password = defineModel<string>();
const showPassword = ref(false);

const isRevealed = computed(() => props.revealed ?? showPassword.value);

function toggleShowButton() {
  showPassword.value = !showPassword.value;
}

</script>

<template>
  <div class="flex flex-row gap-2">
    <UInput v-model="password" color="neutral" variant="subtle" :placeholder="props.placeholder" class="w-full" size="lg"
            :type="isRevealed ? 'text' : 'password'"
    ></UInput>
    <UButton v-if="!props.hideToggle" variant="subtle"
             :icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-closed'"
             :color="showPassword ? 'primary' : 'neutral'"
             @click="toggleShowButton()"/>
  </div>
</template>

<style scoped>

</style>
