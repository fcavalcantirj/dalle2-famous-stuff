const api = require('marvel-api');

const marvel = api.createClient({
  publicKey: process.env.MARVEL_KEY, 
  privateKey: process.env.MARVEL_KEY_SECRET
});


let TOTAL_MARVEL_CHARACTERS_COUNT = 1563
const generateRandomMarvelCharacter = async (callback) => {

    // total hardcoded 1562
    // one more to include 1562
    const random = Math.floor(Math.random() * (TOTAL_MARVEL_CHARACTERS_COUNT - 0)) + 0
    marvel.characters.findAll(1, random)
      .then((result) => {
        // console.log(result)
        let updatedTotal = +result.meta.total+1
        console.log(`TOTAL_MARVEL_CHARACTERS_COUNT =[${TOTAL_MARVEL_CHARACTERS_COUNT}] updated=[${updatedTotal}]`)
        TOTAL_MARVEL_CHARACTERS_COUNT = updatedTotal
        callback(result.data[0])
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