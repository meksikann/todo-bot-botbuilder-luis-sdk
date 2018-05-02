let keyMirror = require('keymirror');

const intents = {
    'askForTaskName': null,
    'AddTask': null,
    'GetTasks': null,
    'Greeting': null,
    'None': null
};

export default keyMirror(intents);