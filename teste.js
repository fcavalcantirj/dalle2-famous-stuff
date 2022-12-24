const crypto = require('crypto')


const marvelKey = process.env.MARVEL_KEY
const marvelKeySecret = process.env.MARVEL_KEY_SECRET



const generateRandomMarvelCharacter = async () => {


    let timestamp = new Date().getTime()
    let hash = crypto.createHash('md5').update(`${timestamp + marvelKeySecret + marvelKey}`).digest("hex")

    console.log(hash)

    const url = `http://gateway.marvel.com/v1/public/comics?apikey=${marvelKey}&hash=${hash}&ts=${timestamp}?limit=100`
    const res = await fetch(url);
    const data = await res.json();
    console.log(data)

}

// generateRandomMarvelCharacter()


const printRandomInt = (number) => {
    for (var i = 0; i < number; i++) {
        console.log(Math.floor(Math.random() * (4 - 0)) + 0)
    }
}



printRandomInt(100)