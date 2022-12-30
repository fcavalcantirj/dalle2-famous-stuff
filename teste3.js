const swapi = require('swapi-node');

// swapi.get('https://swapi.dev/api/people/').then((result) => {
//     console.log(result);
//     return result.nextPage();
// }).then((result) => {
//     console.log(result);
//     return result.previousPage();
// }).then((result) => {
//     console.log(result);
// }).catch((err) => {
//     console.log(err);
// });











const generateRandomStarWarsStarship = async (callback) => {

    const random = Math.floor(Math.random() * (37 - 0)) + 0

    swapi.get(`https://swapi.dev/api/starships/${random}/`).then((result) => {
        console.log(result);
        callback(result)
    }).catch((err) => {
        console.log(err);
    });

}

generateRandomStarWarsStarship()