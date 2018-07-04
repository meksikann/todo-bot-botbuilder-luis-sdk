let messages = {
    serverResponseMessages: {
        listening: "listening on"
    },
    /***************************************************************************************
    * ****************************** get methods *******************************************
    * **************************************************************************************/
    getBotGreetingMessage: (userName) => {
        return `Hi, ${userName}. How can I help you?`;
    },
    getWhatNewTaskName: () => {
        return 'What is new task name?'
    },
    getSavedTask: (text) => {
        return `Ok, I've saved your task :"${text}" in my database.`;
    },
    getCannotSaveTask: (text)=> {
        return `Ups!! Cannot save "${text}" in my database... Please try again`;
    },
    getWantAddMore: (text) => {
        return `${text}, do you want to add one more? "yes/no"? `
    },
    getNoProblem: ()=> {
        return `Ok. no problem ,Catch you later.`
    },
    getYouDontHaveTasks: (username)=> {
        return `You do not have any task scheduled`;
    },

    getCannotGetItems: ()=> {
        return `Ups!! Cannot get items`;
    },
    getDontUnderstanYou: (username)=> {
        return `I don't fallow you, ${username}. Please try to use other sentences.`;
    },
    getWantDoTaskActions: ()=> {
        return 'Do you want to do some actions with tasks?<br/>' +
            'Maybe mark as done or remove task from list or add one? Don`t hesitate to ask me';
    },
    getWhatTaskFinished: () => {
        return 'What task have you finished? please pick a number...';
    },
    getMarkedTaskDone: (userName, taskName) => {
        return `Great, ${userName}! I've marked "${taskName}" as done."`
    },
    getRemovedTask: (userName, taskName) => {
        return `Great, ${userName}! I've removed "${taskName}" .`
    },
    /**************************************************************************
    ******************************* string constants **************************
     **************************************************************************/
    noItemFound: 'No item found',
    cancelConversation: "Ok  See you later",
    radioOn: 'Ok my friend, will turn on radio right now',
    failedRadioOn: 'Failed to turn on the radio.',
    sureToRemoveAll: 'Are you really sure you want to remove all your tasks?',
    allTasksRemoved: 'ok, I have just removed all  your tasks',
    shitSomethingWrong: 'Shit , something went wrong!',
    askName: 'Hi! What is your name?'
};


export {messages};