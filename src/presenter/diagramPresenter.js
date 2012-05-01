define(function(require) {
    "use strict";

    var view = require("view");
    var commands = require("presenter/commands");
    var renderers = require("presenter/renderers");
    var commandExec = require("presenter/commandExecutor");

    // TODO: for now nodeEditView is just a jQuery wrapper around textarea
    return function (diagramView, diagram, itemEditView) {
        var utils = require("utils");

        var itemRenderers = {
            node: renderers.nodeRenderer(),
            useCase: renderers.useCaseNodeRenderer(),
            line: renderers.lineRenderer(),
            forItem: function (item) {
                var kind = item.data.kind;
                if (!this[kind]) {
                    throw new Error("Unknown kind '{kind}'".supplant({kind: kind}));
                }
                return this[kind];
            }
        };


        var GRID_STEP = 15;

        var that = {},
            commandExecutor,
            items = [],
            selection,
            commandInProgress,
            isCtrlKeyDown = false,
            isCreatingLineFromNode = true;

        function init() {
            // TODO: popsat zakladni filozofii:
            // 1) podle modelu se postavi views
            // 2) veskere dalsi manipulace s views by se mela delat pokud mozno pres model pomoci observeru
            //      (ale snazim se minimalizovat pocet observeru, v tuhle chvili je to snad jen diagramPresenter)

            commandExecutor = commandExec();

            diagramView.gridStep = GRID_STEP;
            diagramView.update();
            diagramView.click(onDiagramClick);

            diagram.items().forEach(function (item) {
                if (item.isNode) {
                    addNode(item);
                } else if (item.isLine) {
                    addLine(item);
                } else {
                    throw new Error("Don't know what this item is: " + item.kind);
                }

            });


            diagram.itemAdded(onItemAdded);
            diagram.itemRemoved(onItemRemoved);

            itemEditView.focus(onItemEditViewFocus);
            itemEditView.blur(onItemEditViewBlur);

            items.forEach(function (item) {
                updateItem(item);
            });

            selection = multipleSelection();

            $(document).keydown(function (e) {
                if (e.which === 17) {  // FIXME: e.ctrlKey does not work here
                    isCtrlKeyDown = true;
                }
            });

            $(document).keyup(function (e) {
                if (e.ctrlKey) {
                    isCtrlKeyDown = false;
                }

                if (e.ctrlKey === true && e.which === 90) {
                    var affectedItems = commandExecutor.undo();
                    selection.select(affectedItems);
                }

                if (e.which === 46 && selection.items().length > 0) { // DEL
                    var deleteCommand = commands.deleteItemsCommand(diagram, selection.items());
                    commandExecutor.execute(deleteCommand);
                }

            });
        }

        function addNode(node) {
            var nodeView = view.nodeView(diagramView);

            var item = utils.objectWithId();
            item.data = node;
            item.view = nodeView;
            item.isSelected = false;

            items.push(item);

            node.change(onNodeChange);

            // TODO: can be optimized (global DOM handler on diagram)
            nodeView.mouseDown(onItemMouseDown);
            nodeView.click(onItemClick);
            nodeView.doubleClick(onItemDoubleClick);
            nodeView.dragStart(onNodeDragStart);
            nodeView.dragMove(onNodeDragMove);
            nodeView.dragEnd(onNodeDragEnd);
            nodeView.resizeDragStart(onNodeResizeDragStart);
            nodeView.resizeDragMove(onNodeResizeDragMove);
            nodeView.resizeDragEnd(onNodeResizeDragEnd);
            nodeView.connectPointDragStart(onNodeConnectPointDragStart);
            nodeView.connectPointDragMove(onNodeConnectPointDragMove);
            nodeView.connectPointDragEnd(onNodeConnectPointDragEnd);
            nodeView.connectPointMouseUp(onNodeConnectPointMouseUp);

            nodeView.mouseEnter(onNodeMouseEnter);
            nodeView.mouseLeave(onNodeMouseLeave);
            nodeView.mouseMove(onNodeMouseMove);

            return item;
        }

        function addLine(line) {
            var lineView = view.lineView(diagramView);

            var item = utils.objectWithId();
            item.data = line;
            item.view = lineView;
            item.isSelected = false;

            items.push(item);

            line.change(onLineChange);

            lineView.mouseDown(onItemMouseDown);
            lineView.click(onItemClick);
            lineView.doubleClick(onItemDoubleClick);
            lineView.mouseEnter(onLineMouseEnter);
            lineView.mouseLeave(onLineMouseLeave);
            lineView.connectPointDragStart(onLineConnectPointDragStart);
            lineView.connectPointDragMove(onLineConnectPointDragMove);
            lineView.connectPointDragEnd(onLineConnectPointDragEnd);
            lineView.connectPointMouseUp(onLineConnectPointMouseUp);


            return item;
        }

        function updateItem(item) {
            var renderer = itemRenderers.forItem(item);
            renderer.render(item);
        }

        // TODO: encapsulate items to object
        items.itemForView = function (view) {
            // TODO: optimize?
            var i;
            for (i = 0; i < this.length; i++) {
                if (this[i].view === view) {
                    return this[i];
                }
            }
            throw new Error("Item view not found.");
        };

        items.itemForData = function (data) {
            var i;
            for (i = 0; i < this.length; i++) {
                if (this[i].data === data) {
                    return this[i];
                }
            }
            throw new Error("Item not found.");
        };

        items.remove = function (item) {
            var i = items.indexOf(item);
            items.splice(i, 1);
        };

        function onItemAdded(diagram, data) {
            if (data.isLine) {
                addLine(data);
            } else if (data.isNode) {
                addNode(data);
            } else {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: data.kind}));
            }
            updateItem(items.itemForData(data));
        }

        function onItemRemoved(diagram, data) {
            var item = items.itemForData(data);
            item.view.remove();
            items.remove(item);
        }

        function onNodeChange(node) {
            updateItem(items.itemForData(node));
        }

        function onLineChange(line) {
            updateItem(items.itemForData(line));
        }

        function onDiagramClick(view) {
            selection.clear();
        }

        function onItemMouseDown(view) {
            var item = items.itemForView(view);

            // simple selection is done on mouse-down, so I can just mouse-down an item and drag it immediately
            if (!isCtrlKeyDown) {
                if (!item.isSelected) {
                    selection.select(item);
                }
            }
        }

        function onItemClick(view) {
            var item = items.itemForView(view);

            // multiple selection is handled on-click, because I want to support this scenario:
            //      user ctrl-clicks on second item (adds it to multiple selection) and wants to drag it immediately
            if (isCtrlKeyDown) {
                selection.addOrRemove(item);
            }
        }

        function onItemDoubleClick(view) {

        }

        function onItemSelectionChange(item) {
            console.log("onItemSelectionChange");
            stopEditing();

            if (!selection.isMultiple() && item.isSelected) {
                itemEditView.val(item.data.text);
            } else {
                itemEditView.val("");
            }
        }

        function onItemEditViewFocus(e) {
            console.log("onItemEditViewFocus");
            startEditing();
        }

        function onItemEditViewBlur(e) {
            console.log("onItemEditViewBlur");
            stopEditing();
        }

        function onNodeDragStart(nodeView) {
            commandInProgress = commands.moveCommand(selection.items());
        }

        function onNodeDragMove(nodeView, dx, dy) {
            var snapped = snapToGrid({x: dx, y: dy});
            commandInProgress.dx = snapped.x;
            commandInProgress.dy = snapped.y;
            commandInProgress.preview();
        }

        function onNodeDragEnd(nodeView, dx, dy) {
            commandInProgress.cancelPreview();
            var snapped = snapToGrid({x: dx, y: dy});
            commandInProgress.dx = snapped.x;
            commandInProgress.dy = snapped.y;
            commandExecutor.execute(commandInProgress);
            commandInProgress = null;
        }

        function onNodeResizeDragStart(nodeView) {
            commandInProgress = commands.resizeNodeCommand(selection.items());
        }

        function onNodeResizeDragMove(nodeView, dx, dy) {
            var snapped = snapToGrid({x: dx, y: dy});
            commandInProgress.dWidth = snapped.x;
            commandInProgress.dHeight = snapped.y;
            commandInProgress.preview();
        }

        function onNodeResizeDragEnd(nodeView, dx, dy) {
            commandInProgress.cancelPreview();
            var snapped = snapToGrid({x: dx, y: dy});
            commandInProgress.dWidth = snapped.x;
            commandInProgress.dHeight = snapped.y;
            commandExecutor.execute(commandInProgress);
            commandInProgress = null;

            // TODO: why does not mouseLeave fire?
            //nodeView.hideResizeBorder();
        }

        function onNodeConnectPointDragStart(nodeView, connectPointX, connectPointY) {
            var node = items.itemForView(nodeView).data;
            commandInProgress = commands.createLineCommand(diagram, node, connectPointX, connectPointY);
            isCreatingLineFromNode = true;
        }

        function onNodeConnectPointDragMove(nodeView, dx, dy) {
            var snapped = snapToGrid({x: dx, y: dy});
            commandInProgress.x2 = commandInProgress.x1 + snapped.x;
            commandInProgress.y2 = commandInProgress.y1 + snapped.y;
            commandInProgress.preview();
        }

        function onNodeConnectPointMouseUp(nodeView, connectPointX, connectPointY) {
            // TODO: musi bezet pred onNodeConnectPointDragEnd, jak to vynutit nebo testovat?
            var node = items.itemForView(nodeView).data;
            commandInProgress.itemToConnect = node;
            commandInProgress.x2 = connectPointX;
            commandInProgress.y2 = connectPointY;
        }

        // TODO: tady se mi dx a dy v dragEnd uplne nehodi, muzu se spolehnout, ze dostanu dragMove s finalni souradnici?
        function onNodeConnectPointDragEnd(nodeView, dx, dy) {
            commandInProgress.cancelPreview();
            commandExecutor.execute(commandInProgress);
            commandInProgress = null;
            isCreatingLineFromNode = false;
        }

        function onNodeMouseEnter(nodeView) {
            if (isCtrlKeyDown) {
                nodeView.showResizeBorder();
            }
        }

        function onNodeMouseLeave(nodeView) {
            nodeView.hideResizeBorder();
            nodeView.hideConnectionPoints();
        }

        function onNodeMouseMove(nodeView, x, y) {
            var node = items.itemForView(nodeView);
            var renderer = itemRenderers.forItem(node);
            if (!isCtrlKeyDown) {
                if (commandInProgress && commandInProgress.isMoveCommand) {
                    // TODO: temp fix - connection points show erratically when moving with translate optimization enabled
                    return;
                }
                renderer.showNearbyConnectionPoint(node.data, nodeView, x, y, GRID_STEP);
            }
        }

        function onLineConnectPointDragStart(lineView, connectPointX, connectPointY) {
            lineView.hideConnectionPoints();

            var line = items.itemForView(lineView).data;
            var point = line.pointAt(connectPointX, connectPointY);
            commandInProgress = commands.moveLinePointCommand(point);
        }

        function onLineConnectPointDragMove(lineView, dx, dy) {
            var snapped = snapToGrid({x: dx, y: dy});
            commandInProgress.dx = snapped.x;
            commandInProgress.dy = snapped.y;
            commandInProgress.preview();
        }

        function onLineConnectPointMouseUp(lineView, connectPointX, connectPointY) {
            var line = items.itemForView(lineView).data;
            commandInProgress.itemToConnect = line.pointAt(connectPointX, connectPointY);
        }

        function onLineConnectPointDragEnd(lineView, dx, dy) {
            commandInProgress.cancelPreview();
            commandExecutor.execute(commandInProgress);
            commandInProgress = null;
        }

        function onLineMouseEnter(lineView) {
            if (!isCreatingLineFromNode) {
                var line = items.itemForView(lineView).data;
                lineView.showConnectionPoints(line.points());
            }
        }

        function onLineMouseLeave(lineView) {
            if (!isCreatingLineFromNode) {
                lineView.hideConnectionPoints();
            }
        }

        function startEditing() {
            if (commandInProgress && !commandInProgress.isEditItemCommand) {
                // some other command in progress, throw it away, we're going to edit now
                commandInProgress = null;
            }

            if (!commandInProgress) {
                if (selection.items().length === 1) {
                    commandInProgress = commands.editItemCommand(selection.items(0));
                }
            }
        }

        function stopEditing() {
            if (commandInProgress && commandInProgress.isEditItemCommand) {
                commandInProgress.newText = itemEditView.val();
                if (commandInProgress.hasChanged()) {
                    commandExecutor.execute(commandInProgress);
                    commandInProgress = null;
                }
            }
        }

        /**
         * Snaps specified point (or rect) to the diagram's grid and returns it.
         *
         * @param pointOrRect
         */
        function snapToGrid(pointOrRect) {
            var snapCoordinateToGrid = function (c, gridStep) {
                var c1 = Math.floor(c / gridStep) * gridStep;
                var c2 = c1 + gridStep;
                if (Math.abs(c - c2) < Math.abs(c - c1)) {
                    return c2;
                } else {
                    return c1;
                }
            };

            pointOrRect.x = snapCoordinateToGrid(pointOrRect.x, GRID_STEP);
            pointOrRect.y = snapCoordinateToGrid(pointOrRect.y, GRID_STEP);
            if (pointOrRect.width) {
                pointOrRect.width = snapCoordinateToGrid(pointOrRect.width, GRID_STEP);
            }
            if (pointOrRect.height) {
                pointOrRect.height = snapCoordinateToGrid(pointOrRect.height, GRID_STEP);
            }

            return pointOrRect;
        }

        function multipleSelection() {
            var items = [];

            return {
                addOrRemove: function (item) {

                    if (item.isSelected) {
                        this.remove(item);
                    } else {
                        this.add(item);
                    }

                },

                add: function (item) {
                    items.push(item);
                    item.isSelected = true;
                    onItemSelectionChange(item);
                    updateItem(item);
                },

                remove: function (item) {
                    var i = items.indexOf(item);
                    items.splice(i, 1);
                    item.isSelected = false;
                    onItemSelectionChange(item);
                    updateItem(item);
                },

                select: function (items) {
                    this.clear();
                    if (Array.isArray(items)) {
                        var selectionThis = this;
                        items.forEach(function (item) {
                            selectionThis.add(item);
                        });
                    } else {
                        this.add(items);
                    }
                },

                clear: function () {
                    var selected;
                    while ((selected = items.pop())) {
                        selected.isSelected = false;
                        onItemSelectionChange(selected);
                        updateItem(selected);
                    }
                },
                items: function (index) {
                    if (arguments.length === 0) {
                        return items.slice();
                    } else {
                        return items[index];
                    }
                },

                isMultiple: function () {
                    return items.length > 1;
                }
            };
        }
        that._test = {
            items: items
        };

        init();

        return that;

    };
});