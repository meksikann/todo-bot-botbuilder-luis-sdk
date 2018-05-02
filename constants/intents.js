let keyMirror = require('keymirror');

const intents = {
    'askForTaskName': null,
    'AddTask': null,
    'GetTasks': null
};

export default keyMirror(intents);