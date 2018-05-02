global.builder = require('botbuilder');

import config from './config';
import formatMessages from './helpers/format-messages';
import {messages} from './constants/messages';
import intents from './constants/intents';

const regexpYes = /^yes$/i;
const regexpNo = /^no$/i;
let db = config.db;


function botCreate(connector) {
    let inMemoryStorage = new builder.MemoryBotStorage();

    let bot = new builder.UniversalBot(connector,
        function (session) {
            const userName = session.message.user.name;

            session.send(
                messages.getBotGreetingMessage(userName));
        }
    ).set('storage', inMemoryStorage);


    //connect to LUIS
    let recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);

    bot.recognizer(recognizer);

    //dialog to ask for a task name
    bot.dialog(intents.askForTaskName, [
        (session) => {
            builder.Prompts.text(session, messages.getWhatNewTaskName());
        },
        async (session, results, next) => {
            let todo = {
                title: results.response,
                userId: session.message.user.id
            };

            try {
                const result = await db.todos.save(todo);
                session.send(messages.getSavedTask(results.response));
                next();
            } catch (e) {
                console.error(e);
                session.send(messages.getCannotSaveTask(results.response));
                session.endDialog();
            }
        },
        (session) => {
            const userName = session.message.user.name;

            builder.Prompts.text(session, messages.getWantAddMore(userName));
        },
        (session, results) => {
            if (results && results.response.match(regexpYes)) {
                session.beginDialog(intents.askForTaskName);
            } else {
                session.send(messages.getNoProblem());
                session.endDialog();
            }
        }
    ]).triggerAction({
        matches: intents.AddTask
    });


//dialog to get tasks
    bot.dialog(intents.GetTasks, [
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
                    textMessage = messages.getYouDontHaveTasks();
                }

                session.send(textMessage);

            } catch (e) {
                console.error(e);
                session.send(messages.getCnnotGetItems());
            }

            session.endDialogWithResult();
        }
    ]).triggerAction({
        matches: intents.GetTasks
    });
}

export {botCreate};