import generalConstants from '../constants/general';

/* ****************************************************************************
  Here will be bot brains: context analysys, further actions, at the beginning.
 ******************************************************************************/
//TODO: MAKE A USER CONTEXT ANALYZER: use user context in dialogs ================================
function analyseUserContext (data) {
    let response = {};
    console.log('analysing user context ---------------->');
    console.log(data);

    response.data = generalConstants.userAnalysisResult.proceed;
    return response;
}

export {analyseUserContext}