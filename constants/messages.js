let messages = {
    serverResponseMessages: {
        listening: "listening on"
    },
    getBotGreetingMessage: (userName) => {
        return `Hi, ${userName}.
        Let me show you what I can do -
        here are intents you can use:<br/>
        "add task" to create new task :)<br/>
        "show tasks" to get you task list.<br/>
        Btw, I also learn how to remove and mark task as done:).
        Have a nice journey!!!`;
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
        return `Ok. no problem.Catch you later.`
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
    noItemFound: 'No item found'
};


export {messages};