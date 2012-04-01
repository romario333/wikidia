var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.diagramPresenter = function (diagramView, diagram, viewFactory) {
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
        isCtrlKeyDown = false,
        isCreatingLineFromNode = true;

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
        diagramView.update();
        diagramView.click(onDiagramClick);

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
        var nodeView = viewFactory.nodeView(diagramView, node);

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
        var lineView = viewFactory.lineView(diagramView);

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
        var node = items.itemForView(nodeView).data;
        commandInProgress = WIKIDIA.presenter.createLineCommand(diagram, node, connectPointX, connectPointY);
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
        commandInProgress.connectTo(node);
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
        var renderer = renderers.forItem(node);
        renderer.showNearbyConnectionPoint(node.data, nodeView, x, y, GRID_STEP);
    }

    function onLineConnectPointDragStart(lineView, connectPointX, connectPointY) {
        lineView.hideConnectionPoints();

        var whichPoint;
        var line = items.itemForView(lineView).data;
        if (line.x1 === connectPointX && line.x2 === connectPointY) {
            whichPoint = "1";
        } else {
            whichPoint = "2";
        }

        commandInProgress = WIKIDIA.presenter.moveLinePointCommand(line, whichPoint);
    }

    function onLineConnectPointDragMove(lineView, dx, dy) {
        var snapped = snapToGrid({x: dx, y: dy});
        commandInProgress.dx = snapped.x;
        commandInProgress.dy = snapped.y;
        commandInProgress.preview();
    }

    function onLineConnectPointMouseUp(lineView, connectPointX, connectPointY) {
        var line = items.itemForView(lineView).data;
        commandInProgress.connectTo(line);
    }

    function onLineConnectPointDragEnd(lineView, dx, dy) {
        commandInProgress.cancelPreview();
        commandExecutor.execute(commandInProgress);
        commandInProgress = null;
    }

    function onLineMouseEnter(lineView) {
        if (!isCreatingLineFromNode) {
            var line = items.itemForView(lineView).data;
            lineView.showConnectionPoints([
                {x: line.x1, y: line.y1},
                {x: line.x2, y: line.y2}
            ]);
        }
    }

    function onLineMouseLeave(lineView) {
        if (!isCreatingLineFromNode) {
            lineView.hideConnectionPoints();
        }
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

    that._test = {
        items: items
    };

    init();

    return that;
};