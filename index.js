const TelegramBot = require('node-telegram-bot-api');
const nodeCron = require("node-cron");
const twitterText = require('twitter-text');
const request = require('request').defaults({ encoding: null });

// SWAPI
const swapi = require('swapi-node');
let TOTAL_STARWARS_CHARACTERS_COUNT = 83
let TOTAL_STARWARS_STARSHIPS_COUNT = 37
let TOTAL_STARWARS_SPECIES_COUNT = 37

// MARVEL
const api = require('marvel-api');
const marvel = api.createClient({
  publicKey: process.env.MARVEL_KEY, 
  privateKey: process.env.MARVEL_KEY_SECRET
});
let TOTAL_MARVEL_CHARACTERS_COUNT = 1562
let TOTAL_MARVEL_STORY_COUNT = 123823
let TOTAL_MARVEL_EVENT_COUNT = 75


// TELEGRAM
const token = process.env.TELEGRAM_API_KEY_DALLE2;
const bot = new TelegramBot(token, {polling: true});


// OPENAI
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);
const openaiTextModels = ['text-ada-001', 'text-babbage-001', 'text-curie-001', 'text-davinci-003', 'text-ada-001', 'text-babbage-001', 'text-curie-001']
const modelToHashtag = new Map([
  ['text-ada-001', '#textada001'],
  ['text-babbage-001', '#textbabbage001'],
  ['text-curie-001', '#textcurie001'],
  ['text-davinci-003', '#textdavinci003'],
]);
// END OPENAI


// NYTIMES
// https://api.nytimes.com/svc/books/v3/lists/full-overview.json?api-key=amKvmaWADFUgzl4EEjHNaZauh7E6c4Sm
const nytimesKey = process.env.NY_TIMES_KEY
const nytimesKeySecret = process.env.NY_TIMES_KEY_SECRET


// TWITTER
const config = {  
  consumer_key: process.env.TWITTER_CONSUMER_API_KEY,  
  consumer_secret: process.env.TWITTER_CONSUMER_API_SECRET,  
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,  
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET  
}
const twitter = require('twitter-lite');
const client = new twitter(config);
config.newClient = function (subdomain = 'api') {
    return new twitter({
        subdomain,
        consumer_key: process.env.TWITTER_CONSUMER_API_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_API_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });
}
const uploadClient = config.newClient('upload');


const tweet = async (textToTweet, imageUrl) => {
    request.get(imageUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            uploadClient.post('media/upload', { media_data: Buffer.from(body).toString('base64') })
                .then(media => {
                    // console.log('You successfully uploaded media');
                    const media_id = media.media_id_string;
                    client.post('statuses/update', { status: textToTweet, media_ids: media_id })
                        .then(tweet => {
                            // console.log('Your image tweet is posted successfully');
                            console.log('successfully tweeted this : "' + tweet.text + '"');
                    }).catch(console.error);
            }).catch(console.error);
        }
    });
}
const fixTweetDescription = (originalTweet, fixedLenghText, variableDescription, originalDescription, hashtags) => {
    try {
        // fixedLenghText + variableDescription + hashtags = 280 chars
        /**
         * idea is to get the lenght of fixedLenghText + hashtags
         * and use the remaining chars to crop description with '...'
         * 
         * */
        let mainLengh = `${fixedLenghText} ${hashtags}`.length
        let delta = (true === originalDescription ? 273 : 265) - mainLengh; // because of desc | desc (by AI) and spaces
        if (delta < 0) {
            //doSomething
            console.log(`@@@@@@@@@@@@@@@@@@ delta < 0; delta=[${delta}]`)
            return originalTweet
        }
        let fixedDescription = variableDescription.substring(0, (delta - 3)) + '...'
        let wholeTweet = `${fixedLenghText} ${(true === originalDescription ? 'desc:' : 'desc (by AI):')} ${fixedDescription} ${hashtags}`
        if (twitterText.parseTweet(wholeTweet).valid) {
            let length = wholeTweet.length
            console.log(`fixed tweet=[${wholeTweet}] length=[${length}]`)
            return wholeTweet;
        } else {
            //doSomething
            let length = wholeTweet.length
            console.log(`@@@@@@@@@@@@@@@@@@ NOT VALID tweet=[${wholeTweet}] length=[${length}]`)
            return originalTweet
        }
    } catch(err) {
        console.log(err)
        return originalTweet
    }
}
// END TWITTER



