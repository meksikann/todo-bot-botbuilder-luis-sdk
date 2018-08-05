const say = require('say');

function botSayInFestival(opts) {
    const message = opts.message;
    const session = opts.session;
    const voices = [
        'voice_don_diphone',
        'voice_ked_diphone',
        'voice_kal_diphone',
        'voice_rab_diphone'
    ];

    console.log('enable speech: ', process.env.ENABLE_SPEECH);

    // use speech synthesis if enabled ********************************
    if(process.env.ENABLE_SPEECH == 1) {
        if (opts.callback) {
            say.speak(message, null, null, (err) => {
                if (err) {
                    return console.log(err);
                }

                opts.callback();
            });
        } else {
            say.speak(message, voices[1], null, (err) => {
                if(err) {
                    return console.error(err);
                }
            });
        }

        if(opts.expectingInput && session) {
            let msg = new builder.Message(session)
                .speak(message)
                .inputHint(builder.InputHint.expectingInput);
            session.send(msg)
        }

        return;
    }


    // if speech synthesis not enabled just run the callback
    if (opts.callback) {
        opts.callback();
    }
}

export {botSayInFestival}