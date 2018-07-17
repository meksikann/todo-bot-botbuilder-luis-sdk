let keyMirror = require('keymirror');

const generalConstants = {
    userContext: keyMirror({
        'lastUserIntent': null
    }),
    userAnalysisResult: keyMirror({
        'askedAlready': null,
        'proceed': null
    })
};


export default  generalConstants;