define(function(require) {
    "use strict";

    return function () {
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
});