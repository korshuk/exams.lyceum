<template>
  <v-container fluid fill-height>
    <loading-indicator v-bind:loading="loading"></loading-indicator>
    <v-layout justify-center align-center>
        <v-flex text-xs-center>
            <h1 class="display-1">Выберите корпус</h1>
          </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
  import apiService from '@/services/apiService'
  
  export default {
    data () {
      return {
        loading: false
      }
    },

    created () {
    //  this.fetch()
    },

    methods: {
      fetch () {
        this.loading = true
        apiService.getCorpses()
          .then(this.onSuccess)
          .catch(this.onError)
          .finally(this.loadingEnd)
      },

      onSuccess (response) {
        this.items = response.data
      },

      onError (error) {
        console.log(error)
      },

      loadingEnd () {
        this.loading = false
      }
    }
  }
</script>

<style scoped>
  h4 {
    text-transform: uppercase;
  }
</style>

