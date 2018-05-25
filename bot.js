global.builder = require('botbuilder');

import {getFormatedTodos, getNumberedTodos} from './helpers/format-messages';
import {messages} from './constants/messages';
import intents from './constants/intents';
import {entities} from './constants/entities';
import {addTask, markAsDone, removeTask, getActiveTasks, getAllTasks} from './helpers/database-queries';

const regexpYes = /^yes$/i;
const regexpNo = /^no$/i;

function botCreate(connector) {
    let inMemoryStorage = new builder.MemoryBotStorage();

    let bot = new builder.UniversalBot(connector
    ).set('storage', inMemoryStorage);


    //connect to LUIS
    let recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);

    bot.recognizer(recognizer);

    //None intent dialog **************************************************
    bot.dialog(intents.None, function (session) {
        const userName = session.message.user.name;

        session.send(
            messages.getDontUnderstanYou(userName));
        session.endDialog();
    })
        .triggerAction({
            matches: intents.None
        });


    //greeting dialog ****************************************************
    bot.dialog(intents.Greeting, function (session) {
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
        (session, args, next) => {

            //TODO: entity not shown here. maybe need more learning......
            console.log('args----------------------->', args);
            if(args) {
                let intent = args.intent;
                let entity = builder.EntityRecognizer.findEntity(intent.entities, 'taskName');
                console.log('found entity------------------------------->', entity);

                if(entity && entity.type == entities.taskName) {
                    next({ response: entity.entity })
                } else {
                    builder.Prompts.text(session, messages.getWhatNewTaskName());
                }
            } else {
                builder.Prompts.text(session, messages.getWhatNewTaskName());
            }

        },
        async (session, results, next) => {
            let todo = {
                title: results.response,
                userId: session.message.user.id,
                isRemoved: false,
                isDone: false
            };

            try {
                const result = await addTask(todo);
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
            const userName = session.message.user.name;
            let todosResponse = '';
            let textMessage;

            try {
                let todos = await getAllTasks(session.message.user.id);

                if (todos && todos.length) {
                    todosResponse = getFormatedTodos(todos);
                    textMessage = `Here are your task(s), ${userName}:<br/> ${todosResponse}<br/><br/>${messages.getWantDoTaskActions()}`
                } else {
                    textMessage = messages.getYouDontHaveTasks();
                }

                session.send(textMessage);

            } catch (e) {
                console.error(e);
                session.send(messages.getCannotGetItems());
            }

            session.endDialogWithResult();
        }
    ]).triggerAction({
        matches: intents.GetTasks
    });

//dialog to set task as done *********************************************************
    bot.dialog(intents.FinishTask, [
        async (session) => {
            let todosResponse = [];
            let textMessage;
            let userId = session.message.user.id;
            try {
                let todos = await getActiveTasks(userId);

                if (todos && todos.length) {
                    session.userData.todosForFinish = todos;

                    todosResponse = getNumberedTodos(todos);
                    textMessage = `Please choose an task number to mark as done and press 'Enter'<br/>${todosResponse}`
                } else {
                    textMessage = messages.getYouDontHaveTasks();
                }

                builder.Prompts.number(session, textMessage);
            } catch (err) {
                console.error(err);
                session.send(messages.getCannotGetItems());
            }
        },
        async (session, results) => {
            const userName = session.message.user.name;
            const todos = session.userData.todosForFinish;
            const taskNumber = results.response;

            const taskName = todos[taskNumber - 1] ? todos[taskNumber - 1].title : null;
            const taskId = todos[taskNumber - 1] ? todos[taskNumber - 1]._id : null;

            if (taskId) {
                //mark task as done in db
                try {
                    let todos = await markAsDone(taskId);

                    session.send(messages.getMarkedTaskDone(userName, taskName));
                } catch (err) {
                    console.error((err));
                    session.send(messages.noItemFound);
                }
            } else {
                session.send(messages.noItemFound);
            }

            session.endDialog();
        }
    ]).triggerAction({
        matches: intents.FinishTask
    });

    //Dialog to remove task **********************************************************
    bot.dialog(intents.RemoveTask, [
        async (session) => {
            let todosResponse = [];
            let textMessage;
            let userId = session.message.user.id;
            try {
                let todos = await getAllTasks(userId);

                if (todos && todos.length) {
                    session.userData.todosForRemove = todos;

                    todosResponse = getNumberedTodos(todos);
                    textMessage = `Please choose an task number to remove and press 'Enter'<br/>${todosResponse}`
                } else {
                    textMessage = messages.getYouDontHaveTasks();
                }

                builder.Prompts.number(session, textMessage);
            } catch (err) {
                console.error(err);
                session.send(messages.getCannotGetItems());
            }
        },
        async (session, results) => {
            const userName = session.message.user.name;
            const todos = session.userData.todosForRemove;
            const taskNumber = results.response;

            const taskName = todos[taskNumber - 1] ? todos[taskNumber - 1].title : null;
            const taskId = todos[taskNumber - 1] ? todos[taskNumber - 1]._id : null;

            if (taskId) {
                //remove task from db
                try {
                    let todos = await removeTask(taskId);
                    //const result = await db.collection('todos').update({'_id': mongojs.ObjectId(taskId)},{$set:{'isDone':true}});

                    session.send(messages.getRemovedTask(userName, taskName));
                } catch (err) {
                    console.error((err));
                    session.send(messages.noItemFound);
                }
            } else {
                session.send(messages.noItemFound);
            }

            session.endDialog();
        }
    ]).triggerAction({
        matches: intents.RemoveTask
    });

    //dialog to cancel conversation **************************************************
    bot.dialog(intents.cancelConversation, (session) => {
            session.endConversation(messages.cancelConversation);
        }
    ).triggerAction({
            matches: intents.cancelConversation
        })
}

export {botCreate};