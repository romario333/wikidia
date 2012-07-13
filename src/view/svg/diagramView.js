define(function(require) {
    "use strict";

    return function (rootView) {

        var parent = require("./viewBase");
        var svgHelper = require("./svgHelper");
        var dragEventHandler = require("./dragEventHandler");

        // TODO: view.createElement vs svgHelper.createSvgElement + is out of init because of parent(element) call, which sucks
        var diagramElement = rootView.createElement("g", {class: "diagram"});
        eventBox = svgHelper.createSvgElement("rect", {class: "eventBox", opacity: 0, fill: "blue", width: "100%", height: "100%"});
        diagramElement.append(eventBox);
        grid = svgHelper.createSvgElement("g", {class: "grid"});
        diagramElement.append(grid);
        var viewPort = svgHelper.createSvgElement("g", {class: "viewPort"});
        diagramElement.append(viewPort);
        var that = parent(viewPort);
        var eventBox, grid;
        var onDragStart, onDragMove, onDragEnd;

        function init() {

            // disable text selection (it collides with diagram manipulation)
            diagramElement.css("-webkit-user-select", "none");
            diagramElement.css("-khtml-user-select", "none");
            diagramElement.css("-o-user-select", "none");
            diagramElement.css("user-select", "none");

            var dragHandler = dragEventHandler(diagramElement);
            dragHandler.dragStart(function (e, dragInfo) {
                if (onDragStart) {
                    onDragStart(that);
                }
            });
            dragHandler.dragMove(function (e, dragInfo) {
                if (onDragMove) {
                    onDragMove(that, dragInfo.dx, dragInfo.dy);
                }
            });
            dragHandler.dragEnd(function (e, dragInfo) {
                if (onDragEnd) {
                    onDragEnd(that, dragInfo.dx, dragInfo.dy);
                }
            });
        }

        /**
         * Step between lines in grid. 0 means disabled.
         */
        that.gridStep = 0;

        that.update = function () {
            // draw grid
            grid.empty();
            if (that.gridStep !== 0) {
                var diagramWidth = rootView.containerWidth();
                var diagramHeight = rootView.containerHeight();
                var x, y, line;
                for (x = 0; x < diagramWidth; x += that.gridStep) {
                    line = svgHelper.createSvgElement("line", {x1: x, y1: 0, x2: x, y2: diagramHeight, stroke: "blue", opacity: 0.5});
                    grid.append(line);
                }
                for (y = 0; y < diagramHeight; y += that.gridStep) {
                    line = svgHelper.createSvgElement("line", {x1: 0, y1: y, x2: diagramWidth, y2: y, stroke: "blue", opacity: 0.5});
                    grid.append(line);
                }
            }
        };

        /**
         * Scrolls to the coordinates specified by [x, y]. Upper left corner of viewport will start on these
         * coordinates.
         *
         * @param x
         * @param y
         */
        that.scrollTo = function (x, y) {
            viewPort.attr("transform", "translate({x},{y})".supplant({x: x, y: y}));
        };

        /**
         * Binds an event handler to the `dragStart` event. This event occurs when user starts dragging the diagram.
         * Note that if mouse is over a item in diagram, this event does not fire.
         *
         * @param handler
         */
        that.dragStart = function (handler) {
            onDragStart = handler;
        };

        /**
         * Binds an event handler to the `dragMove` event. This event occurs when user drags the diagram.
         * Note that if mouse is over a item in diagram, this event does not fire.
         *
         * @param handler
         */
        that.dragMove = function (handler) {
            onDragMove = handler;
        };

        /**
         * Binds an event handler to the `dragEnd` event. This event occurs when user stops dragging the diagram.
         * Note that if mouse is over a item in diagram, this event does not fire.
         *
         * @param handler
         */
        that.dragEnd = function (handler) {
            onDragEnd = handler;
        };


        /**
         * Returns the current coordinates of the diagram element, relative to the document.
         */
        that.offset = function () {
            return rootView.element().offset();
        };



        init();

        return that;
    };

});