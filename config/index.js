let mongoist  = require('mongoist');

let config = {
    luisUrl: 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/',
    db: mongoist('mongodb://127.0.0.1:27017/todobot')
};

module.exports = config;