
/* ****************************************************************************
  Here will be bot brains: context analysys, further actions, at the beginning.
 ******************************************************************************/

process.on('message', msg => {
    let message = JSON.stringify(msg);
    console.log('worker got message: ', message);
    analyseUserContext(message);

});

//TODO: MAKE A USER CONTEXT ANALYZER: use user context in dialogs ================================
function analyseUserContext (data) {
    let response = {};
    console.log('analysing user context ---------------->');
    console.log(data);

    //response.data = generalConstants.userAnalysisResult.proceed;
    process.send('test ---------------------------------->');
}