/**
 * 
 * OPENAI 
 * 
 * */
const generateRandomModel = ()  => {
    const rndInt = Math.floor(Math.random() * (7 - 0)) + 0;
    const model = openaiTextModels[rndInt];
    return model;
}
const generateDescriptionByPrompt = async (prompt, model, maxTokens) => {
    try {
        const response = await openai.createCompletion({
          model: model,
          prompt: prompt,
          temperature: 0,
          max_tokens: maxTokens,
          top_p: 1,
          frequency_penalty: 0.2,
          presence_penalty: 0,
        });
        // console.log(response.data.choices[0].text)
        return response;
    } catch(err) {
        console.log(`error generating prompt. err=[${err}] returning prompt=[${prompt}]`)
        return prompt;
    }
}
const generateImage = async (text) => {
    console.log(`generateImage prompt=[${text}]`)
    const response = await openai.createImage({
      prompt: text,
      n: 1,
      size: "512x512",
    });
    let image_url = response.data.data[0].url;
    // console.log(`url of generated image = [${image_url}]`)
    return image_url;
}
/**
 * 
 * END OPENAI
 * */







/**
 * 
 * CONTENT GENERATOR
 * 
 * USING;
 *      MARVEL; characters, stories, events
 *      STAR WARS; characters, species, starships
 * 
 * */






// ************************* GUTTENBERG *************************


/**
 * GUTTENBERG
 * */
const getAuthorBirthYear = (book) => {
   if (book.authors && book.authors.length >= 0 && book.authors[0]?.birth_year) {
        return book.authors[0]?.birth_year
   } else {
    return 'unknown'
   } 
}
const getBookAuthor = (book) => {
   if (book.authors && book.authors.length >= 0 && book.authors[0]?.name) {
        return book.authors[0]?.name
   } else {
    return 'unknown'
   } 
}
const fixGuttenbergTweet = (text, book, hashtags) => {
    try {
        let suffix = `- author: ${getBookAuthor(book)} - birthYear: ${getAuthorBirthYear(book)} #dalle2 #dalle #openai ${hashtags}`
        let delta = 240 - suffix.replace(/[^a-z]/gi, "").length;
        let bookTitle = book.title;
        let fixed = bookTitle.substring(0, (delta - 3)) + '...'
        let fixedTweet = `Book: ${fixed} ${suffix}`;
        let length = fixedTweet.replace(/[^a-z]/gi, "").length
        console.log(`fixed tweet=[${fixedTweet}] length=[${length}]`)
        return fixedTweet;
    } catch(err) {
        console.log(err)
        return text
    }
}
const generateRandomBook = async () => {

    const url = 'http://gutendex.com/books'
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data)

    let count = data.count;
    const rndInt = Math.floor(Math.random() * count) + 1;

    console.log(`fetching book id=[${rndInt}] count=[${count}]`);

    const bookUrl = `http://gutendex.com/books/${rndInt}`;
    const bookResponse = await fetch(bookUrl);
    const book = await bookResponse.json();

    // console.log(book);

    return book;
}
const guttenberbTweetWorker = async () => {

    let book = await generateRandomBook()
    // console.log(`book name=[${book.title}] author=[${book.authors[0].name}]`);
    console.log(`book name=[${book.title}] - author: [${getBookAuthor(book)}]`);

    let model = generateRandomModel()
    let prompt = `I want to generate a description of a book cover based on the book title ${book.title}, author ${getBookAuthor(book)}`

    let description = await generateDescriptionByPrompt(prompt, model, 80);

    // console.log(description.data.choices[0].text)

    let imageDescription;

    if (description.data && description.data.choices.length >= 0) {
        imageDescription = `A very good book cover image for a book named ${book.title}, with the description: ${description.data.choices[0].text}`
    } else {
        imageDescription = `A very good book cover image for a book named ${book.title}, with the description: ${prompt}`
    }
    // console.log(imageDescription)

    let url = await generateImage(imageDescription);
    // console.log(`url=[${url}]`)

    let tweetText = `Book: ${book.title} - author: ${getBookAuthor(book)} - birthYear: ${getAuthorBirthYear(book)} #dalle2 #dalle #openai ${modelToHashtag.get(model)}`
    if (!twitterText.parseTweet(tweetText).valid) {
        fixed = fixGuttenbergTweet(tweetText, book, modelToHashtag.get(model))
        tweetText = fixed
    }
    await tweet(tweetText, url)
}
// * * 1 * *
// const guttenberJob = nodeCron.schedule("0 */23 * * *", () => {
//     try {
//         guttenberbTweetWorker()
//         console.log(`job=[guttenberJob] timestamp=[${new Date().toLocaleString()}]`);
//     } catch(err) {
//         console.log(err)
//     }
// });
/**
 * 
 * END GUTTENBERG
 * */


















