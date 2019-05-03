<template>
  <v-container grid-list-xs>
    <v-layout row align-center>
      <viewer :images="images"
      :options="options" 
       @inited="inited">
        <img style="display:none" v-for="src in images" :src="src" :key="src">
      </viewer>
      <v-btn icon
                    dark 
                    @click="show"
                    color="pink">
                <v-icon dark>edit</v-icon>
            </v-btn>
    </v-layout>
  </v-container>
          
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      background: '#000',
      images: ['https://ic.pics.livejournal.com/ibigdan/8161099/9437837/9437837_original.jpg'],
      imgUrl: 'https://ic.pics.livejournal.com/ibigdan/8161099/9437837/9437837_original.jpg',

      options: {
        inline: false,
        button: true,
        navbar: false,
        title: false,
        toolbar: {
          zoomIn: {
            show: true,
            size: 'large'
          },
          zoomOut: {
            show: true,
            size: 'large'
          },
          oneToOne: {
            show: true,
            size: 'large'
          },
          reset: {
            show: true,
            size: 'large'
          },
          prev: false,
          play: false,
          next: false,
          rotateLeft: {
            show: true,
            size: 'large'
          },
          rotateRight: {
            show: true,
            size: 'large'
          },
          flipHorizontal: false,
          flipVertical: false
        },
        tooltip: false,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        transition: true,
        fullscreen: true,
        keyboard: true,
        url: 'data-source'
      }
    }
  },

  methods: {
    inited (viewer) {
      this.$viewer = viewer
    },
    show () {
      this.$viewer.show()
    }
  }
}
</script>