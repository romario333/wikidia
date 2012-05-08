define(function(require) {
    "use strict";

    var model = require("model");

    /**
     * Fills nodes and points arrays from items. Makes sure that duplicate line points
     * are added only once.
     *
     * @param itemInfos
     * @param nodes
     * @param linePoints
     */
    function fillNodesAndLinePointsFromItemInfos(nodes, linePoints, itemInfos) {
        itemInfos.forEach(function (itemInfo) {
            if (itemInfo.item.isNode) {
                var node = itemInfo.item;
                nodes.push(node);
                node.connections().forEach(function (connection) {
                    if (connection.isLinePoint) {
                        addLinePoint(connection);
                    }
                });
            } else if (itemInfo.item.isLine) {
                itemInfo.item.points().forEach(function (point) {
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
        moveCommand: function (itemInfos) {
            var that = {},
                lastPreviewDx = 0,
                lastPreviewDy = 0;

            that.dx = 0;
            that.dy = 0;

            that.isMoveCommand = true;

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
                return itemInfos;
            };

            function move(dx, dy) {
                itemInfos.forEach(function (itemInfo) {
                    if (itemInfo.item.isNode) {
                        var node = itemInfo.item;
                        // position of connected lines will be updated automatically
                        node.moveTo(node.x + dx, node.y + dy);
                    }
                });
            }

            return that;
        },

        resizeNodeCommand: function (itemInfos) {
            var that = {},
                lastDWidth = 0,
                lastDHeight = 0;

            that.dWidth = 0;
            that.dHeight = 0;

            that.isResizeNodeCommand = true;

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
                return itemInfos;
            };

            function resize(dWidth, dHeight) {
                itemInfos.forEach(function (itemInfo) {
                    if (itemInfo.item.isNode) {
                        var node = itemInfo.item;
                        // position of connected lines will be updated automatically
                        node.resizeTo(node.width + dWidth, node.height + dHeight);
                    }
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
                oldText = item.text;

            that.newText = oldText;
            that.isEditItemCommand = true;

            that.execute = function () {
                item.text = that.newText;
            };

            that.undo = function () {
                item.text = oldText;
                return [item];
            };

            that.hasChanged = function () {
                return that.newText !== item.text;
            };

            return that;
        },

        // TODO: suppress change event
        deleteItemsCommand: function (diagram, itemInfos) {
            var that = {},
                oldConnections = [];

            that.execute = function () {

                itemInfos.forEach(function (itemInfo) {
                    var item = itemInfo.item;
                    // backup connections of item we are going to delete (it will be disconnected when removed from diagram)
                    if (item.isLine) {
                        item.points().forEach(function (point) {
                            point.connections().forEach(function (connectedTo) {
                                oldConnections.push({from: point, to: connectedTo});
                            });
                        });
                    } else {
                        item.connections().forEach(function (connectedTo) {
                            oldConnections.push({from: item, to: connectedTo});
                        });
                    }

                    diagram.removeItem(item);
                });

            };

            that.undo = function () {
                // add items back to the diagram
                itemInfos.forEach(function (item) {
                    diagram.addItem(item.item);
                });
                // restore connections
                oldConnections.forEach(function (connection) {
                    connection.from.addConnection(connection.to);
                });

                return itemInfos;
            };

            return that;
        }
    };
});
