define(function(require) {
    "use strict";

    var view = require("view");
    var commands = require("presenter/commands");
    var renderers = require("presenter/renderers");
    var commandExec = require("presenter/commandExecutor");

    // TODO: for now nodeEditView is just a jQuery wrapper around textarea
    return function (diagramView, diagram, itemEditView) {
        var utils = require("utils");

        var GRID_STEP = 15;

        var that = {},
            commandExecutor,
            itemInfos = [],
            selection,
            commandInProgress,
            isCtrlKeyDown = false,
            isCreatingLineFromNode = true;

        // TODO: encapsulate items to object
        itemInfos.forView = function (view) {
            // TODO: optimize?
            var i;
            for (i = 0; i < this.length; i++) {
                if (this[i].view === view) {
                    return this[i];
                }
            }
            throw new Error("Item view not found.");
        };

        itemInfos.forItem = function (item) {
            var i;
            for (i = 0; i < this.length; i++) {
                if (this[i].item === item) {
                    return this[i];
                }
            }
            throw new Error("Item not found.");
        };

        itemInfos.remove = function (itemInfo) {
            var i = itemInfos.indexOf(itemInfo);
            itemInfos.splice(i, 1);
        };


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

            itemInfos.forEach(function (itemInfo) {
                updateItem(itemInfo);
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

                if (e.which === 46 && selection.itemInfos().length > 0) { // DEL
                    var deleteCommand = commands.deleteItemsCommand(diagram, selection.itemInfos());
                    commandExecutor.execute(deleteCommand);
                }

            });
        }

        function addNode(node) {
            var nodeView = view.nodeView(diagramView);

            var itemInfo = utils.objectWithId();
            itemInfo.item = node;
            itemInfo.view = nodeView;
            itemInfo.isSelected = false;

            itemInfos.push(itemInfo);

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

            return itemInfo;
        }

        function addLine(line) {
            var lineView = view.lineView(diagramView);

            var itemInfo = utils.objectWithId();
            itemInfo.item = line;
            itemInfo.view = lineView;
            itemInfo.isSelected = false;

            itemInfos.push(itemInfo);

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


            return itemInfo;
        }

        function updateItem(itemInfo) {
            var renderer = renderers.rendererForItem(itemInfo.item);
            renderer.render(itemInfo);
        }

        function onItemAdded(diagram, item) {
            if (item.isLine) {
                addLine(item);
            } else if (item.isNode) {
                addNode(item);
            } else {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.kind}));
            }
            updateItem(itemInfos.forItem(item));
        }

        function onItemRemoved(diagram, item) {
            var itemInfo = itemInfos.forItem(item);
            itemInfo.view.remove();
            itemInfos.remove(itemInfo);
        }

        function onNodeChange(node) {
            updateItem(itemInfos.forItem(node));
        }

        function onLineChange(line) {
            updateItem(itemInfos.forItem(line));
        }

        function onDiagramClick(view) {
            selection.clear();
        }

        function onItemMouseDown(view) {
            var itemInfo = itemInfos.forView(view);

            // simple selection is done on mouse-down, so I can just mouse-down an item and drag it immediately
            if (!isCtrlKeyDown) {
                if (!itemInfo.isSelected) {
                    selection.select(itemInfo);
                }
            }
        }

        function onItemClick(view) {
            var itemInfo = itemInfos.forView(view);

            // multiple selection is handled on-click, because I want to support this scenario:
            //      user ctrl-clicks on second item (adds it to multiple selection) and wants to drag it immediately
            if (isCtrlKeyDown) {
                selection.addOrRemove(itemInfo);
            }
        }

        function onItemDoubleClick(view) {

        }

        function onItemSelectionChange(item) {
            stopEditing();

            if (!selection.isMultiple() && item.isSelected) {
                itemEditView.val(item.item.text);
            } else {
                itemEditView.val("");
            }
        }

        function onItemEditViewFocus(e) {
            startEditing();
        }

        function onItemEditViewBlur(e) {
            stopEditing();
        }

        function onNodeDragStart(nodeView) {
            commandInProgress = commands.moveCommand(selection.itemInfos());
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
            commandInProgress = commands.resizeNodeCommand(selection.itemInfos());
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
            var node = itemInfos.forView(nodeView).item;
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
            var node = itemInfos.forView(nodeView).item;
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
            var itemInfo = itemInfos.forView(nodeView);
            var renderer = renderers.rendererForItem(itemInfo.item);
            if (!isCtrlKeyDown) {
                if (commandInProgress && commandInProgress.isMoveCommand) {
                    // TODO: temp fix - connection points show erratically when moving with translate optimization enabled
                    return;
                }
                renderer.showNearbyConnectionPoint(itemInfo.item, nodeView, x, y, GRID_STEP);
            }
        }

        function onLineConnectPointDragStart(lineView, connectPointX, connectPointY) {
            lineView.hideConnectionPoints();

            var line = itemInfos.forView(lineView).item;
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
            var line = itemInfos.forView(lineView).item;
            commandInProgress.itemToConnect = line.pointAt(connectPointX, connectPointY);
        }

        function onLineConnectPointDragEnd(lineView, dx, dy) {
            commandInProgress.cancelPreview();
            commandExecutor.execute(commandInProgress);
            commandInProgress = null;
        }

        function onLineMouseEnter(lineView) {
            if (!isCreatingLineFromNode) {
                var line = itemInfos.forView(lineView).item;
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
                if (selection.itemInfos().length === 1) {
                    commandInProgress = commands.editItemCommand(selection.itemInfos(0).item);
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
            var selectedItems = [];

            return {
                addOrRemove: function (itemInfo) {

                    if (itemInfo.isSelected) {
                        this.remove(itemInfo);
                    } else {
                        this.add(itemInfo);
                    }

                },

                add: function (itemInfo) {
                    selectedItems.push(itemInfo);
                    itemInfo.isSelected = true;
                    onItemSelectionChange(itemInfo);
                    updateItem(itemInfo);
                },

                remove: function (itemInfo) {
                    var i = selectedItems.indexOf(itemInfo);
                    selectedItems.splice(i, 1);
                    itemInfo.isSelected = false;
                    onItemSelectionChange(itemInfo);
                    updateItem(itemInfo);
                },

                select: function (itemInfos) {
                    this.clear();
                    if (Array.isArray(itemInfos)) {
                        var selectionThis = this;
                        itemInfos.forEach(function (itemInfo) {
                            selectionThis.add(itemInfo);
                        });
                    } else {
                        this.add(itemInfos);
                    }
                },

                clear: function () {
                    var itemInfo;
                    while ((itemInfo = selectedItems.pop())) {
                        itemInfo.isSelected = false;
                        onItemSelectionChange(itemInfo);
                        updateItem(itemInfo);
                    }
                },
                itemInfos: function (index) {
                    if (arguments.length === 0) {
                        return selectedItems.slice();
                    } else {
                        return selectedItems[index];
                    }
                },

                isMultiple: function () {
                    return selectedItems.length > 1;
                }
            };
        }
        that._test = {
            itemInfos: itemInfos
        };

        init();

        return that;

    };
});