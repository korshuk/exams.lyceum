let dataMaps = {}

function getDataMaps () {
  if (dataMaps.places) {
    return dataMaps
  } else {

  }
  self.axios
    .get('http://localhost:5000/api/pupils', { params: self.$route.query })
    .then(onSuccess)
    .catch(onError)

  function onSuccess (response) {
    dataMaps = response.data
  }

  function onError (error) {
    console.log(error)
  }
}

module.exports = {
  dataMaps: dataMaps,
  getDataMaps: getDataMaps
}
