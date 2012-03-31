var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.diagramPresenter = function (diagramView, diagram) {
    "use strict";

    var moveCommand = WIKIDIA.presenter.moveCommand;
    var resizeCommand = WIKIDIA.presenter.resizeCommand;

    var renderers = {
        node: WIKIDIA.presenter.nodeRenderer(),
        useCase: WIKIDIA.presenter.useCaseNodeRenderer(),
        line: WIKIDIA.presenter.lineRenderer(),
        forItem: function (item) {
            var kind = item.kind;
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
        itemToCreate;

    function init() {
        // TODO: should be at the top, so I can clearly see dependencies
        commandExecutor = WIKIDIA.presenter.commandExecutor();

        diagramView.gridStep = GRID_STEP;
        diagram.nodes().forEach(function (node) {
            addNode(node);
        });

        diagramView.update();

        items.forEach(function (item) {
            updateItem(item);
        });

        // TODO: pokus
        $(document.body).keydown(function (e) {
            if (e.ctrlKey === true && e.which === 90) {
                commandExecutor.undo();
            }
        });
    }

    function addNode(node) {
        // TODO: I should not pass node to view
        var nodeView = WIKIDIA.view.svg.nodeView(diagramView, node);

        var item = {
            data: node,
            view: nodeView
        };


        items.push(item);

        node.change(onNodeChange);

        // TODO: can be optimized (global DOM handler on diagram)
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

        var item = {
            data: line,
            view: lineView
        };

        // TODO: je fakt vyhodny mit nodes i lines v jedny items kolekci? davam to tam jen kvuli hunch
        items.push(item);

        line.change(onLineChange);

        lineView.mouseEnter(onLineMouseEnter);
        lineView.mouseLeave(onLineMouseLeave);
        lineView.connectPointDragStart(onLineConnectPointDragStart);
        lineView.connectPointDragMove(onLineConnectPointDragMove);
        lineView.connectPointDragEnd(onLineConnectPointDragEnd);
        lineView.connectPointMouseUp(onLineConnectPointMouseUp);


        return item;
    }

    function updateItem(item) {
        var renderer = renderers.forItem(item.data);
        renderer.render(item.data, item.view);
    }

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

    // TODO: weird
    function onNodeChange(node) {
        updateItem(items.itemForData(node));
    }

    function onLineChange(line) {
        updateItem(items.itemForData(line));
    }

    var dragStartX, dragStartY;

    function onNodeDragStart(nodeView) {
        var node = items.itemForView(nodeView).data;
        dragStartX = node.x;
        dragStartY = node.y;
    }

    function onNodeDragMove(nodeView, dx, dy) {
        var snapped = snapToGrid({x: dx, y: dy});
        nodeView.previewMove(snapped.x, snapped.y);
    }

    function onNodeDragEnd(nodeView, dx, dy) {
        // remove preview
        nodeView.previewMove(0, 0);
        // and update model
        var snapped = snapToGrid({x: dx, y: dy});

        var node = items.itemForView(nodeView).data;

        commandExecutor.execute(moveCommand(node, dragStartX + snapped.x, dragStartY + snapped.y));
    }

    var dragStartWidth, dragStartHeight;

    function onNodeResizeDragStart(nodeView) {
        var node = items.itemForView(nodeView).data;
        node.changeEventEnabled = false;
        dragStartWidth = node.width;
        dragStartHeight = node.height;
    }

    function onNodeResizeDragMove(nodeView, dx, dy) {
        var snapped = snapToGrid({width: dx, height: dy});
        var node = items.itemForView(nodeView).data; // TODO: pomale?

        node.width = dragStartWidth + snapped.width;
        node.height = dragStartHeight + snapped.height;
        node.fireChange();
    }

    function onNodeResizeDragEnd(nodeView, dx, dy) {
        var node = items.itemForView(nodeView).data;
        // restore original node size and create proper command
        node.width = dragStartWidth;
        node.height = dragStartHeight;
        node.changeEventEnabled = true;

        // and update model
        var snapped = snapToGrid({width: dx, height: dy});


        commandExecutor.execute(resizeCommand(node, dragStartWidth + snapped.width, dragStartHeight + snapped.height));

        // TODO: why does not mouseLeave fire?
        nodeView.hideResizeBorder();
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
        line.changeEventEnabled = false;
        // TODO: to by chtelo zapouzdrit
        itemToCreate = addLine(line);
        whichEndOfLine = "2";
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
        line.changeEventEnabled = true;
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
        var renderer = renderers.forItem(node.data);
        renderer.showNearbyConnectionPoint(node.data, nodeView, x, y, GRID_STEP);
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

        line.changeEventEnabled = false;
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
        line.changeEventEnabled = true;
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