var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.diagramPresenter = function (diagramView, diagram) {
    "use strict";

    var moveCommand = WIKIDIA.presenter.moveCommand;
    var resizeCommand = WIKIDIA.presenter.resizeCommand;

    var GRID_STEP = 10;



    var that = {},
        commandExecutor,
        items = [],
        nodeRendererMap;

    function init() {
        // TODO: should be at the top, so I can clearly see dependencies
        createRendererMap();

        commandExecutor = WIKIDIA.presenter.commandExecutor();

        diagramView.gridStep = GRID_STEP;
        diagram.nodes().forEach(function (node) {
            addItem(node);
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

    function addItem(item) {
        var nodeView = WIKIDIA.view.svg.nodeView(diagramView, item);

        items.push({
            data: item,
            view: nodeView
        });

        item.change(onNodeChange);

        // TODO: can be optimized (global DOM handler on diagram)
        nodeView.dragStart(onNodeDragStart);
        nodeView.dragMove(onNodeDragMove);
        nodeView.dragEnd(onNodeDragEnd);
        nodeView.resizeDragStart(onNodeResizeDragStart);
        nodeView.resizeDragMove(onNodeResizeDragMove);
        nodeView.resizeDragEnd(onNodeResizeDragEnd);
    }

    function updateItem(node) {
        var renderer = nodeRendererMap[node.kind];
        if (!renderer) {
            renderer = nodeRendererMap.default;
        }
        renderer.render(node.data, node.view);
    }

    items.itemForView = function (view) {
        // TODO: optimize?
        var i;
        for (i = 0; i < this.length; i++) {
            if (this[i].view === view) {
                return this[i];
            }
        }
        throw new Error("Node view not found.");
    };

    items.itemForData = function (data) {
        var i;
        for (i = 0; i < this.length; i++) {
            if (this[i].data === data) {
                return this[i];
            }
        }
        throw new Error("Node not found.");
    };

    function createRendererMap() {
        nodeRendererMap = {
            default: WIKIDIA.presenter.nodeRenderer()
        };
    }

    function onNodeChange(node) {
        // TODO: spatne, rethink
        updateItem(items.itemForData(node));
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

        //TODO:
        commandExecutor.execute(resizeCommand(node, dragStartWidth + snapped.width, dragStartHeight + snapped.height));
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