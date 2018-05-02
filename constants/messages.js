let messages = {
    serverResponseMessages: {
        listening: "listening on"
    },
    getBotGreetingMessage: (userName) => {
        return `Hi, ${userName}.
        Here are commands you can use:<br/>
        "add task" to create new task :)<br/>
        "show tasks" to get you task list.<br/>
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
    return `${text} do you want to add one more? "yes/no"? `
},
    getNoProblem: ()=> {
        return `Ok. no problem.`
    },
    getYouDontHaveTasks: ()=> {
        return `You do not have any task scheduled`;
    },

    getCnnotGetItems: ()=> {
        return `Ups!! Cannot get items`;
    }
};


export {messages};