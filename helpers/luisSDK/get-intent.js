const axios = require('axios');
let querystring = require('querystring');

const config  = require('../../config');

async function getIntent (text) {
    const luisAppId = process.env.APP_ID;
    const luisEndpoint = config.luisUrl;
    const queryParams = {
        "subscription-key": process.env.SUBSCRIPTION_KEY,
        "timezoneOffset": "0",
        "verbose":  true,
        "q": text
    };
    const requestUrl = `${luisEndpoint}${luisAppId}?${querystring.stringify(queryParams)}`;

    let responce = await axios(requestUrl);

    return responce.data;
}


module.exports = getIntent;