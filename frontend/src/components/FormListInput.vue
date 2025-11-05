<template>
  <div>
    <q-expansion-item
      icon="list"
      :label="props.headerLabel"
      :caption="props.hint"
      :default-opened="props.defaultOpened"
    >
      <q-input
        v-for="item in formInputArray"
        :key="item.name"
        filled
        :modelValue="item.value"
        :label="props.inputLabel + ' #' + (item.idx + 1)"
        :square="item.idx !== 0"
        @update:model-value="updateInput(item.idx, $event as string)"
      />
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'FormListInput',
})

export interface FormListInputProps {
  name: string;
  inputLabel: string;
  headerLabel: string;
  hint: string;
  defaultOpened: boolean;
}

const props = defineProps<FormListInputProps>()
const formValue = defineModel({ type: Array<string>, default: [] })

const formInputArray = computed(() => {
  const inputs = formValue.value.slice()
  inputs.push('')
  let inputCounter = 0
  return inputs.map((val) => {
    const newElem = {
      idx: inputCounter,
      name: `${props.name}-${inputCounter}`,
      value: val,
    }
    inputCounter++
    return newElem
  })
})

function updateInput(idx: number, newSingleVal: string) {
  const newVal = formValue.value.slice()
  // remove entry if new value is empty
  if (newSingleVal === '' || newSingleVal === null) {
    newVal.splice(idx, 1)
  } else {
    newVal[idx] = newSingleVal
  }
  formValue.value = newVal
}
</script>
