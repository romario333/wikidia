var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.moveCommand = function (items) {
    "use strict";

    var that = {},
        originalData = [];

    items.forEach(function (item) {
        // TODO: index always by same thing (by data id)
        originalData[item.oid] = item.data.copyShallow();
        // we have to backup connected lines for nodes too
        if (item.data.isNode) {
            item.data.connections().forEach(function (connection) {
                originalData[connection.oid] = connection.copyShallow();
            });
        }
    });

    function isBetween(value, from, to) {
        return value >= from && value <= to;
    }

    // TODO: stalo by za uvahu predelat, aby prijimalo x a y?
    that.dx = 0;
    that.dy = 0;

    that.preview = function () {
        that.execute();
    };

    that.cancelPreview = function () {
        that.undo();
    };

    that.execute = function () {
        items.forEach(function (item) {
            if (item.data.isNode) {
                var node = item.data;
                var originalNode = originalData[item.oid];
                node.changeEventsEnabled  = false;
                node.x = originalNode.x + that.dx;
                node.y = originalNode.y + that.dy;
                node.changeEventsEnabled  = true;
                node.fireChange();

                // TODO: I will have to do the same for resize command
                // update lines connected to node
                node.connections().forEach(function (connection) {
                    if (connection.isLine) {
                        // TODO: ugly way how to find which end of line is connected to this node
                        var originalLine = originalData[connection.oid];
                        var whichEnd;
                        if (isBetween(originalLine.x1, originalNode.x, originalNode.x + originalNode.width) && isBetween(originalLine.y1, originalNode.y, originalNode.y + originalNode.height)) {
                            whichEnd = "1";
                        } else {
                            whichEnd = "2";
                        }
                        console.log("whichEnd=" + whichEnd);

                        // update line to match new node position
                        var line = connection;
                        line.changeEventsEnabled = false;
                        line["x" + whichEnd] = originalLine["x" + whichEnd] + that.dx;
                        line["y" + whichEnd] = originalLine["y" + whichEnd] + that.dy;
                        line.changeEventsEnabled = true;
                        line.fireChange();
                    }
                });


            } else if (item.data.isLine) {
                var line = item.data;
                var originalLine = originalData[item.oid];
                line.changeEventsEnabled = false;
                line.x1 = originalLine.x1 + that.dx;
                line.y1 = originalLine.y1 + that.dy;
                line.x2 = originalLine.x2 + that.dx;
                line.y2 = originalLine.y2 + that.dy;
                line.changeEventsEnabled  = true;
                line.fireChange();
            } else {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }
        });
    };

    that.undo = function () {
        items.forEach(function (item) {
            if (item.data.isNode) {
                var node = item.data;
                var originalNode = originalData[item.oid];
                node.changeEventsEnabled  = false;
                node.x = originalNode.x;
                node.y = originalNode.y;
                node.changeEventsEnabled  = true;
                node.fireChange();
                // restore lines connected to node
                node.connections().forEach(function (connection) {
                    if (connection.isLine) {
                        var line = connection;
                        var originalLine = originalData[connection.oid];
                        line.changeEventsEnabled = false;
                        line.x1 = originalLine.x1;
                        line.y1 = originalLine.y1;
                        line.x2 = originalLine.x2;
                        line.y2 = originalLine.y2;
                        line.changeEventsEnabled  = true;
                        line.fireChange();
                    }
                });
            } else if (item.data.isLine) {
                var line = item.data;
                var originalLine = originalData[item.oid];
                line.changeEventsEnabled = false;
                line.x1 = originalLine.x1;
                line.y1 = originalLine.y1;
                line.x2 = originalLine.x2;
                line.y2 = originalLine.y2;
                line.changeEventsEnabled  = true;
                line.fireChange();
            } else {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }
        });
    };

    return that;
};

WIKIDIA.presenter.resizeNodeCommand = function (items) {
    "use strict";

    var that = {},
        originalData = [];

    // TODO: DRY: bulkCommand?
    items.forEach(function (item) {
        originalData[item.oid] = item.data.copyShallow();
    });

    that.dWidth = 0;
    that.dHeight = 0;

    that.preview = function () {
        that.execute();
    };

    that.cancelPreview = function () {
        that.undo();
    };

    that.execute = function () {
        items.forEach(function (item) {
            if (!item.data.isNode) {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }

            var node = item.data;
            var originalNode = originalData[item.oid];
            node.changeEventsEnabled  = false;
            node.width = originalNode.width + that.dWidth;
            node.height = originalNode.height + that.dHeight;
            node.changeEventsEnabled  = true;
            node.fireChange();
        });
    };

    that.undo = function () {
        items.forEach(function (item) {
            if (!item.data.isNode) {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }

            var node = item.data;
            var originalNode = originalData[item.oid];
            node.changeEventsEnabled  = false;
            node.width = originalNode.width;
            node.height = originalNode.height;
            node.changeEventsEnabled  = true;
            node.fireChange();
        });
    };

    return that;
};

WIKIDIA.presenter.createLineCommand = function (diagram, node, x1, y1) {
    "use strict";

    var that = {},
        line;

    function init() {
        that.x1 = x1;
        that.y1 = y1;
        that.x2 = x1;
        that.y2 = y1;

        line = WIKIDIA.model.line();
        diagram.addItem(line);
        that.connectTo(node);
    }

    that.connectTo = function (item) {
        console.log("Connecting line to node {nodeId}.".supplant({nodeId: item.oid}));
        line.addConnection(item);
    };

    that.preview = function () {
        that.execute();
    };

    that.cancelPreview = function () {
        that.undo();
    };

    that.execute = function () {
        line.changeEventsEnabled = false;
        line.x1 = that.x1;
        line.y1 = that.y1;
        line.x2 = that.x2;
        line.y2 = that.y2;
        line.changeEventsEnabled = true;
        line.fireChange();
    };

    that.undo = function () {
        // TODO:
        //diagram.removeItem(line);

    };

    init();

    return that;
};

// TODO: moveLinePointCommand