const restify = require('restify');
const builder = require('botbuilder');
const HttpStatus = require('http-status-codes');
const serverResponseMessages = require('./constants/serverResponse');
let bot = require('./bot.js');
let server = restify.createServer();

//setup server
server.listen(3978, () => {
    console.log(`${server.name} ${serverResponseMessages.listening} ${server.url}`);
});

//create chat connector appId and appPassword are not needed when test on local bot-framework emulator
let connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});
bot.create(connector);

server.post('/api/messages', connector.listen());

// simple request for balancer

server.post('/', (req, res, next) => {
    res.send(HttpStatus.OK)
});