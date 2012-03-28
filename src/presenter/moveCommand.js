var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.moveCommand = function (node, newX, newY) {
    "use strict";

    var that = {},
        oldX, oldY;

    that.execute = function () {
        oldX = node.x;
        oldY = node.y;

        node.changeEventEnabled = false;
        node.x = newX;
        node.y = newY;
        node.fireChange();
    };

    that.undo = function () {
        node.changeEventEnabled = false;
        node.x = oldX;
        node.y = oldY;
        node.fireChange();
    };

    return that;
};