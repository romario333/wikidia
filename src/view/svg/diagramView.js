define(function(require) {
    "use strict";

    return function (rootView) {

        var parent = require("./viewBase");
        var svgHelper = require("./svgHelper");

        var element = rootView.createElement("g", {class: "diagram"});
        var that = parent(element);
        var eventBox, grid;

        function init() {
            eventBox = that.createElement("rect", {class: "eventBox", opacity: 0, fill: "blue", width: "100%", height: "100%"});
            grid = that.createElement("g", {class: "grid"});

            // disable text selection (it collides with diagram manipulation)
            element.css("-webkit-user-select", "none");
            element.css("-khtml-user-select", "none");
            element.css("-o-user-select", "none");
            element.css("user-select", "none");
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