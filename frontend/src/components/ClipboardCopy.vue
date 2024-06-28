<template>
  <a title="Copy value to clipboard">
    <q-icon
      :name="copied ? 'check' : 'file_copy'"
      class="cursor-pointer"
      @click="copy"
    />
  </a>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { copyToClipboard } from 'src/utils/clipboard'

defineOptions({
  name: 'ClipboardCopyFormValue',
})

export interface ClipboardCopyFormValueProps {
  value: string;
}
const props = defineProps<ClipboardCopyFormValueProps>()

const copied = ref(false)
const copiedCounter = ref(0)

const copiedIconTimeout = 2500

async function copy() {
  await copyToClipboard(props.value)
  copiedCounter.value++
  const thisCopiedCounter = copiedCounter.value
  copied.value = true
  await new Promise((resolve) => setTimeout(resolve, copiedIconTimeout))
  // check whether the user clicked another time on the copy button
  if (thisCopiedCounter === copiedCounter.value) {
    copied.value = false
  }
}

</script>
