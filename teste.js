const api = require('marvel-api');

const marvel = api.createClient({
  publicKey: process.env.MARVEL_KEY, 
  privateKey: process.env.MARVEL_KEY_SECRET
});

// openai
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

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

let TOTAL_MARVEL_STORY_COUNT = 123823
const generateRandomMarvelStory = async (callback) => {

    // total hardcoded 1562
    // one more to include 1562
    const random = Math.floor(Math.random() * (TOTAL_MARVEL_STORY_COUNT - 0)) + 0
    marvel.stories.findAll(1, random)
      .then((result) => {
        // console.log(result)
        let updatedTotal = +result.meta.total+1
        console.log(`TOTAL_MARVEL_STORY_COUNT =[${TOTAL_MARVEL_STORY_COUNT}] updated=[${updatedTotal}]`)
        TOTAL_MARVEL_STORY_COUNT = updatedTotal
        callback(result.data[0])
      })
      .fail(console.error)
      .done();
}

let TOTAL_MARVEL_EVENT_COUNT = 75
const generateRandomMarvelEvents = async (callback) => {

    const random = Math.floor(Math.random() * (TOTAL_MARVEL_EVENT_COUNT - 0)) + 0
    marvel.events.findAll(1, random)
      .then((result) => {
        console.log(result)
        let updatedTotal = +result.meta.total+1
        console.log(`TOTAL_MARVEL_EVENT_COUNT =[${TOTAL_MARVEL_EVENT_COUNT}] updated=[${updatedTotal}]`)
        TOTAL_MARVEL_EVENT_COUNT = updatedTotal
        callback(result.data[0])
      })
      .fail(console.error)
      .done();
}

const generateImage = async (text) => {
    console.log(`generateImage prompt=[${text}]`)
    const response = await openai.createImage({
      prompt: text,
      n: 1,
      size: "1024x1024",
    });
    let image_url = response.data.data[0].url;
    console.log(`url of generated image = [${image_url}]`)
    return image_url;
}


const main = async () => {

    // generateImage('a twitter background of a painting of an epic battle portrayed as supernova')

    generateRandomMarvelEvents((event) => {
        console.log(event)
    })

}

main()

const printRandomInt = (number) => {
    for (var i = 0; i < number; i++) {
        console.log(Math.floor(Math.random() * (4 - 0)) + 0)
    }
}



// printRandomInt(100)