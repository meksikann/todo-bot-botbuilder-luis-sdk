import {getUserContext, setUserContext} from './database-queries';
import generalConstants from '../constants/general';

async function getUserContextInfo(userId) {
    try {
        return await getUserContext(userId);
    } catch(err) {
        console.error(err);
    }
}

async function setUserContextInfo(opts) {
    const {userId, lastUserIntent} = opts;
    let contextToSave = {
        lastUserIntent,
        userId
    };

    try {
        return await setUserContext(userId, contextToSave);
    } catch(err) {
        return console.error(err);
    }
}


export {getUserContextInfo, setUserContextInfo}