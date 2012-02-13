var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    var svg = WIKIDIA.modules.svg;
    var utils = WIKIDIA.modules.utils;
    var newNode = WIKIDIA.newNode; // TODO: should tell me have a look at node.js
    var newUseCaseNode = WIKIDIA.newUseCaseNode;

    var GRID_STEP = 10;

    /**
     * Creates new diagram.
     * @constructor
     *
     * @param diagramDiv DOM element on which diagram canvas will be created.
     * @param editorTextArea Textarea element which will be used to edit the content of diagram by user.
     */
    WIKIDIA.newDiagram = function (diagramDiv, editorTextArea) {

        var that = {}, // public interface
            mSvgRoot,
            mEditor = editorTextArea,
            // nodes or arrows
            mItems = [],
            mSelection = [];

        function init() {
            // create root SVG element
            mSvgRoot = svg.newSvgRootNode();
            $(diagramDiv).append(mSvgRoot.element);

            // draw Grid
            var gridGroup = mSvgRoot.addGroup({id: "grid"});
            var diagramWidth = mSvgRoot.element.innerWidth();
            var diagramHeight = mSvgRoot.element.innerHeight();
            var x, y;
            for (x = 0; x < diagramWidth; x += GRID_STEP) {
                gridGroup.addLine({x1: x, y1: 0, x2: x, y2: diagramHeight, stroke: "blue", opacity: 0.5});
            }
            for (y = 0; y < diagramHeight; y += GRID_STEP) {
                gridGroup.addLine({x1: 0, y1: y, x2: diagramWidth, y2: y, stroke: "blue", opacity: 0.5});
            }
        }

        init();

        /**
         * Selects one item (node or arrow). Any other selected items will be deselected.
         *
         * @param item Node or arrow to select.
         */
        that.select = function (item) {
            var currentSelection;

            // cancel current selection
            /*jshint boss:true*/
            while (currentSelection = mSelection.pop()) {
                currentSelection.isSelected(false);
            }

            mSelection.push(item);
            item.isSelected(true);
        };

        that.addItem = function (item) {
            mItems.push(item);
            item.diagram(that);
            item.update();
            mSvgRoot.addNode(item.svg());
            //item.diagram(item);

        };

        /**
         * Snaps specified point to the grid and returns new point.
         *
         * @param pointOrRect
         */
        that.snapToGrid = function (pointOrRect) {

            // TODO: review with clear head
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
        };

        /**
         * Returns size of the grid's step.
         */
        that.gridStep = function () {
            return GRID_STEP;
        }

        return that;
    };

})(this);
