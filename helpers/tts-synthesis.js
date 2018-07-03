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


    if (opts.callback) {
        say.speak(message, voices[1], null, (err) => {
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
}

export {botSayInFestival}