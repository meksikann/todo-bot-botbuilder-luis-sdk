require('dotenv').config();
const builder = require('botbuilder');

import restify from 'restify';
import HttpStatus from 'http-status-codes'
import {messages} from './constants/messages';
import { botCreate } from './bot.js';

let server = restify.createServer();


//setup server
server.listen(3978, () => {
    console.log(`${server.name} ${messages.serverResponseMessages.listening} ${server.url}`);
});

//create chat connector appId and appPassword are not needed when test on local bot-framework emulator
let connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});
botCreate(connector);

server.post('/api/messages', connector.listen());

// simple request for balancer

server.post('/', (req, res, next) => {
    res.send(HttpStatus.OK)
});