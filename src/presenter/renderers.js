var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

/**
 * <code>nodeRendered</code> is responsible for rendering of the content of a node.
 * TODO: zacina to vypadat spis jako controller
 */
WIKIDIA.presenter.nodeRenderer = function () {
    "use strict";

    var that = {};

    that.render = function (item) {
        var node = item.data;
        var nodeView = item.view;

        nodeView.clear();
        nodeView.updateView({x: node.x, y: node.y, width: node.width, height: node.height});
        nodeView.isSelected(item.isSelected);

        nodeView.rect({x: node.x, y: node.y, width: node.width, height: node.height, rx: 3, ry: 3, fill: "#A1BF36", stroke: "black"});
        nodeView.text(node.text);
    };

    that.showNearbyConnectionPoint = function (node, nodeView, x, y, gridStep) {
        var nearestPoint;

        var py;
        // TODO: this is just quick hacky way, think about how to do this properly
        if (Math.abs(x - node.x) < gridStep) {
            for (py = node.y; py <= node.y + node.height; py += gridStep) {
                if (nearestPoint === undefined || Math.abs(py - y) < Math.abs(nearestPoint.y - y)) {
                    nearestPoint = {x: node.x, y: py};
                }
            }
        }

        if (Math.abs(x - (node.x + node.width)) < gridStep) {
            for (py = node.y; py <= node.y + node.height; py += gridStep) {
                if (nearestPoint === undefined || Math.abs(py - y) < Math.abs(nearestPoint.y - y)) {
                    nearestPoint = {x: node.x + node.width, y: py};
                }
            }
        }

        nodeView.hideConnectionPoints();
        if (nearestPoint) {
            nodeView.showConnectionPoint(nearestPoint);
        }
    };

    return that;
};

WIKIDIA.presenter.useCaseNodeRenderer = function () {
    "use strict";

    var that = WIKIDIA.presenter.nodeRenderer();

    that.render = function (item) {
        var node = item.data;
        var nodeView = item.view;

        nodeView.clear();
        nodeView.updateView({x: node.x, y: node.y, width: node.width, height: node.height});
        nodeView.isSelected(item.isSelected);

        var halfWidth = node.width / 2;
        var halfHeight = node.height / 2;

        nodeView.ellipse({
            cx: node.x + halfWidth,
            cy: node.y + halfHeight,
            rx: halfWidth,
            ry: halfHeight,
            fill: "#A1BF36",
            stroke: "black"
        });
        nodeView.text(node.text);
    };

    return that;
};

WIKIDIA.presenter.lineRenderer = function () {
    "use strict";

    var that = {};

    that.render = function (item) {
        var line = item.data;
        var lineView = item.view;

        lineView.clear();
        lineView.updateView({x1: line.points(0).x, y1: line.points(0).y, x2: line.points(1).x, y2: line.points(1).y});
        lineView.isSelected(item.isSelected);

        lineView.line({x1: line.points(0).x, y1: line.points(0).y, x2: line.points(1).x, y2: line.points(1).y, stroke: "black"});
        // TODO: text
    };

    return that;
};
