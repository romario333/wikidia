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

WIKIDIA.presenter.resizeCommand = function (node, newWidth, newHeight) {
    "use strict";

    var that = {},
        oldWidth, oldHeight;

    that.execute = function () {
        oldWidth = node.width;
        oldHeight = node.height;

        node.changeEventEnabled = false;
        node.width = newWidth;
        node.height = newHeight;
        node.fireChange();
    };

    that.undo = function () {
        node.changeEventEnabled = false;
        node.width = oldWidth;
        node.height = oldHeight;
        node.fireChange();
    };

    return that;
};