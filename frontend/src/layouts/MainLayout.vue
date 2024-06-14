<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>Keycloak Self Service Clients</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Main Navigation</q-item-label>

        <q-item clickable tag="a" :to="{ name: 'Home' }" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" :to="{ name: 'ClientsList' }">
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Clients</q-item-label>
            <q-item-label caption>View your clients</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" :to="{ name: 'ClientAdd' }">
          <q-item-section avatar>
            <q-icon name="add" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Add new client</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="userStore.authenticated" clickable tag="a" @click="userStore.logoutUser('/')">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>

        <q-item-label header>More information</q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container class="q-px-sm">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import EssentialLink, {
  EssentialLinkProps,
} from 'components/EssentialLink.vue'
import { useUserStore } from 'src/stores/user'

defineOptions({
  name: 'MainLayout',
})

const userStore = useUserStore()

const linksList: EssentialLinkProps[] = [
  {
    title: 'Source Code',
    caption: 'Improve & Share',
    icon: 'code',
    link: 'https://rechenknecht.net/mixxplorer/keycloak/self-service-clients',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
