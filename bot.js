global.builder = require('botbuilder');
require('dotenv').config();
const axios = require('axios');

import {getFormatedTodos, getNumberedTodos} from './helpers/format-messages';
import {getTopIntent} from "./helpers/recognize-helper";
import {botSayInFestival} from './helpers/tts-synthesis';
import {getUserContextInfo, setUserContextInfo} from './helpers/userContext';
import {addTask, markAsDone, removeTask, getActiveTasks, getAllTasks, removeAllTasks} from './helpers/database-queries';
import {messages} from './constants/messages';
import intentsConstants from './constants/intents';
import {entities} from './constants/entities';
import generalConstants from './constants/general';

// brain import ****************
import {analyseUserContext} from './brain-nodes/index';


const radioOnLambdaUrl = process.env.LAMBDA_RADIO_ON;

function botCreate(connector) {
    let inMemoryStorage = new builder.MemoryBotStorage();

    let bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);

    /**********************************************************************
     * middleware
     * ********************************************************************/

    bot.use({
        botbuilder: (session, next) => {
            builder.LuisRecognizer.recognize(session.message.text, process.env.LUIS_MODEL_URL,
                async (err, intents, entities) => {
                    if (err) {
                        return console.error(err);
                    }

                    console.log('MIDDLEWARE RECOGNIZE HANDLER !------------------------------------------------------>');
                    console.log(intents);

                    const topScore = 0.8;
                    const incomeMessage = session.message.text;
                    const userId = session.message.user.id;

                    // get top intent deppending from top score
                    //todo!!!!!!!!!!
                    const topIntent = getTopIntent(intents, topScore);

                    // get user talk context from db
                    const userContext = await getUserContextInfo(userId);


                    //TODO: make recognizer handler here and context handler




                    //     const opts = {
                    //        type: result.intent,
                    //        context: userContext
                    //     };
                    //
                    //     try {
                    //         analysisResult  = await analyseUserContext(opts);
                    //         callback(null, analysisResult);
                    //     } catch(err) {
                    //         console.error('Error in user context analysis: ',err);
                    //         callback(err, {});
                    //     }

                    //session.beginDialog(intentsConstants.Greeting);
                    next();
                });
        }
    });


    /**********************************************************************
     * recognizer
     * ********************************************************************/
    // let recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
    //
    // let intents = new builder.IntentDialog({intentThreshold: 0.8, recognizers: [recognizer]});
    //
    // bot.dialog('/', intents);
    //
    // //match intents with dialogs to trigger
    //
    // intents.matches(intentsConstants.Greeting, intentsConstants.Greeting);
    // intents.matches(intentsConstants.AddTask, intentsConstants.AddTask);
    // intents.matches(intentsConstants.GetTasks, intentsConstants.GetTasks);
    // intents.matches(intentsConstants.FinishTask, intentsConstants.FinishTask);
    // intents.matches(intentsConstants.RemoveTask, intentsConstants.RemoveTask);
    // intents.matches(intentsConstants.cancelConversation, intentsConstants.cancelConversation);
    // intents.matches(intentsConstants.radioOn, intentsConstants.radioOn);
    // intents.matches(intentsConstants.removeAllTasks, intentsConstants.removeAllTasks);
    // intents.matches(intentsConstants.whatCanBotDo, intentsConstants.whatCanBotDo);
    // intents.matches(intentsConstants.appreciation, intentsConstants.appreciation);
    // intents.matches(intentsConstants.farewell, intentsConstants.farewell);
    // //trigger dialog with custom one-time message in it
    // intents.matches(intentsConstants.oneTimeMessage, intentsConstants.oneTimeMessage);
    //
    // //if no intent recognized use default message
    // intents.onDefault((session, args) => {
    //     session.send('No intent recognized');
    //     session.endDialog('Type some other utterance please');
    // });

    /**********************************************************************
     * dialogs
     * ********************************************************************/

    //None intent dialog **************************************************
    bot.dialog(intentsConstants.None, function (session) {
        const userName = session.userData.userName;

        botSayInFestival({message: "I don't follow you! What you say?", expectingInput: true, session: session});

        session.send(
            messages.getDontUnderstanYou(userName));
        session.endDialog();
    });

    //greeting dialog ****************************************************
    bot.dialog(intentsConstants.Greeting, [
        (session, args, next) => {
            const setOpts = {
                userId: session.message.user.id,
                lastUserIntent: intentsConstants.Greeting
            };

            setUserContextInfo(setOpts);

            session.userData.userName ? next() : botSayInFestival({
                message: messages.askName,
                expectingInput: true,
                session: session,
                callback: () => {
                    builder.Prompts.text(session, messages.askName);
                }
            });
        },
        (session, results) => {
            const userName = results.response ? (session.userData.userName = results.response, results.response) : session.userData.userName;

            botSayInFestival({
                message: `Hey how can I help you, ${userName}?`,
                expectingInput: true,
                session: session,
                callback: () => {
                    session.send(
                        messages.getBotGreetingMessage(userName));
                    session.endDialog();
                }
            });
        }]);


    //dialog to ask for a task name *****************************************
    bot.dialog(intentsConstants.AddTask, [
        (session, args, next) => {

            if (args) {
                let intent = args.intent;
                let entity = builder.EntityRecognizer.findEntity(intent.entities, 'taskName');

                if (entity && entity.type == entities.taskName) {
                    next({response: entity.entity})
                } else {
                    botSayInFestival({
                        message: 'please provide a task name',
                        expectingInput: true,
                        session: session,
                        callback: () => {
                            builder.Prompts.text(session, messages.getWhatNewTaskName());
                        }
                    });

                }
            } else {
                botSayInFestival({
                    message: 'please provide a task name',
                    expectingInput: true,
                    session: session,
                    callback: () => {
                        builder.Prompts.text(session, messages.getWhatNewTaskName());
                    }
                });
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
            const userName = session.userData.userName;
            botSayInFestival({message: 'Wanna add more tasks?', expectingInput: true, session: session});
            builder.Prompts.confirm(session, messages.getWantAddMore(userName));
        },
        (session, results) => {
            if (results.response) {
                session.beginDialog(intentsConstants.AddTask);
            } else {
                session.send(messages.getNoProblem());
                botSayInFestival({
                    message: messages.getNoProblem(), expectingInput: true, session: session, callback: () => {
                        session.endDialog();
                    }
                });
            }
        }
    ]);

    //dialog to get tasks ***************************************************************
    bot.dialog(intentsConstants.GetTasks, [
        async (session) => {
            const userName = session.userData.userName;
            let todosResponse = '';
            let textMessage;
            let voiceMessage = '';
            const setOpts = {
                userId: session.message.user.id,
                lastUserIntent: intentsConstants.GetTasks
            };

            setUserContextInfo(setOpts);

            try {
                let todos = await getAllTasks(session.message.user.id);

                if (todos && todos.length) {
                    todosResponse = getFormatedTodos(todos);
                    textMessage = `Here are your task(s), ${userName}:<br/> ${todosResponse}<br/><br/>${messages.getWantDoTaskActions()}`
                    voiceMessage = `Here are your tasks , you have ${todos.length} items`;
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

            session.endDialog();
        }
    ]);


    //dialog to set task as done *********************************************************
    bot.dialog(intentsConstants.FinishTask, [
        async (session) => {
            let todosResponse = [];
            let textMessage;
            let userId = session.message.user.id;
            const setOpts = {
                userId: session.message.user.id,
                lastUserIntent: intentsConstants.FinishTask
            };

            setUserContextInfo(setOpts);

            try {
                let todos = await getActiveTasks(userId);

                if (todos && todos.length) {
                    session.userData.todosForFinish = todos;

                    todosResponse = getNumberedTodos(todos);
                    botSayInFestival({
                        message: `Please choose an task number to mark as done and press 'Enter'`,
                        expectingInput: true,
                        session: session
                    });
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
            const userName = session.userData.userName;
            const todos = session.userData.todosForFinish;
            const taskNumber = results.response;

            const taskName = todos[taskNumber - 1] ? todos[taskNumber - 1].title : null;
            const taskId = todos[taskNumber - 1] ? todos[taskNumber - 1]._id : null;

            if (taskId) {
                //mark task as done in db
                try {
                    let todos = await markAsDone(taskId);
                    botSayInFestival({
                        message: 'Super. Task has been marked as done',
                        expectingInput: true,
                        session: session
                    });
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

            session.endDialog();
        }
    ]);

    //Dialog to remove task **********************************************************
    bot.dialog(intentsConstants.RemoveTask, [
        async (session) => {
            const setOpts = {
                userId: session.message.user.id,
                lastUserIntent: intentsConstants.RemoveTask
            };

            setUserContextInfo(setOpts);

            let todosResponse = [];
            let textMessage;
            let userId = session.message.user.id;
            try {
                let todos = await getAllTasks(userId);

                if (todos && todos.length) {
                    session.userData.todosForRemove = todos;

                    todosResponse = getNumberedTodos(todos);
                    botSayInFestival({
                        message: `Please choose an task number to remove.'`,
                        expectingInput: true,
                        session: session
                    });
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
            const userName = session.userData.userName;
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

            session.endDialog();
        }
    ]);

    //dialog to cancel conversation **************************************************
    bot.dialog(intentsConstants.cancelConversation, (session) => {


        session.endConversation(messages.cancelConversation);
        botSayInFestival({
            message: messages.cancelConversation,
            expectingInput: true,
            session: session,
            callback: () => {
                const setOpts = {
                    userId: session.message.user.id,
                    lastUserIntent: intentsConstants.cancelConversation
                };

                setUserContextInfo(setOpts);
            }
        });
    });

    //dialog to turn on radio **************************************************
    bot.dialog(intentsConstants.radioOn, (session) => {

        axios.get(radioOnLambdaUrl)
            .then(function (response) {
                session.endConversation(messages.radioOn);
                botSayInFestival({
                    message: messages.radioOn,
                    expectingInput: false,
                    session: session,
                    callback: () => {
                        const setOpts = {
                            userId: session.message.user.id,
                            lastUserIntent: intentsConstants.radioOn
                        };

                        setUserContextInfo(setOpts);
                    }
                });
            })
            .catch(function (error) {
                console.error(error);
                session.endConversation(messages.failedRadioOn);
                botSayInFestival({message: messages.failedRadioOn, expectingInput: false, session: session});
            });
    });

    bot.dialog(intentsConstants.removeAllTasks, [
        (session) => {
            botSayInFestival({
                message: messages.sureToRemoveAll,
                expectingInput: true,
                session: session,
                callback: () => {
                    const setOpts = {
                        userId: session.message.user.id,
                        lastUserIntent: intentsConstants.removeAllTasks
                    };
                    setUserContextInfo(setOpts);
                }
            });
            builder.Prompts.confirm(session, messages.sureToRemoveAll);
        },
        async (session, results) => {
            if (results.response) {
                let userId = session.message.user.id;

                try {
                    let result = await removeAllTasks(userId);

                    session.send(messages.allTasksRemoved);
                    botSayInFestival({
                        message: messages.allTasksRemoved, expectingInput: true, session: session, callback: () => {
                            session.endDialog();
                        }
                    });

                } catch (err) {
                    console.error(err);
                    botSayInFestival({
                        message: messages.shitSomethingWrong,
                        expectingInput: true,
                        session: session
                    });
                    session.send(messages.shitSomethingWrong);
                }

            } else {
                session.send(messages.getNoProblem());
                botSayInFestival({
                    message: messages.getNoProblem(), expectingInput: true, session: session, callback: () => {
                        session.endDialog();
                    }
                });
            }
        }
    ]);

    //dialog show what bot can do **************************************************
    bot.dialog(intentsConstants.whatCanBotDo, (session) => {
        botSayInFestival({
            message: messages.botCanDoNextStuff,
            expectingInput: true,
            session: session,
            callback: () => {
                const setOpts = {
                    userId: session.message.user.id,
                    lastUserIntent: intentsConstants.whatCanBotDo
                };

                session.send(messages.botCanDoNextStuff);
                session.endDialog();
                setUserContextInfo(setOpts);
            }
        });
    });


    //dialog response for thank you **************************************************
    bot.dialog(intentsConstants.appreciation, (session) => {
        botSayInFestival({
            message: messages.appreciationResponse,
            expectingInput: true,
            session: session,
            callback: () => {
                const setOpts = {
                    userId: session.message.user.id,
                    lastUserIntent: intentsConstants.appreciation
                };

                session.send(messages.appreciationResponse);
                session.endDialog();
                setUserContextInfo(setOpts);
            }
        });
    });

    //dialog response for farewell **************************************************
    bot.dialog(intentsConstants.farewell, (session) => {
        let botReplyMessage = 'Bye';

        botSayInFestival({
            message: botReplyMessage,
            expectingInput: false,
            session: session,
            callback: () => {
                const setOpts = {
                    userId: session.message.user.id,
                    lastUserIntent: intentsConstants.farewell
                };

                session.send(botReplyMessage);
                session.endDialog();
                //save use context
                setUserContextInfo(setOpts);
            }
        });
    });

    //None intent dialog **************************************************
    bot.dialog(intentsConstants.oneTimeMessage, function (session, results) {
        const message = '';

        botSayInFestival({
            message: "I don't follow you! What you say?", expectingInput: true, session: session,
            callback: () => {
                session.send(message);
                session.endDialog();
            }
        });
    });

    /**********************************************************************
     * ******************** end dialogs ***************************************
     * ********************************************************************/
}

export {botCreate};