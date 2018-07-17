import generalConstants from '../constants/general';

/* ****************************************************************************
  Here will be bot brains: context analysys, further actions, at the beginning.
 ******************************************************************************/
function analyseUserContext (data) {
    let response = {};
    console.log('analysing user context ---------------->');
    console.log(data);

    response.data = generalConstants.userAnalysisResult.proceed;
    return response;
}

export {analyseUserContext}