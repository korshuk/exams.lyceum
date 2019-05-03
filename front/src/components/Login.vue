<template>
  <v-container fluid fill-height grid-list-md>
      <loading-indicator v-bind:loading="loading"></loading-indicator>
      <v-form>
        <v-layout row wrap justify-center>
            <v-flex xs10 offset-xs1>
                <h2 class="display-3">Вход</h2>
            </v-flex>
            <v-flex xs10 offset-xs1>
                <v-text-field
                    v-model="username"
                    label="Логин"
                    required
                ></v-text-field>
            </v-flex>
            <v-flex xs10 offset-xs1>
                <v-text-field
                    v-model="password"
                    type="password"
                    label="Пароль"
                    required
                ></v-text-field>
            </v-flex>
            <v-flex xs10 offset-xs1>
                <v-btn color="success" @click="login">Вход</v-btn>
            </v-flex>
        </v-layout>
      </v-form>
      <v-snackbar
        v-model="snackbar"
        :timeout="timeout"
        >
      Логин или Пароль неправильные
    </v-snackbar>
  </v-container>
  
</template>


<script>
  import apiService from '@/services/apiService'
  
  export default {
    data () {
      return {
          username:'',
          password: '',
            loading: false,
            snackbar: false,
            timeout: 6000,
      }
    },

    created () {
    //  this.fetch()
    },

    methods: {
      login () {
          const userData = {
              login: this.username,
              password: this.password
          }
        this.loading = true

        apiService.login(userData)
          .then(this.onSuccess)
          .catch(this.onError)
          .finally(this.loadingEnd)
      },

      onSuccess (response) {
          console.log('success')
          this.$router.push('/')
          this.$router.go(0) //reloads page
      },

      onError (error) {
          this.snackbar = true;
        console.log('error', error)
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

