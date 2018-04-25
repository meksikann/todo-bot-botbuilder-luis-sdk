const restify = require('restify');
const builder = require('botbuilder');

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
let inMemoryStorage = new builder.MemoryBotStorage();

// start set tasks conversation
let bot = new builder.UniversalBot(connector,[
    function (session) {
        session.send('Hi man, You do not have ay task scheduled. Lets add some.. :)');
        session.beginDialog('askForTaskName');
    }
]).set('storage', inMemoryStorage);


//dialog to ask for a task name

bot.dialog('askForTaskName',[
    (session) => {
        builder.Prompt.text(session, "What is TODO name");
    },
    (session, results) => {
        session.endDialogWithResult(results);

    }
]);


