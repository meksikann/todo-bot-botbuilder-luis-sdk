global.builder = require('botbuilder');
const config = require('./config');
const regexpYes = /^yes$/i;
const regexpNo = /^no$/i;
let db = config.db;

let formatMessages = require('./helpers/format-messages');

function create(connector) {
    let inMemoryStorage = new builder.MemoryBotStorage();

    let bot = new builder.UniversalBot(connector,
        function (session) {
            session.send(
                'Hi man. <br/> ' +
                'Here are commands you can use:<br/>' +
                '"add task" to create new task :)<br/>' +
                '"show tasks" to get you task list.<br/>' +
                'Have a nice journey!!!');
        }
    ).set('storage', inMemoryStorage);


    //connect to LUIS
    let recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);

    bot.recognizer(recognizer);

    //dialog to ask for a task name
    bot.dialog('askForTaskName', [
        (session) => {
            builder.Prompts.text(session, "What is new task name?");
        },
        async (session, results, next) => {
            let todo = {
                title: results.response,
                userId: session.message.user.id
            };

            try {
                const result = await db.todos.save(todo);
                session.send(`Ok, I've saved your task :"${results.response}" in my database.`);
                next();
            } catch (e) {
                console.error(e);
                session.send(`Ups!! Cannot save "${results.response}" in my database... Please try again`);
                session.endDialog();
            }
        },
        (session) => {
            builder.Prompts.text(session, 'do you want to add one more? "yes/no"? ');
        },
        (session, results) => {
            if (results && results.response.match(regexpYes)) {
                session.beginDialog('askForTaskName');
            } else {
                session.send('Ok. no problem.');
                session.endDialog();
            }
        }
    ]).triggerAction({
        matches: 'AddTask'
    });


//dialog to get tasks
    bot.dialog('getTodos', [
        async (session) => {
            const findQuery = {'userId': session.message.user.id};
            let todosResponse = '';
            let textMessage;

            try {
                let todos = await db.collection('todos').findAsCursor(findQuery).toArray();

                if (todos && todos.length) {
                    todosResponse = formatMessages.getFormatedTodos(todos);
                    textMessage = `Here are your task(s):<br/> ${todosResponse}`
                } else {
                    textMessage = 'You do not have any task scheduled';
                }

                session.send(textMessage);

            } catch (e) {
                console.error(e);
                session.send(`Ups!! Cannot save "${results.response}" in my database... Please try again`);
            }

            session.endDialogWithResult();
        }
    ]).triggerAction({
        matches: 'GetTasks'
    });
}

module.exports = {create};