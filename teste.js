var api = require('marvel-api');

var marvel = api.createClient({
  publicKey: process.env.MARVEL_KEY
, privateKey: process.env.MARVEL_KEY_SECRET
});



const generateRandomMarvelCharacter = async (callback) => {

    marvel.characters.findAll(100, 0)
      .then((result) => {
        // console.log(result)
        let total = result.meta.total;

        let random = Math.floor(Math.random() * (total - 0)) + 0

        // console.log(random)

        console.log(`total=[${total}] finding character n=[${random}]`)

        marvel.characters.findAll(1, random)
          .then((result) => {
            // console.log(result)
            // return result
            callback(result.data)

          })
          .fail(console.error)
          .done();


      })
      .fail(console.error)
      .done();

}


const main = async () => {

    generateRandomMarvelCharacter((character) => {
        console.log(character)
    })

}

main()

const printRandomInt = (number) => {
    for (var i = 0; i < number; i++) {
        console.log(Math.floor(Math.random() * (4 - 0)) + 0)
    }
}



// printRandomInt(100)