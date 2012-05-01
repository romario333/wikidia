define(function(require) {
    "use strict";

    var model = require("model");

    /**
     * Fills nodes and points arrays from items. Makes sure that duplicate line points
     * are added only once.
     *
     * @param items
     * @param nodes
     * @param linePoints
     */
    function fillNodesAndPointsFromItems(nodes, linePoints, items) {
        items.forEach(function (item) {
            if (item.data.isNode) {
                var node = item.data;
                nodes.push(node);
                node.connections().forEach(function (connection) {
                    if (connection.isLinePoint) {
                        addLinePoint(connection);
                    }
                });
            } else if (item.data.isLine) {
                item.data.points().forEach(function (point) {
                    addLinePoint(point);
                });
            } else {
                throw new Error("Don't know how to handle this item.");
            }
        });

        function addLinePoint(point) {
            if (!linePoints[point.id]) {
                linePoints[point.id] = point;
            }
        }
    }

    return {
        moveCommand: function (items) {
            var that = {},
                lastPreviewDx = 0,
                lastPreviewDy = 0,
                nodes = [],
                linePoints = [];
            that.dx = 0;
            that.dy = 0;

            that.isMoveCommand = true;

            var previewMoveEnabled = true;

            fillNodesAndPointsFromItems(nodes, linePoints, items);

            that.preview = function () {
                if (previewMoveEnabled) {
                    previewMove();
                } else {
                    move(that.dx - lastPreviewDx, that.dy - lastPreviewDy);
                }
                lastPreviewDx = that.dx;
                lastPreviewDy = that.dy;
            };

            that.cancelPreview = function () {
                if (previewMoveEnabled) {
                    cancelPreviewMove();
                } else {
                    move(-that.dx, -that.dy);
                }

            };

            that.execute = function () {
                move(that.dx, that.dy);
            };

            that.undo = function () {
                move(-that.dx, -that.dy);
                return items;
            };

            function move(dx, dy) {
                nodes.forEach(function (node) {
                    node.changeEventsEnabled(false);
                    node.x += dx;
                    node.y += dy;
                    node.changeEventsEnabled(true);
                    node.fireChange();
                });

                updateLinePoints(dx, dy);
            }

            function updateLinePoints(dx, dy) {
                linePoints.forEach(function (point) {
                    point.line.changeEventsEnabled(false);
                    point.x += dx;
                    point.y += dy;
                    point.line.changeEventsEnabled(true);
                    point.line.fireChange();
                });
            }

            // TODO: I'm still not sure that I'll need this optimization
            function previewMove() {
                items.forEach(function (item) {
                    if (item.data.isNode) {
                        item.view.previewMove(that.dx, that.dy);
                    }
                });
                updateLinePoints(that.dx - lastPreviewDx, that.dy - lastPreviewDy);
            }


            function cancelPreviewMove() {
                items.forEach(function (item) {
                    if (item.data.isNode) {
                        item.view.cancelPreviewMove();
                    }
                });
                updateLinePoints(-that.dx, -that.dy);
            }

            return that;
        },

        resizeNodeCommand: function (items) {
            var that = {},
                lastDWidth = 0,
                lastDHeight = 0,
                nodes = [],
                linePoints = [];

            that.dWidth = 0;
            that.dHeight = 0;

            that.isResizeNodeCommand = true;

            fillNodesAndPointsFromItems(nodes, linePoints, items);

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
                return items;
            };

            function resize(dWidth, dHeight) {
                nodes.forEach(function (node) {
                    node.changeEventsEnabled(false);
                    node.width += dWidth;
                    node.height += dHeight;
                    node.changeEventsEnabled(true);
                    node.fireChange();
                });

                linePoints.forEach(function (point) {
                    point.line.changeEventsEnabled(false);
                    point.x += dWidth;
                    point.y += dHeight;
                    point.line.changeEventsEnabled(true);
                    point.line.fireChange();
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
                return [];
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

                // TODO: should return item with affected line
                return [];
            };

            function move(dx, dy) {
                point.line.changeEventsEnabled(false);
                point.x += dx;
                point.y += dy;
                point.line.changeEventsEnabled(true);
                point.line.fireChange();
            }

            return that;
        },

        editItemCommand: function (item) {
            var that = {},
                oldText = item.data.text;

            that.newText = oldText;
            that.isEditItemCommand = true;

            that.execute = function () {
                item.data.text = that.newText;
            };

            that.undo = function () {
                item.data.text = oldText;
                return [item];
            };

            that.hasChanged = function () {
                return that.newText !== item.data.text;
            };

            return that;
        },

        // TODO: suppress change event
        deleteItemsCommand: function (diagram, items) {
            var that = {},
                oldConnections = [];

            that.execute = function () {

                items.forEach(function (item) {
                    var data = item.data;
                    // backup connections of item we are going to delete (it will be disconnected when removed from diagram)
                    if (data.isLine) {
                        data.points().forEach(function (point) {
                            point.connections().forEach(function (connectedTo) {
                                oldConnections.push({from: point, to: connectedTo});
                            });
                        });
                    } else {
                        data.connections().forEach(function (connectedTo) {
                            oldConnections.push({from: data, to: connectedTo});
                        });
                    }

                    diagram.removeItem(data);
                });

            };

            that.undo = function () {
                // add items back to the diagram
                items.forEach(function (item) {
                    diagram.addItem(item.data);
                });
                // restore connections
                oldConnections.forEach(function (connection) {
                    connection.from.addConnection(connection.to);
                });

                return items;
            };

            return that;
        }
    };
});
