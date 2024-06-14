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

async function copy() {
  await copyToClipboard(props.value)
  copied.value = true
}

</script>
