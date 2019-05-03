import Vue from 'vue'

const Preloader = Vue.component('preloader', {
  data: function () {
    return {
      isActive: false,
      elementStyles: {
        display: 'flex'
      },
      logo: {
        urlBW: require('@/plugins/preloader/preloader-logo-bw.png'),
        urlFull: require('@/plugins/preloader/preloader-logo-full.png')
      }
    }
  },
  mounted: function () {
    this.isActive = true
  },
  methods: {
    onLoaded () {
      this.isActive = false
      this.elementStyles = {
        display: 'flex',
        opacity: 0,
        visibility: 'hidden'
      }
    }
  }
})

const preloaderInstance = new Preloader()

preloaderInstance.$mount('#app-preloader')

export default preloaderInstance
