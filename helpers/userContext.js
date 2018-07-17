import {getUserContext} from './database-queries';
import generalConstants from '../constants/general';

async function getUserContextInfo(opts) {
    const {userId, request} = opts;
    let contextInfo = {
        payload: '',
        type: null,
        hasContext: false
    };

    try {
        let context = await getUserContext(userId);
        if(request) {
            switch (context) {
                case generalConstants.userContext.lastAction:
                    contextInfo = context.lastAction;

                    contextInfo.hasContext = true;
                    break;
                default :
                    contextInfo.hasContext = false;
            }
        }

        return contextInfo;
    } catch(err) {
        console.error(err);
    }
}


export {getUserContextInfo}