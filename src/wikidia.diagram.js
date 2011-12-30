var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    var node = WIKIDIA.newNode;
    var svg = WIKIDIA.modules.svg;

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
        }

        init();

        that.svgRoot = mSvgRoot;

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

        /**
         * All items in diagram (nodes and arrows).
         */
        that.items = function () {
            return mItems;
        };

        /**
         * @constructor
         * Creates new node in this diagram.
         *
         * @param spec Node property specification (x, y, width, height, text).
         */
        that.newNode = function (spec) {
            var n = node(this, spec);
            mItems.push(n);
            return n;
        };

        return that;
    };

})(this);
