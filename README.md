# todo-bot-botbuilder-luis-sdk

#description
main topic - make a todo helper bot

currently under development.
ment to apply LUIS sdk

LUIS Application

The first step to using LUIS is to create or import an application. Go to the home page, www.luis.ai, and log in. After creating your LUIS account you'll be able to Import an Existing Application where can you can select a local copy of the LuisBot.json file an import it.
========================================================================
#setup (babel used)

set mongodb local server
start mongod db: sudo systemctl start mongod

create db  with name: "todobot"

navigate to cloned project directory

paste LUIS_MODEL_URL=<your LUIS_APP_PATH_HERE> in .env file
installation: npm install
start:npm start

How to test the bot:

    Download and install the Bot Framework Emulator at https://docs.botframework.com/en-us/tools/bot-framework-emulator/.
    Start the emulator.npm start
    Connect to http://localhost:3978/api/messages, leaving the Microsoft App Id / Password fields blank.

You should now be able to message the bot from the emulator.
Type something like: add task or show me my tasks etc...
