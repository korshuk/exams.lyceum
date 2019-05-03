<template>
   <v-dialog v-model="dialogData.show"
             fullscreen 
            hide-overlay 
            transition="dialog-bottom-transition">
        <v-container container fluid grid-list-xs  fill-height>    
            <v-toolbar dark color="primary">
                <v-btn icon dark @click.native="dialogData.show = false">
                    <v-icon>close</v-icon>
                </v-btn>
                <v-toolbar-title>{{pupil.firstName}} {{pupil.lastName}}</v-toolbar-title>
            </v-toolbar>      
            <v-layout column align-center fill-height>
                <v-flex xs12 fill-height>
                
                    <img-view :imgUrl="pupil.imgUrl" :background="'#000'"></img-view>
             <!--  <div style="position: absolute;top: 0;bottom: 50px;left: 0;right: 0;"> </div>-->
                </v-flex>
            </v-layout>
        </v-container>
   </v-dialog>
</template>

<script>
  
  export default {
    name: 'show-pass-dialog',
    props: ['dialogData'],
    data () {
      return {
        loading: false,
        editedIndex: this.dialogData.editedIndex,
        pupil: this.dialogData.editedItem
      }
    },

    watch: {
      dialogData (val) {
        this.loading = false
        this.editedIndex = this.dialogData.editedIndex
        this.pupil = this.dialogData.editedItem
      }
    },

    methods: {
      loadingEnd () {
        this.loading = false
      },

      closeDialog (flag) {
        this.dialogData.show = false
        this.$emit('dialogClose', {})
      }
    }
  }
</script>
