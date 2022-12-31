const twitterText = require('twitter-text');



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


let originalTweet = `Marvel story: story from Devil's Reign (2021) #4 (VARIANT) - desc (from openapi): In Devil's Reign (2021), #4, the world is on the brink of a cataclysmic event that will change the course of history. The evil empire of ... #marvel #marvelapi #dalle2 #dalle #openai #textbabbage001`
let fixed = `Marvel story: story from Devil's Reign (2021) #4 (VARIANT)`
let hashtags = `#marvel #marvelapi #dalle2 #dalle #openai #textbabbage001`
let description = `In Devil's Reign (2021), #4, the world is on the brink of a cataclysmic event that will change the course of history. The evil empire of something jussssst to get this string biggggeeeeeerrrrrr`


console.log(fixTweetDescription(originalTweet, fixed, description, true, hashtags))