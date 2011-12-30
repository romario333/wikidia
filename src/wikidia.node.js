var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    var svg = WIKIDIA.modules.svg;
    var log = WIKIDIA.modules.log;

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
    WIKIDIA.node = function (diagram, spec, my) {
        spec = spec || {};

        var that = {}, // public interface
            defaultNodeWidth = spec.defaultNodeWidth || 100,
            defaultNodeHeight = spec.defaultNodeHeight || 100,
            minNodeWidth = spec.minNodeWidth || 50,
            minNodeHeight = spec.minNodeHeight || 10,

            mDiagram = diagram,
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

            mSvgGroup,
            mIsSelected = false;

        my = my || {}; // protected interface

        function x(x) {
            if (arguments.length === 0) {
                return mNodeRect.x;
            } else {
                mNodeRect.x = x;
                this.update();
                return this;
            }
        }
        that.x = x;

        function y(y) {
            if (arguments.length === 0) {
                return mNodeRect.y;
            } else {
                mNodeRect.y = y;
                this.update();
                return this;
            }
        };
        that.y = y;

        function width(width) {
            if (arguments.length === 0) {
                return mNodeRect.width;
            } else {
                mNodeRect.width = width;
                this.update();
                return this;
            }
        };
        that.width = width;

        function height(height) {
            if (arguments.length === 0) {
                return mNodeRect.height;
            } else {
                mNodeRect.height = height;
                this.update();
                return this;
            }
        }
        that.height = height;

        function text(text) {
            if (arguments.length === 0) {
                return mText;
            } else {
                mText = text;
                this.update();
                return this;
            }
        }
        that.text = text;

        /**
         * Gets or sets whether node is selected.
         *
         * @param isSelected
         */
        function isSelected(isSelected) {
            if (arguments.length === 0) {
                return mIsSelected;
            } else {
                mIsSelected = isSelected;
                this.update();
                return this;
            }
        };
        that.isSelected = isSelected;

        /**
         * Updates node.
         */
        function update() {
            if (!updateInner()) {
                if (!updateInner()) {
                    log.warn("Update requested re-run more than once, this is probably bug.");
                }
            }
        }
        that.update = update;

        function init() {
            mSvgGroup = mDiagram.svg.group();

            update();

            // TODO: zapouzdrit
            mSvgGroup.element.mousedown(function () {
                log.debug("mousedown");
            });

            mSvgGroup.element.mouseup(function () {
                log.debug("mouseup");
            });


            mSvgGroup.element.click(function () {
                log.debug("click");
            });

            mSvgGroup.element.dblclick(function () {
                log.debug("dblclick");
            });
        };

        /**
         * Updates node. Returns true if update is successful. This method can request its re-run
         * by returning false. This will happen when rendered text does not fit a node and node
         * size is adjusted.
         */
        function updateInner() {
            // remove any existing elements
            mSvgGroup.clear();

            my.onUpdate();

            if (mIsSelected) {
                // TODO
//                var selectionGlow = my.contourElement.glow();
//                my.addElement(selectionGlow);
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

            var textElement = mSvgGroup.text({x: mTextRect.x, y: mTextRect.y, text: visibleLines.join("\n")});
            //textElement.translate(0, textElement.getBBox().height / 2);
//
//            if (mAutoResizeMode === AUTO_RESIZE_MODE.growAndShrink || mAutoResizeMode === AUTO_RESIZE_MODE.growOnly) {
//
//                var textWidth = textElement.getBBox().width;
//                var textHeight = textElement.getBBox().height;
//                var minTextWidth = minNodeWidth - 2 * TEXT_PADDING;
//                var minTextHeight = minNodeHeight - 2 * TEXT_PADDING;
//                var sizeChanged = false;
//
//                if (textWidth > mTextRect.width) {
//                    mNodeRect.width = textWidth + 2 * TEXT_PADDING;
//                    sizeChanged = true;
//                } else if (textWidth < mTextRect.width && textWidth > minTextWidth) {
//                    mNodeRect.width = minNodeWidth;
//                    sizeChanged = true;
//                }
//                if (textHeight > mTextRect.height) {
//                    mNodeRect.height = textHeight + 2 * TEXT_PADDING;
//                    sizeChanged = true;
//                } else if (textHeight < mTextRect.height && textHeight > minTextHeight) {
//                    mNodeRect.height = minNodeHeight;
//                    sizeChanged = true;
//                }
//
//                // TODO: make this more general, inheriting objects should have this capability too via return false in onUpdate
//                if (sizeChanged) {
//                    // size has changed, we need to update again
//                    return false;
//                }
//            }

            // update completed successfully
            return true;
        };

        /**
         * Called when node is updating. This function can be overridden by inheriting objects
         * to customize node rendering.
         *
         * This function must at minimum create contourElement.
         */
        my.onUpdate = function () {
            var contourElement = mSvgGroup.rect({
                x: mNodeRect.x,
                y: mNodeRect.y,
                width: mNodeRect.width,
                height: mNodeRect.height,
                stroke: "black"
            });
            my.contourElement = contourElement.element;
        };
        var onUpdate = undefined; // you should always call shared version of onUpdate

        that._test = that._test || {};
        that._test.DEFAULT_NODE_WIDTH = defaultNodeWidth;
        that._test.DEFAULT_NODE_HEIGHT = defaultNodeHeight;

        init();

        return that;
    };


})(this);
