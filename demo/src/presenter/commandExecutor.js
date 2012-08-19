define(function(require) {
    "use strict";

    return function () {
        var that = {},
            commandQueue = [];

        that.execute = function (command) {
            commandQueue.push(command);
            command.execute();
        };

        /**
         * Undoes last command and returns affected items.
         *
         * @param command
         */
        that.undo = function (command) {
            if (commandQueue.length > 0) {
                return commandQueue.pop().undo();
            }
        };

        // TODO: redo

        return that;
    };
});