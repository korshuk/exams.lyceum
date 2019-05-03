<template>
    <v-card flat>
        <v-container fill-height fluid>
        <v-layout fill-height>
            <v-flex xs12 align-end flexbox>
                Профиль: {{ DICTIONARY.profiles[pupil.profile] }}
            <br/>
            Телефон: <a :href="'tel://'+ getPhone(pupil.phone)">+{{ getPhone(pupil.phone) }}</a>
            <br/>
            email: {{ pupil.email }}
            <span v-if="pupil.examStatus > 0" class="red--text">
              <br/>
              <b>{{EXAM_STATUSES[pupil.examStatus]}}</b>
            </span>
            <br/>
            <v-btn  @click="toggleShowPass"
                    dark 
                    color="teal">
                <v-icon left dark>face</v-icon>
                Справка
            </v-btn>
            </v-flex>

            
            
            <v-btn icon 
                    absolute
                    right
                    dark 
                    @click="toggleEdit"
                    color="pink">
                <v-icon dark>edit</v-icon>
            </v-btn>
        </v-layout>
        </v-container>
    </v-card>
</template>

<script>
  import dictionaryService from '@/services/dictionaryService'
  import CONSTANTS from '@/constants/constants'

  export default {
    name: 'pupil-table-expand',
    props: ['pupil'],
    data () {
      return {
        DICTIONARY: dictionaryService.getters.DICTIONARY(),
        EXAM_STATUSES: CONSTANTS.EXAM_STATUSES
      }
    },
    methods: {
      toggleEdit () {
        this.$emit('toggleEdit', this.pupil)
      },

      toggleShowPass () {
        this.$emit('toggleShowPass', this.pupil)
      },

      getPhone (phone) {
        const x = phone ? phone.replace(/\D/g, '').match(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/) : ['X', 'X', 'X', 'X', 'X', 'X']

        return `${x[1]}-(${x[2]})-${x[3]}-${x[4]}-${x[5]} `
      }

    }

  }
</script>
