<template>
  <v-app>
    <v-navigation-drawer
      fixed
      temporary
      v-model="drawer"
      app
    >
      <v-toolbar flat>
        <v-list>
          <v-list-tile>
            <v-list-tile-title class="title">
              Список Корпусов
            </v-list-tile-title>
        </v-list-tile>
      </v-list>
      </v-toolbar>
     <v-divider></v-divider>
      <v-list
        three-line
        dense
        class="grey lighten-4"
      >
        <span v-for="(corps) in corpses" v-bind:key="corps.alias" >
          <v-list-tile 
            :href="`#/table/${corps.alias}/all`">
            <v-list-tile-content>
              <v-list-tile-title>
                {{ corps.name }}                
              </v-list-tile-title>
              <v-list-tile-sub-title v-for="(place) in corps.places" v-bind:key="place._id">
                  {{place.code}} ({{place.count}})
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon ripple>
                <v-icon color="grey lighten-1">arrow_forward_ios</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider v-bind:key="corps.alias"></v-divider>
        </span>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar app class="indigo lighten-1 white--text">
      
      
      <v-btn icon ripple v-if="isSearch" @click="goBack()" class="mx-3 white--text">
        <v-icon>chevron_left</v-icon>
      </v-btn>

      <v-toolbar-side-icon v-if="isLoggedIn" @click.stop="drawer = !drawer" class="white--text"></v-toolbar-side-icon>

      <v-toolbar-title>{{DICTIONARY.corpses && (title.indexOf('_') > -1 ? DICTIONARY.corpses[ title.split('_')[0] ].split('&')[ title.split('_')[1] ] : DICTIONARY.corpses[title] )}}</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn icon ripple v-if="isTable" href="#/search" class="mx-3 white--text">
        <v-icon>search</v-icon>
      </v-btn>
    </v-toolbar>
  
    <v-content v-scroll="onScroll">   
      <loading-indicator v-bind:loading="loading"></loading-indicator>

      <v-scale-transition name="fade">
        <router-view/>
      </v-scale-transition>

      <v-fab-transition>
        <v-btn
          v-if="offsetTop > 50"
          :color="'purple'" dark
          fab
          fixed bottom right
          @click="scrollToTop"
        >
          <v-icon>keyboard_arrow_up</v-icon>
        </v-btn>
      </v-fab-transition>
    </v-content>
    
    <v-footer app class="pa-3">
      
      <div>&copy; {{ new Date().getFullYear() }}</div>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
import Preloader from '@/plugins/preloader/Preloader'
import { EventBus } from '@/services/event-bus';
import apiService from '@/services/apiService'
import dictionaryService from '@/services/dictionaryService'

export default {
  data () {
    return {
      drawer: this.$route.name === 'Home',
      loading: true,
      isLoggedIn: false,
      corpses: [],
      isSearch: this.$route.name === 'Search',
      isTable: this.$route.name === 'TableCorpsPlace',
      notHome: this.$route.name !== 'Home',
      title: '',
      DICTIONARY: {},
      offsetTop: 0
    }
  },
  name: 'App',

  created () {
    const vm = this;
    if (this.isTable) {
      this.title = this.$route.params.corpsAlias
    } else {
      this.title = ''
    }
    EventBus.$on('unauthorizes', () => {
        vm.isLoggedIn = false;
        vm.loading = false
        vm.$router.push('/loginform')
        console.log('not logged')
    });
    apiService.checkLogged()
      .then(this.onLoggedIn) 
      .catch(function() {
        vm.isLoggedIn = false;
        vm.loading = false
        vm.$router.push('/loginform')
        console.log('not logged')
      })
      .finally(function(){
        setTimeout(function () {
          Preloader.onLoaded()
        }, 2000)
      })
  },

  watch: {
    '$route' (to, from) {
      this.isSearch = this.$route.name === 'Search'
      this.notHome = this.$route.name !== 'Home'
      this.isTable = this.$route.name === 'TableCorpsPlace'
      if (this.isTable) {
        this.title = this.$route.params.corpsAlias
      } else {
        this.title = ''
      }
    }
  },

  methods: {
    onLoggedIn () {
        this.isLoggedIn = true;  
        apiService.getCorpses()
          .then(this.onSuccess)
          .catch(this.onError)
          .finally(this.loadingEnd)    
    },
    checkLogged() {
      apiService.checkLogged();
    },
    goBack () {
      if (this.$route.name !== 'TableCorpsPlace') {
        window.history.length > 1
          ? this.$router.go(-1)
          : this.$router.push('/')
      } else {
        this.$router.push('/')
      }
    },

    onScroll (e) {
      this.offsetTop = window.pageYOffset || document.documentElement.scrollTop
    },

    scrollToTop () {
      return document.documentElement.scroll({
        top: 0,
        behavior: 'smooth'
      })
    },

    onSuccess (response) {
      this.corpses = [];
      for( let i = 0; i < response.data.length; i++) {
        if (response.data[i].name.indexOf('&') > -1) {
          let corpsNames = response.data[i].name.split('&');
          for (let j = 0; j < corpsNames.length; j++) {
            let corps = JSON.parse(JSON.stringify(response.data[i]));
            corps.name = corpsNames[j];
            corps.alias = corps.alias + '_' + j;
            this.corpses.push(corps)
          }

        } else {
          this.corpses.push(response.data[i])
        }

      }
      this.DICTIONARY = dictionaryService.getters.DICTIONARY()
      this.$router.push('/')
      setTimeout(function () {
        Preloader.onLoaded()
      }, 6000)
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