// ************************* MARVEL *************************


/**
 * MARVEL
 * */


/**
 * 
 * STORIES
 * */
const generateRandomMarvelStory = async (callback) => {

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
const marvelStoriesTweetWorker = async () => {

    generateRandomMarvelStory(async (story) => {
        // console.log(`story title=[${story.title}] description=[${story.description}]`)

        if (story.description && '' != story.description) {

            let imageDescription = `An high definition wallpaper image of an marvel story titled ${story.title} portrayed as ${story.description}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `Marvel story: ${story.title} desc: ${story.description} #marvel #marvelapi #dalle2 #dalle #openai`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `Marvel story: ${story.title}`
                let hashtags = `#marvel #marvelapi #dalle2 #dalle #openai`
                let variableDescription = story.description
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, true, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)

        } else {

            let model = generateRandomModel()
            let prompt = `I want to generate the description of an image of an epic story titled ${story.title}`
            // console.log(prompt);
            let description = await generateDescriptionByPrompt(prompt, model, 50);
            // console.log(description.data.choices[0].text)


            let imageDescription = `An high definition wallpaper image of an marvel story titled ${story.title} portrayed as ${description.data.choices[0].text.replace(/[\r\n]/gm, '')}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `Marvel story: ${story.title} desc (by AI): ${description.data.choices[0].text.replace(/[\r\n]/gm, '')} #marvel #marvelapi #dalle2 #dalle #openai ${modelToHashtag.get(model)}`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `Marvel story: ${story.title}`
                let hashtags = `#marvel #marvelapi #dalle2 #dalle #openai ${modelToHashtag.get(model)}`
                let variableDescription = description.data.choices[0].text.replace(/[\r\n]/gm, '')
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, false, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)
        }
    })
}
const marvelStoriesJob = nodeCron.schedule("0 */4 * * *", () => {
    try {
        marvelStoriesTweetWorker()
        console.log(`job=[marvelStoriesJob] timestamp=[${new Date().toLocaleString()}]`);
    } catch(err) {
        console.log(err)
    }
});
/**
 * 
 * END STORIES
 * */




/**
 * 
 * EVENTS
 * */
const generateRandomMarvelEvent = async (callback) => {

    const random = Math.floor(Math.random() * (TOTAL_MARVEL_EVENT_COUNT - 0)) + 0
    marvel.events.findAll(1, random)
      .then((result) => {
        // console.log(result)
        let updatedTotal = +result.meta.total+1
        console.log(`TOTAL_MARVEL_EVENT_COUNT =[${TOTAL_MARVEL_EVENT_COUNT}] updated=[${updatedTotal}]`)
        TOTAL_MARVEL_EVENT_COUNT = updatedTotal
        callback(result.data[0])
      })
      .fail(console.error)
      .done();
}
const marvelEventsTweetWorker = async () => {

    generateRandomMarvelEvent(async (event) => {
        // console.log(`event title=[${event.title}] description=[${event.description}]`)

        if (event.title && event.description && '' != event.description) {

            let imageDescription = `An high definition wallpaper image of an marvel event titled ${event.title} portrayed as ${event.description}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `Marvel event: ${event.title} desc: ${event.description} #marvel #marvelapi #dalle2 #dalle #openai`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `Marvel event: ${event.title}`
                let hashtags = `#marvel #marvelapi #dalle2 #dalle #openai`
                let variableDescription = event.description
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, true, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)
        }
    })
}
const marvelEventsJob = nodeCron.schedule("0 */10 * * *", () => {
    try {
        marvelEventsTweetWorker()
        console.log(`job=[marvelEventsJob] timestamp=[${new Date().toLocaleString()}]`);
    } catch(err) {
        console.log(err)
    }
});
/**
 * 
 * END EVENTS
 * */


