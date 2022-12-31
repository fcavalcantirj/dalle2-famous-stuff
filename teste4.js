const axios = require('axios')


axios({
  url: "https://api.igdb.com/v4/characters",
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Client-ID': '26mxnkb5lhbtznf9f6ryf8ekg2z3jr',
      'Authorization': 'Bearer n82q61r9ty0mbmimep8iq2w4zmkmtm',
  },
  data: "fields akas,checksum,country_name,created_at,description,games,gender,mug_shot,name,slug,species,updated_at,url;"
})
  .then(response => {
      console.log(response.data);
  })
  .catch(err => {
      console.error(err);
  });