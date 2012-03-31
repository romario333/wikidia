var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.diagramPresenter = function (diagramView, diagram) {
    "use strict";

    var utils = WIKIDIA.utils;

    var renderers = {
        node: WIKIDIA.presenter.nodeRenderer(),
        useCase: WIKIDIA.presenter.useCaseNodeRenderer(),
        line: WIKIDIA.presenter.lineRenderer(),
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
        itemToCreate,
        isCtrlKeyDown = false;

    function multipleSelection() {
        var that = {};
        var items = [];

        that.addOrRemove = function (item) {

            if (item.isSelected) {
                that.remove(item);
            } else {
                that.add(item);
            }

        };

        that.add = function (item) {
            items.push(item);
            item.isSelected = true;
            updateItem(item);
        };

        that.remove = function (item) {
            var i = items.indexOf(item);
            items.splice(i, 1);
            item.isSelected = false;
            updateItem(item);
        };

        that.select = function (item) {
            var selected;
            while ((selected = items.pop())) {
                selected.isSelected = false;
                updateItem(selected);
            }
            that.add(item);
        };

        that.items = function () {
            return items;
        };
        return that;
    }

    function init() {
        // TODO: popsat zakladni filozofii:
        // 1) podle modelu se postavi views
        // 2) veskere dalsi manipulace s views by se mela delat pokud mozno pres model pomoci observeru
        //      (ale snazim se minimalizovat pocet observeru, v tuhle chvili je to snad jen diagramPresenter)

        // TODO: should be at the top, so I can clearly see dependencies
        commandExecutor = WIKIDIA.presenter.commandExecutor();

        diagramView.gridStep = GRID_STEP;
        diagram.items().forEach(function (item) {
            if (item.isNode) {
                addNode(item);
            } else if (item.isLine) {
                addLine(item);
            } else {
                // TODO: tady trochu boli, ze nemam class
                throw new Error("Don't know what this item is: " + item.kind);
            }

        });

        diagramView.update();

        diagramView.click(onDiagramClick);

        diagram.itemAdded(onItemAdded);
        diagram.itemRemoved(onItemRemoved);

        items.forEach(function (item) {
            updateItem(item);
        });

        selection = multipleSelection();

        $(document).keydown(function (e) {
            if (e.which === 17) {  // TODO: e.ctrlKey does not work here
                isCtrlKeyDown = true;
            }
        });

        $(document).keyup(function (e) {
            if (e.ctrlKey) {
                isCtrlKeyDown = false;
            }

            if (e.ctrlKey === true && e.which === 90) {
                commandExecutor.undo();
            }
        });
    }

    function addNode(node) {
        // TODO: I should not pass node to view
        var nodeView = WIKIDIA.view.svg.nodeView(diagramView, node);

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
        var lineView = WIKIDIA.view.svg.lineView(diagramView);

        var item = utils.objectWithId();
        item.data = line;
        item.view = lineView;
        item.isSelected = false;

        // TODO: je fakt vyhodny mit nodes i lines v jedny items kolekci? davam to tam jen kvuli hunch
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
        var renderer = renderers.forItem(item);
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

    function onItemAdded(diagram, item) {
        if (item.isLine) {
            addLine(item);
        } else if (item.isNode) {
            addNode(item);
        } else {
            throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.kind}));
        }
    }

    function onItemRemoved(diagram, item) {
        // TODO: remove view from diagramView
    }

    // TODO: weird
    function onNodeChange(node) {
        updateItem(items.itemForData(node));
    }

    function onLineChange(line) {
        updateItem(items.itemForData(line));
    }

    function onDiagramClick(view) {
        console.dir(view);
        console.log("diagram click");
    }

    function onItemMouseDown(view) {
        var item = items.itemForView(view);

        if (!isCtrlKeyDown) {
            selection.select(item);
        }
    }

    function onItemClick(view) {
        // TODO: think about this
        // on click, when I do this in mousedown, I can't properly resize multiple nodes
        var item = items.itemForView(view);
        if (isCtrlKeyDown) {
            selection.addOrRemove(item);
        }

    }

    function onItemDoubleClick(view) {

    }

    var dragStartX, dragStartY;

    function onNodeDragStart(nodeView) {
        commandInProgress = WIKIDIA.presenter.moveCommand(selection.items());
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

    // TODO: delete
    var dragStartWidth, dragStartHeight;

    function onNodeResizeDragStart(nodeView) {
        commandInProgress = WIKIDIA.presenter.resizeNodeCommand(selection.items());
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
        dragStartX = connectPointX;
        dragStartY = connectPointY;

        var line = WIKIDIA.model.line({
            x1: connectPointX,
            y1: connectPointY,
            x2: connectPointX,
            y2: connectPointY
        });
        diagram.addItem(line);

        var node = items.itemForView(nodeView);
        node.addConnection(line);

        line.changeEventsEnabled = false;
        // TODO: to by chtelo zapouzdrit
        itemToCreate = addLine(line);
        whichEndOfLine = "2";

        // TODO: neni hotove
    }

    function onNodeConnectPointDragMove(nodeView, dx, dy) {
        onLineConnectPointDragMove(itemToCreate.view, dx, dy);
    }

    function onNodeConnectPointMouseUp(nodeView, connectPointX, connectPointY) {
        if (itemToCreate) {
            var line = itemToCreate.data;
            line.x2 = connectPointX;
            line.y2 = connectPointY;
        }
    }

    function onNodeConnectPointDragEnd(nodeView, dx, dy) {
        var line = itemToCreate.data;
        line.changeEventsEnabled = true;
        itemToCreate = undefined;
    }

    function onNodeMouseEnter(nodeView) {
        nodeView.showResizeBorder();

    }

    function onNodeMouseLeave(nodeView) {
        nodeView.hideResizeBorder();
        nodeView.hideConnectionPoints();
    }

    function onNodeMouseMove(nodeView, x, y) {
        var node = items.itemForView(nodeView);
        var renderer = renderers.forItem(node);
        if (isCtrlKeyDown) {
            renderer.showNearbyConnectionPoint(node.data, nodeView, x, y, GRID_STEP);
        } else {
            nodeView.hideConnectionPoints();
        }

    }

    var whichEndOfLine; // TODO: to the top

    function onLineConnectPointDragStart(lineView, connectPointX, connectPointY) {
        // TODO: dragStartX uz nic moc nazev ted kdyz to pouzivam i tady
        dragStartX = connectPointX;
        dragStartY = connectPointY;

        lineView.hideConnectionPoints();

        var line = items.itemForView(lineView);
        if (line.x1 === connectPointX && line.x2 === connectPointY) {
            whichEndOfLine = "1";
        } else {
            whichEndOfLine = "2";
        }

        line.changeEventsEnabled = false;
    }

    function onLineConnectPointDragMove(lineView, dx, dy) {
        var line = items.itemForView(lineView).data;
        var snapped = snapToGrid({x: dragStartX + dx, y: dragStartY + dy});
        console.log("in = [{x}, {y}], snapped = [{sx}, {sy}]".supplant({x: dragStartX + dx, y: dragStartY + dy, sx: snapped.x, sy: snapped.y}));
        console.dir(line);
        line["x" + whichEndOfLine] = snapped.x;
        line["y" + whichEndOfLine] = snapped.y;
        line.fireChange();
    }

    function onLineConnectPointMouseUp(lineView, connectPointX, connectPointY) {
    }

    function onLineConnectPointDragEnd(lineView, dx, dy) {
        var line = items.itemForView(lineView);
        line.changeEventsEnabled = true;
    }

    function onLineMouseEnter(lineView) {
        var line = items.itemForView(lineView).data;
        lineView.showConnectionPoints([
            {x: line.x1, y: line.y1},
            {x: line.x2, y: line.y2}
        ]);
    }

    function onLineMouseLeave(lineView) {
        lineView.hideConnectionPoints();
    }

    /**
     * Snaps specified point (or rect) to the diagram's grid and returns it.
     *
     * @param pointOrRect
     */
    function snapToGrid(pointOrRect) {
        var snapCoordinateToGrid = function (c, gridStep) {
            // TODO: je to spatne, obcas skoci pryc
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



    init();

    return that;
};