/**
 * 
 * CHARACTER
 * */
const generateRandomMarvelCharacter = async (callback) => {

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
const marvelCharacterTweetWorker = async () => {

    generateRandomMarvelCharacter(async (character) => {
        // console.log(character)

        if (character.description && '' != character.description) {

            let imageDescription = `An high definition wallpaper image of an marvel character named ${character.name} portrayed as ${character.description}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `Marvel character: ${character.name} desc: ${character.description} #marvel #marvelapi #dalle2 #dalle #openai`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `Marvel character: ${character.name}`
                let hashtags = `#marvel #marvelapi #dalle2 #dalle #openai`
                let variableDescription = character.description
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, true, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)

        } else {

            let model = generateRandomModel()
            let prompt = `I want to generate the description of an image of an epic character named ${character.name}`
            // console.log(prompt);
            let description = await generateDescriptionByPrompt(prompt, model, 50);
            // console.log(description.data.choices[0].text)


            let imageDescription = `An high definition wallpaper image of an marvel character named ${character.name} portrayed as ${description.data.choices[0].text.replace(/[\r\n]/gm, '')}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `Marvel character: ${character.name} desc (by AI): ${description.data.choices[0].text.replace(/[\r\n]/gm, '')} #marvel #marvelapi #dalle2 #dalle #openai ${modelToHashtag.get(model)}`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `Marvel character: ${character.name}`
                let hashtags = `#marvel #marvelapi #dalle2 #dalle #openai ${modelToHashtag.get(model)}`
                let variableDescription = description.data.choices[0].text.replace(/[\r\n]/gm, '')
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, false, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)
        }
    })
}
const marvelCharacterJob = nodeCron.schedule("0 */6 * * *", () => {
    try {
        marvelCharacterTweetWorker()
        console.log(`job=[marvelCharacterJob] timestamp=[${new Date().toLocaleString()}]`);
    } catch(err) {
        console.log(err)
    }
});
/**
 * 
 * END CHARACTER
 * */












// ************************* STAR WARS *************************


/**
 * STAR WARS
 * 
 * USING SWAPI
 * */

/**
 * 
 * CHARACTER
 * */
const generateRandomStarWarsCharacter = async (callback) => {

    const random = Math.floor(Math.random() * (TOTAL_STARWARS_CHARACTERS_COUNT - 0)) + 0
    swapi.people({ id: random }).then((result) => {
        // console.log(result);
        callback(result)
    });
}
const starWarsCharacterTweetWorker = async () => {

    generateRandomStarWarsCharacter(async (character) => {
        // console.log(`character name=[${character.name}]`)

        if (character.name) {

            let model = generateRandomModel()
            let prompt = `I want to generate the description of an image of an epic star wars character named ${character.name} and characteristics as ${character}`
            // console.log(prompt);
            let description = await generateDescriptionByPrompt(prompt, model, 50);
            // console.log(description.data.choices[0].text)


            let imageDescription = `An high definition wallpaper image of an star wars character named ${character.name} portrayed as ${description.data.choices[0].text.replace(/[\r\n]/gm, '')}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `StarWars character: ${character.name} desc (by AI): ${description.data.choices[0].text.replace(/[\r\n]/gm, '')} #dalle2 #dalle #openai #swapiapi ${modelToHashtag.get(model)}`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `StarWars character: ${character.name}`
                let hashtags = `#dalle2 #dalle #openai #swapiapi ${modelToHashtag.get(model)}`
                let variableDescription = description.data.choices[0].text.replace(/[\r\n]/gm, '')
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, false, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)
        }
    })
}
const starWarsCharacterJob = nodeCron.schedule("0 */9 * * *", () => {
    try {
        starWarsCharacterTweetWorker()
        console.log(`job=[starWarsCharacterJob] timestamp=[${new Date().toLocaleString()}]`);
    } catch(err) {
        console.log(err)
    }
});
/**
 * 
 * END CHARACTER
 * */



