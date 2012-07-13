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

        function init() {

            // disable text selection (it collides with diagram manipulation)
            diagramElement.css("-webkit-user-select", "none");
            diagramElement.css("-khtml-user-select", "none");
            diagramElement.css("-o-user-select", "none");
            diagramElement.css("user-select", "none");

            // TODO: let's skip presenter for now
            var viewPortX = 0, viewPortY = 0, lastDx, lastDy;
            var dragHandler = dragEventHandler(diagramElement);
            dragHandler.dragStart(function (e, dragInfo) {
                lastDx = 0;
                lastDy = 0;
            });
            dragHandler.dragMove(function (e, dragInfo) {
                viewPortX += dragInfo.dx - lastDx;
                viewPortY += dragInfo.dy - lastDy;
                lastDx = dragInfo.dx;
                lastDy = dragInfo.dy;

                viewPort.attr("transform", "translate({dx},{dy})".supplant({dx: viewPortX, dy: viewPortY}));
            });
            dragHandler.dragEnd(function (e, dragInfo) {
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
         * Returns the current coordinates of the diagram element, relative to the document.
         */
        that.offset = function () {
            return rootView.element().offset();
        };



        init();

        return that;
    };

});