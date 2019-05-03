<template>
   <v-dialog v-model="dialogData.show" max-width="500px">
     <loading-indicator v-bind:loading="loading"></loading-indicator>
      <v-card>
        <v-card-title>
          <span class="headline"> Статус </span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                {{ `${pupil.firstName} ${pupil.lastName} ${pupil.parentName}`}}
              </v-flex>
              <v-radio-group v-model="selectedExamStatus" :mandatory="true">
                <v-radio
                  v-for="(st, key)  in EXAM_STATUSES"
                  color="red"
                  :key="key"
                  :label="`${st}`"
                  :value="key"
                ></v-radio>
              </v-radio-group>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="sendStatus">Сохранить</v-btn>
          <v-btn color="blue darken-1" flat @click.native="closeDialog">Отмена</v-btn>
        </v-card-actions>
      </v-card>
   </v-dialog>
</template>

<script>
  import apiService from '@/services/apiService'
  import CONSTANTS from '@/constants/constants'
  
  export default {
    name: 'change-status-dialog',
    props: ['dialogData'],
    data () {
      return {
        loading: false,
        editedIndex: this.dialogData.editedIndex,
        pupil: this.dialogData.editedItem,
        selectedExamStatus: this.dialogData.editedItem.examStatus,
        EXAM_STATUSES: CONSTANTS.EXAM_STATUSES
      }
    },

    watch: {
      dialogData (val) {
        this.loading = false
        this.editedIndex = this.dialogData.editedIndex
        this.pupil = this.dialogData.editedItem
        this.selectedExamStatus = this.dialogData.editedItem.examStatus
      }
    },

    methods: {
      sendStatus () {
        this.loading = true
        apiService
          .sendPupilStatus(this.pupil, this.selectedExamStatus)
          .then(this.onStatusSend)
          .catch(this.onError)
          .finally(this.loadingEnd)
      },

      loadingEnd () {
        this.loading = false
      },

      onStatusSend (response) {
        if (response.data === 'ok') {
          this.snackbarText = CONSTANTS.SNACKBAR_SUCCESS
          this.pupil.examStatus = this.selectedExamStatus
        } else {
          this.snackbarText = CONSTANTS.SNACKBAR_ERROR
        }
        this.snackbar = true
        this.closeDialog(true)
      },

      closeDialog (flag) {
        const sneckbarText = flag === true ? this.snackbarText : ''
        this.dialogData.show = false
        this.$emit('dialogClose', {
          pupil: this.pupil,
          editedIndex: this.editedIndex,
          sneckbarText: sneckbarText
        })
      },

      onError (error) {
        console.log(error)
        this.$emit('dialogClose', {
          pupil: this.pupil,
          editedIndex: this.editedIndex,
          sneckbarText: CONSTANTS.SNACKBAR_ERROR
        })
      }
    }
  }
</script>