/**
 * 
 * STARSHIP
 * */
const generateRandomStarWarsStarship = async (callback) => {

    const random = Math.floor(Math.random() * (TOTAL_STARWARS_STARSHIPS_COUNT - 0)) + 0

    swapi.get(`https://swapi.dev/api/starships/${random}/`).then((result) => {
        // console.log(result);
        callback(result)
    }).catch((err) => {
        console.log(err);
    });
}
const starWarsStarshipTweetWorker = async () => {

    generateRandomStarWarsStarship(async (starship) => {
        // console.log(`starship model=[${starship.model}]`)

        if (starship.name && starship.model && starship.starship_class && starship.manufacturer) {

            let model = generateRandomModel()
            let prompt = `I want to generate the description of an image of an epic star wars starship named ${starship.name}, model ${starship.model} manufacturer ${starship.manufacturer} and starship_class ${starship.starship_class}`
            // console.log(prompt);
            let description = await generateDescriptionByPrompt(prompt, model, 50);
            // console.log(description.data.choices[0].text)


            let imageDescription = `An high definition wallpaper image of an star wars starship named ${starship.name}, model ${starship.model}, manufacturer ${starship.manufacturer} portrayed as ${description.data.choices[0].text.replace(/[\r\n]/gm, '')}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `StarWars starship: ${starship.name} - model ${starship.model} and manufacturer ${starship.manufacturer} desc (by AI): ${description.data.choices[0].text.replace(/[\r\n]/gm, '')} #dalle2 #dalle #openai #swapiapi ${modelToHashtag.get(model)}`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `StarWars starship: ${starship.name} - model ${starship.model} and manufacturer ${starship.manufacturer}`
                let hashtags = `#dalle2 #dalle #openai #swapiapi ${modelToHashtag.get(model)}`
                let variableDescription = description.data.choices[0].text.replace(/[\r\n]/gm, '')
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, false, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)
        }
    })
}
const starWarsStarshipJob = nodeCron.schedule("0 */22 * * *", () => {
    try {
        starWarsStarshipTweetWorker()
        console.log(`job=[starWarsStarshipJob] timestamp=[${new Date().toLocaleString()}]`);
    } catch(err) {
        console.log(err)
    }
});
/**
 * 
 * END STARSHIP
 * */


/**
 * 
 * SPECIES
 * */
const generateRandomStarWarsSpecies = async (callback) => {

    const random = Math.floor(Math.random() * (TOTAL_STARWARS_SPECIES_COUNT - 0)) + 0
    swapi.get(`https://swapi.dev/api/species/${random}/`).then((result) => {
        // console.log(result);
        callback(result)
    }).catch((err) => {
        console.log(err);
    });
}
const starWarsSpeciesTweetWorker = async () => {

    generateRandomStarWarsSpecies(async (species) => {
        // console.log(`species name=[${species.name}]`)

        if (species.name) {

            let model = generateRandomModel()
            let prompt = `I want to generate the description of an image of an epic star wars species named ${species.name}, classification ${species?.classification}, average height ${species?.average_height}, skin colors ${species?.skin_colors}, hair colors ${species?.hair_colors}, eye colors ${species?.eye_colors}`
            // console.log(prompt);
            let description = await generateDescriptionByPrompt(prompt, model, 50);
            // console.log(description.data.choices[0].text)


            let imageDescription = `An high definition wallpaper image of an star wars species named ${species.name}, portrayed as ${description.data.choices[0].text.replace(/[\r\n]/gm, '')}`
            // console.log(imageDescription)
            let url = await generateImage(imageDescription);
            // console.log(`url=[${url}]`)


            let originalTweet = `StarWars species: ${species.name} - classification ${species?.classification} desc (by AI): ${description.data.choices[0].text.replace(/[\r\n]/gm, '')} #dalle2 #dalle #openai #swapiapi ${modelToHashtag.get(model)}`
            if (!twitterText.parseTweet(originalTweet).valid) {
                let startText = `StarWars species: ${species.name} - classification ${species?.classification}`
                let hashtags = `#dalle2 #dalle #openai #swapiapi ${modelToHashtag.get(model)}`
                let variableDescription = description.data.choices[0].text.replace(/[\r\n]/gm, '')
                let fixedTweet = fixTweetDescription(originalTweet, startText, variableDescription, false, hashtags)
                originalTweet = fixedTweet
            }
            await tweet(originalTweet, url)
        }
    })
}
const starWarsSpeciesJob = nodeCron.schedule("0 */22 * * *", () => {
    try {
        starWarsSpeciesTweetWorker()
        console.log(`job=[starWarsSpeciesJob] timestamp=[${new Date().toLocaleString()}]`);
    } catch(err) {
        console.log(err)
    }
});
/**
 * 
 * END SPECIES
 * */



