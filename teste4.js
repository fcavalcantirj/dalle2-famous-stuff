const axios = require('axios')


axios({
  url: "https://api.igdb.com/v4/characters",
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Client-ID': 'from env',
      'Authorization': 'Bearer from env? see postman',
  },
  data: "fields akas,checksum,country_name,created_at,description,games,gender,mug_shot,name,slug,species,updated_at,url;"
})
  .then(response => {
      console.log(response.data);
  })
  .catch(err => {
      console.error(err);
  });