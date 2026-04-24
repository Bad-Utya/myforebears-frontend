<script setup lang="ts">
type TreeCard = {
  id: number
  title: string
  author: string
  description: string
  avatar: string
  comments: string
  href: string
}

const isPending = ref(true);

const items: TreeCard[] = [
  {
    id: 1,
    title: 'Династия Романовых',
    author: '@history_root',
    description: 'Большое родовое дерево с императорами, браками и наследниками.',
    avatar: '/images/trees/romanov.jpg',
    comments: '14.7k',
    href: '/trees/romanov'
  },
  {
    id: 2,
    title: 'Моя семья',
    author: '@family_builder',
    description: 'История рода от прабабушки до нового поколения.',
    avatar: '/images/trees/family.jpg',
    comments: '43.6k',
    href: '/trees/my-family'
  },
  {
    id: 3,
    title: 'Средневековый род',
    author: '@oldblood',
    description: 'Ветвления рода, титулы, союзы и спорные линии наследования.',
    avatar: '/images/trees/medieval.jpg',
    comments: '4.0k',
    href: '/trees/medieval'
  },
  {
    id: 4,
    title: 'Семья из Хогвартса',
    author: '@magic_tree',
    description: 'Фантазийное дерево персонажей, связей и семейных тайн.',
    avatar: '/images/trees/magic.jpg',
    comments: '36.2k',
    href: '/trees/magic'
  },
  {
    id: 5,
    title: 'Род купцов',
    author: '@archive_user',
    description: 'Родословная по архивным документам и старым фотографиям.',
    avatar: '/images/trees/archive.jpg',
    comments: '8.9k',
    href: '/trees/archive'
  }
]
</script>

<template>

</template>

<style scoped>

</style>
