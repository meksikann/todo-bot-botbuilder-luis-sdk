global.builder = require('botbuilder');
const say = require('say');
const axios = require('axios');

import {getFormatedTodos, getNumberedTodos} from './helpers/format-messages';
import {messages} from './constants/messages';
import intents from './constants/intents';
import {entities} from './constants/entities';
import {addTask, markAsDone, removeTask, getActiveTasks, getAllTasks} from './helpers/database-queries';

const regexpYes = /^yes$/i;
const regexpNo = /^no$/i;
const radioOnLambdaUrl ='https://ty2dmvacnb.execute-api.us-east-1.amazonaws.com/dev/';

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

        botSayInFestival({message: "I don't follow you! What you say?", expectingInput: true, session: session});

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

        botSayInFestival({message: 'Hey dude.  How can I help you?', expectingInput: true, session: session});
        session.send(
            messages.getBotGreetingMessage(userName));
    })
        .triggerAction({
            matches: intents.Greeting
        });


    //dialog to ask for a task name *****************************************
    bot.dialog(intents.askForTaskName, [
        (session, args, next) => {

            if (args) {
                let intent = args.intent;
                let entity = builder.EntityRecognizer.findEntity(intent.entities, 'taskName');

                if (entity && entity.type == entities.taskName) {
                    next({response: entity.entity})
                } else {
                    botSayInFestival({message: 'please provide a task name',expectingInput: true, session: session});
                    builder.Prompts.text(session, messages.getWhatNewTaskName());
                }
            } else {
                botSayInFestival({message: 'please provide a task name', expectingInput: true, session: session});
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
                botSayInFestival({message: 'task saved', callback: next});
            } catch (e) {
                console.error(e);
                botSayInFestival({message: 'Failed to save task'});
                session.send(messages.getCannotSaveTask(results.response));

                session.endDialog();
            }
        },
        (session) => {
            const userName = session.message.user.name;
            botSayInFestival({message: 'Wanna add more tasks?',expectingInput: true, session: session});
            builder.Prompts.confirm(session, messages.getWantAddMore(userName));
        },
        (session, results) => {
            if (results.response) {
                session.beginDialog(intents.askForTaskName);
            } else {
                session.send(messages.getNoProblem());
                botSayInFestival({
                    message: messages.getNoProblem(),expectingInput: true, session: session, callback: ()=> {
                        session.endDialog();
                    }
                });
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
            let voiceMessage = '';

            try {
                let todos = await getAllTasks(session.message.user.id);

                if (todos && todos.length) {
                    todosResponse = getFormatedTodos(todos);
                    textMessage = `Here are your task(s), ${userName}:<br/> ${todosResponse}<br/><br/>${messages.getWantDoTaskActions()}`
                    voiceMessage = 'Here are your tasks User';
                } else {
                    textMessage = messages.getYouDontHaveTasks();
                    voiceMessage = 'There are no tasks in database';
                }

                //write items list
                session.send(textMessage);

                botSayInFestival({message: voiceMessage, expectingInput: true, session: session});

            } catch (e) {
                console.error(e);
                botSayInFestival({message: messages.getCannotGetItems(), expectingInput: true, session: session});
                session.send(messages.getCannotGetItems());
            }

            //session.endDialogWithResult();
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
                    botSayInFestival({message: `Please choose an task number to mark as done and press 'Enter'`, expectingInput: true, session: session});
                    textMessage = `Please choose an task number to mark as done and press 'Enter'<br/>${todosResponse}`
                } else {
                    textMessage = messages.getYouDontHaveTasks();
                }

                builder.Prompts.number(session, textMessage);
            } catch (err) {
                console.error(err);
                botSayInFestival({message: messages.getCannotGetItems(), expectingInput: true, session: session});
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
                    botSayInFestival({message: 'Super. Task has been marked as done', expectingInput: true, session: session});
                    session.send(messages.getMarkedTaskDone(userName, taskName));

                } catch (err) {
                    console.error((err));
                    botSayInFestival({message: messages.noItemFound, expectingInput: true, session: session});
                    session.send(messages.noItemFound);
                }
            } else {
                botSayInFestival({message: messages.noItemFound, expectingInput: true, session: session});
                session.send(messages.noItemFound);
            }

            //session.endDialog();
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
                    botSayInFestival({message: `Please choose an task number to remove and press 'Enter'`, expectingInput: true, session: session});
                    textMessage = `Please choose an task number to remove and press 'Enter'<br/>${todosResponse}`
                } else {
                    textMessage = messages.getYouDontHaveTasks();
                }

                builder.Prompts.number(session, textMessage);

            } catch (err) {
                console.error(err);
                botSayInFestival({message: messages.getCannotGetItems(), expectingInput: true, session: session});
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

                    botSayInFestival({message: 'Super. Task has been removed', expectingInput: true, session: session});
                    session.send(messages.getRemovedTask(userName, taskName));
                } catch (err) {
                    console.error((err));
                    botSayInFestival({message: messages.noItemFound, expectingInput: true, session: session});
                    session.send(messages.noItemFound);

                }
            } else {
                botSayInFestival({message: messages.noItemFound, expectingInput: true, session: session});
                session.send(messages.noItemFound);
            }

            //session.endDialog();
        }
    ]).triggerAction({
        matches: intents.RemoveTask
    });

    //dialog to cancel conversation **************************************************
    bot.dialog(intents.cancelConversation, (session) => {
            session.endConversation(messages.cancelConversation);
            botSayInFestival({message: messages.cancelConversation, expectingInput: true, session: session});
        }
    ).triggerAction({
            matches: intents.cancelConversation
        });

    //dialog to turn on radio **************************************************
    bot.dialog(intents.radioOn, (session) => {
            axios.get(radioOnLambdaUrl)
                .then(function (response) {
                    session.endConversation(messages.radioOn);
                    botSayInFestival({message: messages.radioOn, expectingInput: false, session: session});
                })
                .catch(function (error) {
                    console.error(error);
                    session.endConversation(messages.failedRadioOn);
                    botSayInFestival({message: messages.failedRadioOn, expectingInput: false, session: session});
                });
        }
    ).triggerAction({
            matches: intents.radioOn
        })
}

function botSayInFestival(opts) {
    //format message
    const regExp = /./gi;
    const message = opts.message;
    const session = opts.session;
    const voices = [
        'voice_don_diphone',
        'voice_ked_diphone',
        'voice_kal_diphone',
        'voice_rab_diphone'
    ];


    if (opts.callback) {
        say.speak(message, voices[1], null, (err) => {
            if (err) {
                return console.log(err);
            }
            opts.callback();
        });
    } else {
        say.speak(message);
    }

    if(opts.expectingInput && session) {
        let msg = new builder.Message(session)
            .speak(message)
            .inputHint(builder.InputHint.expectingInput);
        session.send(msg)
    }
}
export {botCreate};