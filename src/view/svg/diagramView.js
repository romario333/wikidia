var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


WIKIDIA.view.svg.diagramView = function (rootView) {
    "use strict";

    var parent = WIKIDIA.view.svg.view;
    var svgHelper = WIKIDIA.view.svg.svgHelper;

    var gridStep = 100; // TODO: pokus

    var element = rootView.createElement("g", {class: "diagram"});
    var that = parent(element);
    var grid;

    function init() {
        grid = that.createElement("g", {class: "grid"});

        // disable text selection (it collides with diagram manipulation)
        // -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-o-user-select: none;user-select: none;
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
            var diagramWidth = rootView.element().innerWidth();
            var diagramHeight = rootView.element().innerHeight();
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

    init();

    return that;
};