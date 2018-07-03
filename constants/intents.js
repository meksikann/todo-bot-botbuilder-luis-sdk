let keyMirror = require('keymirror');

const intents = {
    'askForTaskName': null,
    'AddTask': null,
    'GetTasks': null,
    'Greeting': null,
    'None': null,
    'FinishTask': null,
    'RemoveTask': null,
    'cancelConversation': null,
    'radioOn': null,
    'removeAllTasks': null
};

export default keyMirror(intents);