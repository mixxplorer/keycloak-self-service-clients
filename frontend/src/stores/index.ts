import { createPinia } from 'pinia'
import { store } from 'quasar/wrappers'
import type { Router } from 'vue-router'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    readonly router: Router;
  }
}

export default store(() => createPinia())
