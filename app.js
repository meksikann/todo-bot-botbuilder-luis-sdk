const restify = require('restify');
const builder = require('botbuilder');
let botMessaging = require('./helpers/send-message');

let server = restify.createServer();

//setup server
server.listen(3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

//create chat connector appId and appPassword are not needed when test on local bot-framework emulator
let connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
let bot = new builder.UniversalBot(connector, function (session) {

    //TODO: do messaging
    if(session.message.text.toLowerCase() == 'hello'){
        return botMessaging.sendMessage(session, 'hey there, how are you?');
    }

    if(session.message.text.toLowerCase().includes('fuck')){
        return botMessaging.sendMessage(session, "Don't say such bad stuff!!!!");
    }

    return botMessaging.sendMessage(session, 'sorry! I am not so clever yet.');
});

