define(function(require) {
    "use strict";

    var model = require("model");

    return {
        moveCommand: function (items) {
            var that = {},
                lastPreviewDx = 0,
                lastPreviewDy = 0;
            that.dx = 0;
            that.dy = 0;

            that.preview = function () {
                move(that.dx - lastPreviewDx, that.dy - lastPreviewDy);
                lastPreviewDx = that.dx;
                lastPreviewDy = that.dy;
            };

            that.cancelPreview = function () {
                move(-that.dx, -that.dy);
            };

            that.execute = function () {
                move(that.dx, that.dy);
            };

            that.undo = function () {
                move(-that.dx, -that.dy);
            };

            function move(dx, dy) {
                console.log("move {dx}, {dy}".supplant({dx: dx, dy: dy}));
                items.forEach(function (item) {
                    if (item.data.isNode) {
                        var node = item.data;
                        node.changeEventsEnabled(false);
                        node.x += dx;
                        node.y += dy;
                        node.changeEventsEnabled(true);
                        node.fireChange();

                        // TODO: I will have to do the same for resize command
                        // update lines connected to node
                        node.connections().forEach(function (connection) {
                            if (connection.isLinePoint) {
                                // update line to match new node position
                                var point = connection;
                                point.line.changeEventsEnabled(false);
                                point.x += dx;
                                point.y += dy;
                                point.line.changeEventsEnabled(true);
                                point.line.fireChange();
                            }
                        });


                    } else if (item.data.isLine) {
                        var line = item.data;
                        line.changeEventsEnabled(false);
                        line.points().forEach(function (point) {
                            point.x += dx;
                            point.y += dy;
                        });
                        line.changeEventsEnabled(true);
                        line.fireChange();
                    } else {
                        throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
                    }
                });
            }


            return that;
        },

        resizeNodeCommand: function (items) {
            var that = {},
                lastDWidth = 0,
                lastDHeight = 0;

            that.dWidth = 0;
            that.dHeight = 0;

            that.preview = function () {
                resize(that.dWidth - lastDWidth, that.dHeight - lastDHeight);
                lastDWidth = that.dWidth;
                lastDHeight = that.dHeight;
            };

            that.cancelPreview = function () {
                resize(-that.dWidth, -that.dHeight);
            };

            that.execute = function () {
                resize(that.dWidth, that.dHeight);
            };

            that.undo = function () {
                resize(-that.dWidth, -that.dHeight);
            };

            function resize(dWidth, dHeight) {
                items.forEach(function (item) {
                    if (!item.data.isNode) {
                        throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
                    }

                    var node = item.data;
                    node.changeEventsEnabled(false);
                    node.width += dWidth;
                    node.height += dHeight;
                    node.changeEventsEnabled(true);
                    node.fireChange();
                });
            }

            return that;
        },

        createLineCommand: function (diagram, node, x1, y1) {
            var that = {},
                line;

            that.x1 = x1;
            that.y1 = y1;
            that.x2 = x1;
            that.y2 = y1;
            that.itemToConnect = null;

            line = model.line();
            diagram.addItem(line);

            that.preview = function () {
                line.changeEventsEnabled(false);
                line.points(0).x = that.x1;
                line.points(0).y = that.y1;
                line.points(1).x = that.x2;
                line.points(1).y = that.y2;
                line.changeEventsEnabled(true);
                line.fireChange();
            };

            that.cancelPreview = function () {
            };

            that.execute = function () {
                line.changeEventsEnabled(false);
                line.points(0).x = that.x1;
                line.points(0).y = that.y1;
                line.points(1).x = that.x2;
                line.points(1).y = that.y2;

                // connect starting point of the line to the node from which it was created by dragging
                line.points(0).addConnection(node);
                // if end point was provided, connect line to it too
                if (that.itemToConnect) {
                    line.points(1).addConnection(that.itemToConnect);
                }

                line.changeEventsEnabled(true);
                line.fireChange();
            };

            that.undo = function () {
                // TODO:
                //diagram.removeItem(line);
                // TODO: I should remove connections (or they should ideally remove automatically)
            };

            return that;
        },

        moveLinePointCommand: function (point) {
            var that = {},
                lastPreviewDx = 0,
                lastPreviewDy = 0,
                wasConnectedToItem;

            that.dx = 0;
            that.dy = 0;
            that.connectToItem = null;


            // I'm assuming that point can have only one connection at a time
            if (point.connections().length > 1) {
                // TODO: if this is true then I should have this invariant in point#addConnection
                throw new Error("More that one connection on point '{id}'.".supplant(point));
            }

            if (point.connections().length === 1) {
                wasConnectedToItem = point.connections(0);
            }

            that.preview = function () {
                move(that.dx - lastPreviewDx, that.dy - lastPreviewDy);
                lastPreviewDx = that.dx;
                lastPreviewDy = that.dy;
            };

            that.cancelPreview = function () {
                move(-that.dx, -that.dy);
            };

            that.execute = function () {
                move(that.dx, that.dy);

                // update connections
                point.line.changeEventsEnabled(false);

                if (wasConnectedToItem) {
                    point.removeConnection(wasConnectedToItem);
                }
                if (that.connectToItem) {
                    point.addConnection(that.connectToItem);
                }

                point.line.changeEventsEnabled(true);
                point.line.fireChange();
            };

            that.undo = function () {
                move(-that.dx, -that.dy);

                // restore connections
                point.line.changeEventsEnabled(false);

                if (wasConnectedToItem) {
                    point.addConnection(wasConnectedToItem);
                }
                if (that.connectToItem) {
                    point.removeConnection(that.connectToItem);
                }

                point.line.changeEventsEnabled(true);
                point.line.fireChange();

            };

            function move(dx, dy) {
                point.line.changeEventsEnabled(false);
                point.x += dx;
                point.y += dy;
                point.line.changeEventsEnabled(true);
                point.line.fireChange();
            }

            return that;
        }
    };
});
