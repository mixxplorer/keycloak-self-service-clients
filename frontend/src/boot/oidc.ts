import { defineBoot } from '#q-app/wrappers'

import { useUserStore } from 'src/stores/user'

export default defineBoot(async (): Promise<void> => {
  const userStore = useUserStore()

  await userStore.loadUser()
})
