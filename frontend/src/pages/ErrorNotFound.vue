<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <h1 class="error-code">
        404
      </h1>

      <div class="text-h2">
        Oops. Nothing here...
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ErrorNotFound',
})
</script>

<style lang="scss" scoped>
  .error-code {
    font-size: 30vh;;
  }
</style>
