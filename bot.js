global.builder = require('botbuilder');

import config from './config';
import {getFormatedTodos} from './helpers/format-messages';
import {messages} from './constants/messages';
import intents from './constants/intents';

const regexpYes = /^yes$/i;
const regexpNo = /^no$/i;
let db = config.db;


function botCreate(connector) {
    let inMemoryStorage = new builder.MemoryBotStorage();

    let bot = new builder.UniversalBot(connector
    ).set('storage', inMemoryStorage);


    //connect to LUIS
    let recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);

    bot.recognizer(recognizer);

    //None intent dialog **************************************************
    bot.dialog(intents.None,function (session) {
        const userName = session.message.user.name;

        session.send(
            messages.getDontUnderstanYou(userName));
        session.endDialog();
    })
        .triggerAction({
            matches: intents.None
        });

    //greeting dialog ****************************************************
    bot.dialog(intents.Greeting,function (session) {
        const userName = session.message.user.name;

        session.send(
            messages.getBotGreetingMessage(userName));
        session.endDialog();
    })
        .triggerAction({
            matches: intents.Greeting
        });


    //dialog to ask for a task name *****************************************
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

            builder.Prompts.confirm(session, messages.getWantAddMore(userName));
        },
        (session, results) => {
            if (results.response) {
                session.beginDialog(intents.askForTaskName);
            } else {
                session.send(messages.getNoProblem());
                session.endDialog();
            }
        }
    ]).triggerAction({
        matches: intents.AddTask
    });


//dialog to get tasks ***************************************************************
    bot.dialog(intents.GetTasks, [
        async (session) => {
            const findQuery = {'userId': session.message.user.id};
            const userName = session.message.user.name;
            let todosResponse = '';
            let textMessage;

            try {
                let todos = await db.collection('todos').findAsCursor(findQuery).toArray();

                if (todos && todos.length) {
                    todosResponse = getFormatedTodos(todos);
                    textMessage = `Here are your task(s), ${userName}:<br/> ${todosResponse}`
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