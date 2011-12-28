/*global Raphael */

var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    /**
     * Auto-resize mode of node. It specifies how should node behave when its content (text) does
     * not fit it.
     */
    var AUTO_RESIZE_MODE = WIKIDIA.AUTO_RESIZE_MODE = {
        none: "none",
        growAndShrink: "growAndShrink",
        growOnly: "growOnly"
    };

    /**
     * @constructor
     * Creates new node.
     *
     * @param diagram Diagram in which this node is being created.
     * @param spec Node property specification (x, y, width, height, text).
     * @param my Protected interface (you should not use this unless you are constructor).
     */
    var node = function (diagram, spec, my) {
        spec = spec || {};

        var that = {}, // public interface
            defaultNodeWidth = spec.defaultNodeWidth || 100,
            defaultNodeHeight = spec.defaultNodeHeight || 100,
            minNodeWidth = spec.minNodeWidth || 50,
            minNodeHeight = spec.minNodeHeight || 10,

            mDiagram = diagram,
            mPaper = diagram.paper,
            mNodeRect = {
                x: spec.x || 0,
                y: spec.y || 0,
                width: spec.width || defaultNodeWidth,
                height: spec.height || defaultNodeHeight
            },

            TEXT_PADDING = 5,
            mText = spec.text || "",
            mTextRect = null, // will be computed during update

            mAutoResizeMode = spec.autoResizeMode || AUTO_RESIZE_MODE.growAndShrink,

            mIsSelected = false,
            mElements = mPaper.set(); // UI elements

        my = my || {}; // protected interface

        that.x = function (x) {
            if (arguments.length === 0) {
                return mNodeRect.x;
            } else {
                mNodeRect.x = x;
                this.update();
                return this;
            }
        };

        that.y = function (y) {
            if (arguments.length === 0) {
                return mNodeRect.y;
            } else {
                mNodeRect.y = y;
                this.update();
                return this;
            }
        };

        that.width = function (width) {
            if (arguments.length === 0) {
                return mNodeRect.width;
            } else {
                mNodeRect.width = width;
                this.update();
                return this;
            }
        };

        that.height = function (height) {
            if (arguments.length === 0) {
                return mNodeRect.height;
            } else {
                mNodeRect.height = height;
                this.update();
                return this;
            }
        };

        that.text = function (text) {
            if (arguments.length === 0) {
                return mText;
            } else {
                mText = text;
                this.update();
                return this;
            }
        };

        /**
         * Gets or sets whether node is selected.
         *
         * @param isSelected
         */
        that.isSelected = function (isSelected) {
            if (arguments.length === 0) {
                return mIsSelected;
            } else {
                mIsSelected = isSelected;
                this.update();
                return this;
            }
        };

        /**
         * Updates node.
         */
        that.update = function () {
            if (!updateInner()) {
                if (!updateInner()) {
                    log("Update requested re-run more than once, this is probably bug.");
                }
            }
        };

        var init = function () {
            that.update();
        };

        /**
         * Updates node. Returns true if update is successful. This method can request its re-run
         * by returning false. This will happen when rendered text does not fit a node and node
         * size is adjusted.
         */
        var updateInner = function () {
            // remove any existing elements
            mElements.remove();
            mElements.clear();

            my.onUpdate();

            if (mIsSelected) {
                var selectionGlow = my.contourElement.glow();
                my.addElement(selectionGlow);
            }

            var backgroundColor = "white";

            var lines = mText.split("\n");
            var visibleLines = [];
            lines.forEach(function (line) {
                if (/bg=.+/.test(line)) {
                    backgroundColor = line.match(/bg=(.*)/)[1];
                } else {
                    visibleLines.push(line);
                }
            });

            // TODO: I should specify minimum interface for contourElement
            my.contourElement.attr({
                fill : backgroundColor
            });

            mTextRect = {
                x: mNodeRect.x + TEXT_PADDING,
                y: mNodeRect.y + TEXT_PADDING,
                width: mNodeRect.width - 2 * TEXT_PADDING,
                height: mNodeRect.height - 2 * TEXT_PADDING
            };

            var textElement = mPaper.text(mTextRect.x, mTextRect.y, visibleLines.join("\n"));
            textElement.attr({
                'text-anchor': 'start'
            });
            textElement.translate(0, textElement.getBBox().height / 2);
            my.addElement(textElement);

            if (mAutoResizeMode === AUTO_RESIZE_MODE.growAndShrink || mAutoResizeMode === AUTO_RESIZE_MODE.growOnly) {

                var textWidth = textElement.getBBox().width;
                var textHeight = textElement.getBBox().height;
                var minTextWidth = minNodeWidth - 2 * TEXT_PADDING;
                var minTextHeight = minNodeHeight - 2 * TEXT_PADDING;
                var sizeChanged = false;

                if (textWidth > mTextRect.width) {
                    mNodeRect.width = textWidth + 2 * TEXT_PADDING;
                    sizeChanged = true;
                } else if (textWidth < mTextRect.width && textWidth > minTextWidth) {
                    mNodeRect.width = minNodeWidth;
                    sizeChanged = true;
                }
                if (textHeight > mTextRect.height) {
                    mNodeRect.height = textHeight + 2 * TEXT_PADDING;
                    sizeChanged = true;
                } else if (textHeight < mTextRect.height && textHeight > minTextHeight) {
                    mNodeRect.height = minNodeHeight;
                    sizeChanged = true;
                }

                // TODO: make this more general, inheriting objects should have this capability too via return false in onUpdate
                if (sizeChanged) {
                    // size has changed, we need to update again
                    return false;
                }

                // update completed successfully
                return true;
            }
        };

        /**
         * Called when node is updating. This function can be overridden by inheriting objects
         * to customize node rendering.
         *
         * This function must at minimum create contourElement.
         */
        my.onUpdate = function () {
            my.contourElement = mPaper.rect(mNodeRect.x, mNodeRect.y, mNodeRect.width, mNodeRect.height, 4);
            my.addElement(my.contourElement);
        };

        /**
         * Adds UI element to the node.
         *
         * @param element
         */
        my.addElement = function (element) {
            element.attr("cursor", "move");
//            element.drag(_onDragMove, _onDragStart, _onDragEnd);
//            element.click(_onClick);
//            element.dblclick(_onDblClick);
            mElements.push(element);
        };

        /**
         * Removes UI element from the node.
         *
         * @param element
         */
        my.removeElement = function (element) {
            element.remove();
            mElements.remove(element);
        };

        that._test = that._test || {};
        that._test.DEFAULT_NODE_WIDTH = defaultNodeWidth;
        that._test.DEFAULT_NODE_HEIGHT = defaultNodeHeight;

        init();

        return that;
    };


    /**
     * Creates new diagram.
     * @constructor
     *
     * @param paper DOM element on which diagram canvas will be created.
     * @param editor Textarea element which will be used to edit the content of diagram by user.
     */
    WIKIDIA.diagram = function (paper, editor) {
        // TODO: detect when result of jquery selection is passed in and extract first DOM element

        var that = {}, // public interface
            /*jshint newcap:false*/
            mPaper = Raphael(paper),
            mEditor = editor,
            // nodes or arrows
            mItems = [],
            mSelection = [];

        // TODO: Raphael is leaking here
        that.paper = mPaper;

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
        that.node = function (spec) {
            var n = node(this, spec);
            mItems.push(n);
            return n;
        };

        return that;
    };

})(this);
