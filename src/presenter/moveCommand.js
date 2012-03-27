var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.moveCommand = function (nodeView, node, newX, newY) {
    "use strict";

    var that = {},
        oldX, oldY;

    that.execute = function () {
        oldX = node.x;
        oldY = node.y;

        node.x = newX;
        node.y = newY;

        // TODO: ach jo, ja nechci tady drzet odkaz na view (protoze to znamena, ze musim drzet view
        // jen kvuli undo historii
        nodeView.update();
    };

    that.undo = function () {
        node.x = oldX;
        node.y = oldY;

        nodeView.update();
    };

    return that;
};