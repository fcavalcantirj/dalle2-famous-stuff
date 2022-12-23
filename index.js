const { Configuration, OpenAIApi } = require("openai");
const TelegramBot = require('node-telegram-bot-api');
const nodeCron = require("node-cron");
const twitterText = require('twitter-text')

const request = require('request').defaults({ encoding: null });

const token = process.env.TELEGRAM_API_KEY_DALLE2;
const bot = new TelegramBot(token, {polling: true});

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

// https://api.nytimes.com/svc/books/v3/lists/full-overview.json?api-key=amKvmaWADFUgzl4EEjHNaZauh7E6c4Sm
let nytimeskey = process.env.NY_TIMES_KEY
let nytimeskeySecret = process.env.NY_TIMES_KEY_SECRET

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


const bookTitleToDescription = async (book) => {

    let prompt = `I want to generate a very good description of a book cover based on the book title ${book.title}`

    if (book.authors && book.authors.length >= 0) {
        prompt += `, author ${book.authors[0].name}`

    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 125,
      top_p: 1,
      frequency_penalty: 0.2,
      presence_penalty: 0,
    });

    // console.log(response.data.choices[0].text)

    return response;
}

let hashtags = ['#dalle2', '#dalle', '#openai']

const fixTweet = (text, book) => {
    try {
        let author = `- author: ${book.authors[0].name} - birthYear: ${book.authors[0].birth_year || 'unknown'} #dalle2 #dalle #openai #textdavinci003`
        let delta = 240 - author.replace(/[^a-z]/gi, "").length;
        let bookTitle = book.title;
        let fixed = bookTitle.substring(0, (delta - 3)) + '...'
        let fixedTweet = fixed += ' ' + author;
        let length = fixedTweet.replace(/[^a-z]/gi, "").length
        console.log(`fixed tweet=[${fixedTweet}] length=[${length}]`)
        return fixedTweet;
    } catch(err) {
        console.log(err)
        return text
    }
}


const tweet = async (book, imageUrl) => {

    // client.post('statuses/update', { status: `Book: ${title} - Image: ${imageUrl}` }).then(result => {
    //     console.log('You successfully tweeted this : "' + result.text + '"');
    // }).catch(console.error);

    // console.log(app)

    request.get(imageUrl, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            uploadClient.post('media/upload', { media_data: Buffer.from(body).toString('base64') })
                .then(media => {

                    // console.log('You successfully uploaded media');

                    let tweetText = `Book: ${book.title} - author: ${book.authors[0].name} - birthYear: ${book.authors[0].birth_year || 'unknown'} #dalle2 #dalle #openai #textdavinci003`

                    if (!twitterText.parseTweet(tweetText).valid) {
                        fixed = fixTweet(tweetText, book)
                        tweetText = fixed
                    }

                    var media_id = media.media_id_string;
                    client.post('statuses/update', { status: tweetText, media_ids: media_id })
                        .then(tweet => {

                            // console.log('Your image tweet is posted successfully');

                            console.log('successfully tweeted this : "' + tweet.text + '"');


                    }).catch(console.error);

            }).catch(console.error);
        }
    });
}

const generateRandomBook = async () => {

    const url = 'http://gutendex.com/books'
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data)

    let count = data.count;
    const rndInt = Math.floor(Math.random() * count) + 1;

    console.log(`fetching book id=[${rndInt}]`);

    const bookUrl = `http://gutendex.com/books/${rndInt}`;
    const bookResponse = await fetch(bookUrl);
    const book = await bookResponse.json();

    // console.log(book);

    return book;
}


const generateImage = async (text) => {
    // console.log(`generating prompt=[${text}]`)
    const response = await openai.createImage({
      prompt: text,
      n: 1,
      size: "1024x1024",
    });
    let image_url = response.data.data[0].url;
    // console.log(`url of generated image = [${image_url}]`)
    return image_url;
}

const guttemberbTweetWorker = async () => {
    // generateImage()
    let book = await generateRandomBook()
    console.log(`book name=[${book.title}] author=[${book.authors[0].name}]`);

    let description = await bookTitleToDescription(book);

    let url = await generateImage(description.data.choices[0].text);
    // console.log(`url=[${url}]`)
    await tweet(book, url)
}

const job = nodeCron.schedule("0 */30 * * * *", () => {
    try {
        guttemberbTweetWorker()
        console.log(new Date().toLocaleString());
    } catch(err) {
        console.log(err)
    }
});


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

        if (username == 'TrippyPlaces') {
            console.log(`TrippyPlaces not handled`)
            return
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