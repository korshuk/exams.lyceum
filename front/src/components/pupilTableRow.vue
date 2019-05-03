<template>
    <tr  @click="toggleExpand">
        <td>
            <span v-html="getFIO()"></span>
        </td>
        <td>
            <span v-if="DICTIONARY.audiences[props.item.audience]">
                {{ DICTIONARY.audiences[props.item.audience] }} 
                {{ props.item.needBel === true ? ' (бел)' : '' }}
            </span>
            <br/>
            <span v-if="DICTIONARY.places[props.item.place]">    
                <nobr class="grey--text text--darken-2">
                {{ DICTIONARY.places[props.item.place].code }}
                </nobr> 
            </span>
            <span v-if="type === 'search' && DICTIONARY.corpses[props.item.corps]">
                <br/>
                <nobr class="grey--text text--darken-2">
                {{ DICTIONARY.corpses[props.item.corps] }}
                </nobr> 
            </span>
        </td>
        <td>
            <v-icon v-if="props.item.examStatus > 0" color="red">
              {{ EXAM_ICONS[props.item.examStatus] }}
            </v-icon>
        </td>
    </tr>

</template>

<script>
  import dictionaryService from '@/services/dictionaryService'
  import CONSTANTS from '@/constants/constants'

  export default {
    name: 'pupil-table-row',
    props: [
      'props',
      'searchQuery',
      'type'
    ],
    data () {
      return {
        DICTIONARY: dictionaryService.getters.DICTIONARY(),
        EXAM_ICONS: CONSTANTS.EXAM_ICONS
      }
    },

    methods: {
      toggleExpand () {
        this.$emit('toggleExpand', this.props)
      },

      highlight (text) {
        return text.replace(new RegExp(this.searchQuery, 'gi'), '<b>$&</b>')
      },

      getFIO () {
        let firstName = this.props.item.firstName
        if (this.searchQuery) {
          firstName = this.highlight(this.props.item.firstName)
        }
        return `${firstName} ${this.props.item.lastName} ${this.props.item.parentName}`
      }
    }
  }
</script>
