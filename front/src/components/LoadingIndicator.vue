<template>
    <v-layout row align-center v-if="loading" class="loading-container">
          <v-flex xs12 text-xs-center>
            <v-progress-circular 
              indeterminate 
              color="primary"
            >
            </v-progress-circular>
          </v-flex>
    </v-layout>
</template>

<script>
  export default {
    name: 'v-loading-indicator',
    props: ['loading']
  }
</script>

<style scoped>
    .loading-container {
        position: fixed;
        left: 0;
        right: 0;
        z-index: 1;
    }
</style>
