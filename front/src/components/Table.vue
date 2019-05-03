<template>
    <v-container fluid grid-list-xs>
        <loading-indicator v-bind:loading="loading"></loading-indicator>

        <v-toolbar fixed 
                  v-if="corps.name"
                  style="top: 56px;">
            <v-container fluid grid-list-md>  
              <v-layout row wrap>
                <v-flex xs6 v-if="corps.places">
                  <v-select
                    :items="corps.places"
                    v-model="selectedPlace"
                    :attach="true"
                    label="Select"
                    single-line
                    item-text="code"
                  >
                    <template slot="selection" slot-scope="data">
                      {{ data.item.code}}{{data.item.count ? ' - ' + data.item.count + 'ч.' : ''}}                    
                    </template>
                    <template slot="item" slot-scope="data">
                      {{ data.item.code}}{{data.item.count ? ' - ' + data.item.count + 'ч.' : ''}}
                    </template>
                  </v-select>
                </v-flex>
                <v-flex xs6>
                  <v-select
                    v-bind:items="selectedPlace.audience"
                    v-model="selectedAudience"
                    label="Select"
                    :attach="true"
                    single-line
                    item-text="`${data.item.name} + bel`"
                    item-value="_id"
                  >
                    <template slot="selection" slot-scope="data">
                      {{ data.item.name}}{{data.item.bel === true ? ' (бел)' : ''}}{{data.item.count ? ' - ' + data.item.count + 'ч.' : ''}}
                    </template>
                    <template slot="item" slot-scope="data">
                      {{ data.item.name}}{{data.item.bel === true ? ' (бел)' : ''}}{{data.item.count ? ' - ' + data.item.count + 'ч.' : ''}}
                    </template>
                  </v-select>
                </v-flex>
              </v-layout>
            </v-container>
        </v-toolbar>
        
        
        <v-layout column align-center style="margin-top: 56px;">
          <v-flex xs12>
              <v-data-table
                  :headers="headers"
                  :items="pupils"
                  item-key="_id"
                  :search="selectedAudience"
                  hide-actions
                  :loading="loading"
                  no-data-text="Ничего не найдено"
              >
                  <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                  <template slot="items" slot-scope="props">
                    <pupil-table-row 
                      type="simple"
                      v-bind:props="props"
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

  export default {
    data () {
      return {
        loading: true,
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
        corps: {},
        selectedPlace: {},
        selectedAudience: {},
        headers: CONSTANTS.TABLE_HEADERS,
        pupils: [],
        options: CONSTANTS.VIEWER_OPTIONS
      }
    },

    created () {
      this.fetchCorps()
    },

    watch: {
      '$route' (to, from) {
        this.fetchCorps()
      },
      selectedPlace: function (value) {
        this.placeChanged(value._id)
      }
    },

    methods: {
      inited (viewer) {
        this.$viewer = viewer
      },
      onDialogClosed (data) {
        this.pupils[data.editedIndex].examStatus = data.pupil.examStatus
        if (data.sneckbarText !== '') {
          this.fetchCorps()
          this.snackbarText = data.sneckbarText
          this.snackbar = true
        }
      },

      editItemDialog (item) {
        item.examStatus = item.examStatus || '0'
        this.dialogData = {
          editedIndex: this.pupils.indexOf(item),
          editedItem: Object.assign({}, item),
          show: true
        }
      },

      onPassDialogClosed () {},

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

      placeChanged (placeId) {
        const query = {
          corps: this.$route.params.corpsAlias,
          place: placeId
        }

        this.selectedAudience = ''

        this.fetch(query)
      },

      fetch (params) {
        this.loading = true

        apiService.getPupils(params)
          .then(this.onPupilsSuccess)
          .catch(this.onError)
          .finally(this.loadingEnd)
      },

      fetchCorps () {
        const corpsAlias = this.$route.params.corpsAlias

        apiService
          .getCorps(corpsAlias)
          .then(this.onCorpsSuccess)
          .catch(this.onError)
      },

      onPupilsSuccess (response) {
        this.pupils = response.data
      },

      onCorpsSuccess (response) {
        const routPlace = this.$route.params.placeId || ''
        let i = 0
        let length = response.data.places.length
        let selectedPlaceIndex = 0
        let allAudience = []

        this.corps = Object.assign({}, response.data)

        if (length > 1) {
          this.corps.places.unshift(JSON.parse(JSON.stringify(CONSTANTS.NONE_PLACE)))
        }

        length = this.corps.places.length

        for (i; i < length; i++) {
          if (this.corps.places[i]._id === routPlace) {
            selectedPlaceIndex = i
          }

          allAudience = allAudience.concat(this.corps.places[i].audience)

          this.corps.places[i].audience.unshift(JSON.parse(JSON.stringify(CONSTANTS.NONE_AUDIENCE)))
        }

        if (length > 1) {
          this.corps.places[0].audience = this.corps.places[0].audience.concat(allAudience.sort(sortAudienceByName))
        }

        this.selectedPlace = this.corps.places[selectedPlaceIndex]
      },

      getFIO (item) {
        return `${item.firstName} ${item.lastName} ${item.parentName}`
      },

      loadingEnd () {
        this.loading = false
      },

      onError (error) {
        this.snackbarText = CONSTANTS.SNACKBAR_ERROR
        this.snackbar = true
        console.log(error)
      }
    }
  }

  function sortAudienceByName (a, b) {
    return a.name >= b.name
  }
</script>