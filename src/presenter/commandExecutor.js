var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.commandExecutor = function () {
    "use strict";

    var that = {},
        commandQueue = [];

    that.execute = function (command) {
        commandQueue.push(command);
        command.execute();
    };

    that.undo = function (command) {
        if (commandQueue.length > 0) {
            commandQueue.pop().undo();
        }
    };

    // TODO: redo

    return that;
};