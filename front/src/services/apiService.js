import Vue from 'vue'
import CONSTANTS from '@/constants/constants'

export default {
  checkLogged () {
    return Vue.axios.get(CONSTANTS.AUTH_URL + 'checkLogged')
  },
  login(userData) {
    return Vue.axios.post(CONSTANTS.AUTH_URL + 'loginapp', userData)
  },
  search (search) {
    return Vue.axios.get(CONSTANTS.BASE_URL + 'pupils/search/saved', { params: { search } })
  },
  getPupils (params) {
    return Vue.axios.get(CONSTANTS.BASE_URL + 'pupils/saved', { params: params })
  },
  getDictionary () {
    return Vue.axios.get(CONSTANTS.BASE_URL + 'dictionary')
  },
  getCorpses () {
    return Vue.axios.get(CONSTANTS.BASE_URL + 'corpses/saved')
  },
  getCorps (corpsAlias) {
    return Vue.axios.get(CONSTANTS.BASE_URL + 'corpses/saved/' + corpsAlias)
  },
  sendPupilStatus (pupil, status) {
    const data = {
      examStatus: status
    }

    return Vue
      .axios
      .post(CONSTANTS.BASE_URL + 'pupils/' + pupil._id, data)
  }
}
