import generalConstants from '../constants/general';

/* ****************************************************************************
  Here will be bot brains: context analysys, further actions, at the beginning.
 ******************************************************************************/
//TODO: MAKE A USER CONTEXT ANALYZER: use user context in dialogs ================================
async function analyseUserContext (data) {
    let intentCallbackOpts = {
        score:1,
        intent: 'None'
    };

    console.log('analysing user context ---------------------------------------------------------------------->');
    console.log(data);

    intentCallbackOpts.intent = data.type;
    //intentCallbackOpts.intent = 'oneTimeMessage';

    return intentCallbackOpts;
}

export {analyseUserContext}