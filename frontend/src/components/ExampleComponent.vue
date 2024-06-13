<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
    <p>UserInfo: {{ userStore.userInfo?.preferred_username }}</p>
    <p>Loading state: {{ userStore.loadingState }}</p>
    <p>
      Authenticated: {{ userStore.authenticated }}
      <button @click="userStore.logoutUser(APP_BASE_URL)">Logout</button>
      <button @click="userStore.loginUser()">Authenticate</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { APP_BASE_URL } from 'src/app-constants'
import { useUserStore } from 'src/stores/user'

import { Todo, Meta } from './models'

interface Props {
  title: string;
  todos?: Todo[];
  meta: Meta;
  active: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  todos: () => [],
})

const userStore = useUserStore()

const clickCount = ref(0)
function increment() {
  clickCount.value += 1
  return clickCount.value
}

const todoCount = computed(() => props.todos.length)
</script>
