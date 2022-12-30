const swapi = require('swapi-node');

swapi.get('https://swapi.dev/api/people/').then((result) => {
    console.log(result);
    return result.nextPage();
}).then((result) => {
    console.log(result);
    return result.previousPage();
}).then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});







swapi.people({ id: 1 }).then((result) => {
    console.log(result);
});