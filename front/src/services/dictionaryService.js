import apiService from '@/services/apiService'

let DICTIONARY = []

apiService.getDictionary()
  .then(onSuccess)
  .catch(onError)

function onSuccess (response) {
  DICTIONARY = response.data
}

function onError (error) {
  console.log(error)
}

export default {
  getters: {
    DICTIONARY: () => {
      return DICTIONARY
    }
  }
}