// TELEGRAM

  /**
   * /start
   * 
   * */
  const startMsg = `Bem vindo ao <a href="https://github.com/fcavalcantirj/dalle2-famous-stuff/">DALLE 2 Digital Artist</a> <b>BETA</b>.
Escreva uma mensagem, o mais detalhada possível

Exemplo; <b>an astronaut lounging in a tropical resort in space in a vaporwave style</b>

ou

<b>Um cowboy do espaço em cima de um alien, estilo desenho, arte pitoresca</b>

utilizamos openapi's dalle2 AI para gerar as imagens.
`;


// bot menu
bot.setMyCommands([
  { command: "start", description: "informações sobre o bot" }
]);


// handles start message
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, startMsg, {parse_mode: 'HTML'});
});


// handles ALL MESSAGES
bot.on('message', async (msg) => {


    // console.log(msg);

    if (!msg.text) { return; }

    // commands handled in other methods
    if (!msg.text.includes('/start') && !msg.text.includes('/recentes')
    && !msg.text.includes('/ajuda') && !msg.text.includes('/help') 
    && !msg.text.includes('/busca')) {

        // console.log(msg.text)
        // console.log('@')

        // ingore unknown commands
        if('/' == msg.text.charAt(0)) { return };

        const chatId = msg.chat.id;
        // console.log(msg);

        let username = '';
        if (msg.from.username) {
            username = msg.from.username;
        } else {
            username = `${msg.from.first_name} ${msg.from.last_name}`
        }

        if (username == 'TrippyPlaces' || username == '𒅱𒌓𒉿𒊩𒈹𒌆𒀸 𒅱𒌓𒉿𒊩𒈹𒌆𒀸') {
            console.log(`prompt not handled. username=[${username}] user blocked`)
            bot.sendMessage(chatId, `blocked`, {parse_mode: 'HTML'});
            return
        }

        if (username != 'fcavalcantirj' && username != 'fabiomarinho' && username != 'Rone_araujo'
            && username != 'marqssss') {
            console.log(`prompt not handled. username=[${username}]`)
            bot.sendMessage(chatId, `unlock 50 images by buying me a beer <a href="https://www.buymeacoffee.com/fcavalcantirj"><b>here</b></a>`, {parse_mode: 'HTML'});
            return;
        }

        let searchTerm = msg.text;

        // if inside group and @mention...
        if ('group' == msg.chat.type && msg.reply_to_message
        && '@dalle2_dart_creator_bot'.toUpperCase() === msg.text.toUpperCase()) {

        searchTerm = msg.reply_to_message.text;

        } else if ('group' == msg.chat.type) {
            // console.log('ignoring group message. only replies');
            return;
        }

        let arr = searchTerm.split('#');
        let numberOfResults = 3; // default

        if (arr && arr.length > 1) {
            numberOfResults = arr[1];
            searchTerm = arr[0];
        }

        try {
            bot.sendMessage(chatId, `aguarde, estamos processando sua requisição...`, {parse_mode: 'HTML'});
            let imageUrl = await generateImage(searchTerm);
            bot.sendMessage(chatId, imageUrl, {parse_mode: 'HTML'});
            console.log(`handled prompt=[${searchTerm}] username=[${username}]`)
        } 
        catch(error) {
            // console.log(error)
            let msg = 'erro gerando a imagem'
            if (error.response) {
                console.log(`code=[${error.response.status}] error=[${error.response.data.error.message} prompt=[${searchTerm}] username=[${username}]`);
                msg = error.response.data.error.message
            } else {
                console.log(error.message);
                msg = error.message
            }
            bot.sendMessage(chatId, msg, {parse_mode: 'HTML'});
        }
    }

});