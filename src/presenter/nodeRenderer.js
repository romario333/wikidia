var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

/**
 * <code>nodeRendered</code> is responsible for rendering of the content of a node.
 */
WIKIDIA.presenter.nodeRenderer = function () {
    "use strict";

    var that = {};

    that.render = function (node, nodeView) {
        nodeView.clear();
        nodeView.rect({x: node.x, y: node.y, width: node.width, height: node.height, rx: 3, ry: 3});
    };

    return that;
};