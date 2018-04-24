
//send message wrapper
function sendMessageByBot(session, message) {
    session.send(message);
}


module.exports.sendMessage = sendMessageByBot;
