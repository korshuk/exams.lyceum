<template>
    <v-container grid-list-xs>
        <loading-indicator v-bind:loading="loading"></loading-indicator>
        
        <v-toolbar fixed
                  style="top: 56px;">
            <v-container fluid grid-list-md>  
              <v-layout row align-center>
                <v-flex xs12>
                  <v-text-field
                    name="nameSearch"
                    label="Поиск..."
                    single-line
                    v-model="search"
                    v-on:input="debounceSearch"
                    clearable
                    prepend-icon="search"
                    ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
        </v-toolbar>

        <v-layout row align-center style="margin-top: 56px;">
          <v-flex xs12>
              <v-data-table
                  :headers="headers"
                  :items="items"
                  item-key="_id"
                  hide-actions
                  :loading="loading"
                  no-data-text="Ничего не найдено"
              >
                  <v-progress-linear slot="progress" color="teal" indeterminate></v-progress-linear>
                  <template slot="items" slot-scope="props">
                    <pupil-table-row 
                      type="search"
                      v-bind:props="props"
                      v-bind:searchQuery="search"
                      v-on:toggleExpand="toggleExpand"
                    ></pupil-table-row>
                  </template>
                  <template slot="expand" slot-scope="props">
                    <pupil-table-expand 
                      v-bind:pupil="props.item"
                      v-on:toggleEdit="editItemDialog"
                      v-on:toggleShowPass="showPassDialog"
                    ></pupil-table-expand>
                  </template>
              </v-data-table>

              <change-status-dialog
                v-bind:dialogData="dialogData"
                v-on:dialogClose="onDialogClosed"
              ></change-status-dialog>

          </v-flex>
        </v-layout>
        <v-snackbar
          :timeout='4000'
          v-model="snackbar"
        >
          {{ snackbarText }}
          <v-btn dark flat @click.native="snackbar = false">Закрыть</v-btn>
        </v-snackbar>
         <viewer :images="showPassImg"
                :options="options" 
                @inited="inited">
          <img style="display:none" v-for="src in showPassImg" :src="src" :key="src">
        </viewer>
    </v-container>
</template>

<script>
  import apiService from '@/services/apiService'
  import CONSTANTS from '@/constants/constants'
  var debounce = require('debounce')
  
  export default {
    data () {
      return {
        search: '',
        loading: false,
        snackbar: false,
        snackbarText: CONSTANTS.SNACKBAR_SUCCESS,
        dialogData: {
          show: false,
          editedIndex: -1,
          editedItem: {},
          selectedExamStatus: '0'
        },
        showPassImg: [],
        defaultItem: {},
        headers: CONSTANTS.TABLE_HEADERS,
        items: [],
        options: CONSTANTS.VIEWER_OPTIONS
      }
    },

    watch: {
      search (val) {
        this.debounceSearch()
      }
    },

    methods: {
      debounceSearch: debounce(function (e) {
        this.fetch()
      }, 500),

      inited (viewer) {
        this.$viewer = viewer
      },

      showPassDialog (item) {
        this.showPassImg = [CONSTANTS.LYCEUM_URL + item.requestImg]
        setTimeout(this.showViewer)
      },

      showViewer () {
        this.$viewer.show()
      },

      toggleExpand (props) {
        props.expanded = !props.expanded
      },

      onDialogClosed (data) {
        this.items[data.editedIndex].examStatus = data.pupil.examStatus
        if (data.sneckbarText !== '') {
          this.fetch()
          this.snackbarText = data.sneckbarText
          this.snackbar = true
        }
      },

      editItemDialog (item) {
        item.examStatus = item.examStatus || '0'
        this.dialogData = {
          editedIndex: this.items.indexOf(item),
          editedItem: Object.assign({}, item),
          show: true
        }
      },

      fetch () {
        const self = this

        self.loading = true

        apiService.search(self.search || '')
          .then(self.onSuccess)
          .catch(self.onError)
          .finally(self.loadingEnd)
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