let keyMirror = require('keymirror');

const intentsConstants = {
    'AddTask': null,
    'GetTasks': null,
    'Greeting': null,
    'None': null,
    'FinishTask': null,
    'RemoveTask': null,
    'cancelConversation': null,
    'radioOn': null,
    'removeAllTasks': null,
    'whatCanBotDo':null,
    'appreciation': null,
    'farewell': null,
    'oneTimeMessage': null
};

export default keyMirror(intentsConstants);