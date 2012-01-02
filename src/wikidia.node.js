var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    var log = WIKIDIA.modules.log,
        utils = WIKIDIA.modules.utils,

        /**
         * Auto-resize mode of node. It specifies how should node behave when its content (text) does
         * not fit it.
         */
        AUTO_RESIZE_MODE = WIKIDIA.AUTO_RESIZE_MODE = {
            none: "none",
            growAndShrink: "growAndShrink",
            growOnly: "growOnly"
        },


        newNodeUiBuilder = function (svgRoot, nodeRect) {
            var mSvg = svgRoot.addGroup();

            return {
                svg: mSvg,
                nodeRect: nodeRect,
                contour: null
            };
        };

    // TODO: I should do this as a jquery plugin
    function newDragEventHandler(element) {
        var mReadyForDrag = false,
            mIsDragged = false,
            mDragStartX,
            mDragStartY,
            // TODO: only one listener can be registered at the  moment
            mOnDragStart,
            mOnDragMove,
            mOnDragEnd;

        element.mousedown(function (e) {
            mDragStartX = e.clientX;
            mDragStartY = e.clientY;
            mReadyForDrag = true;
        });

        // TODO: this is not very effective implementation
        $(document.body).mouseup(function (e) {
            mReadyForDrag = false;
            if (mIsDragged) {
                mIsDragged = false;
                if (mOnDragEnd) {
                    var dx = e.clientX - mDragStartX;
                    var dy = e.clientY - mDragStartY;
                    mOnDragEnd(e, dx, dy);
                }
            }
        });

        $(document.body).mousemove(function (e) {
            if (mReadyForDrag) {
                mIsDragged = true;
                mReadyForDrag = false;
                if (mOnDragStart) {
                    mOnDragStart(e);
                }
            }
            if (mIsDragged) {
                if (mOnDragMove) {
                    var dx = e.clientX - mDragStartX;
                    var dy = e.clientY - mDragStartY;
                    mOnDragMove(e, dx, dy);
                }
            }
        });

        var that = {
            dragStart: function (handler) {
                mOnDragStart = handler;
            },
            dragMove: function (handler) {
                mOnDragMove = handler;
            },
            dragEnd: function (handler) {
                mOnDragEnd = handler;
            }
        };
        return that;
    }

    function newMoveOperation(node) {
        var that = {},
            mNode = node;

        that.preview = function (dx, dy) {
            // TODO: create nicer API for transformations
            // TODO: use .nodeRect
            var snapped = mNode.diagram.snapToGrid({x: dx, y: dy});
            mNode.uiBuilder.svg.transform(sprintf("translate(%d,%d)", snapped.x, snapped.y));
        };

        // TODO: will be useful?
        that.cancel = function () {

        };

        that.execute = function (dx, dy) {
            mNode.uiBuilder.svg.clearTransform();
            var snapped = mNode.diagram.snapToGrid({x: mNode.x() + dx, y: mNode.y() + dy});
            mNode.moveTo(snapped.x, snapped.y);
        };

        that.undo = function (dx, dy) {

        };

        return that;
    }

    function newResizeOperation(node) {
        var that = {},
            mNode = node,
            mOldSize = utils.copyShallow(node.uiBuilder.nodeRect);

        that.preview = function (dx, dy, dWidth, dHeight) {
            mNode.uiBuilder.nodeRect.x = mOldSize.x + dx;
            mNode.uiBuilder.nodeRect.y = mOldSize.y + dy;
            mNode.uiBuilder.nodeRect.width = mOldSize.width + dWidth;
            mNode.uiBuilder.nodeRect.height = mOldSize.height + dHeight;

            mNode.diagram.snapToGrid(node.uiBuilder.nodeRect);
            mNode.update();
        };

        that.execute = function (dx, dy, dWidth, dHeight) {
            // do nothing
        };

        return that;
    }

    /**
     * @constructor
     * Creates new node.
     *
     * @param diagram Diagram in which this node is being created.
     * @param spec Node property specification (x, y, width, height, text).
     * @param my Protected interface.
     */
    WIKIDIA.newNode = function (diagram, spec, my) {
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

            mUiBuilder,
            mIsSelected = false,
            // TODO: should be in some command executor
            mMoveOperation;

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

        // TODO: this wouldn't be necessary if I can do x(x) and y(y) at once
        that.moveTo = function (x, y) {
            mNodeRect.x = x;
            mNodeRect.y = y;
            update();
        };

        function init() {
            mUiBuilder = newNodeUiBuilder(mDiagram.svgRoot, mNodeRect);

            // TODO: I should divide visual representation from interaction UI
            mUiBuilder.svg.element.attr("cursor", "move");

            // TODO: quick resize hack
//            var controlsGroup = mDiagram.svgRoot.addGroup({id: "controls"});
//
//            // TODO: potrebuju neco jako resizeOperation - umi to ukazovat online tu zmenu jak tahnu a na konci vytvori neco, co se da undoovat (to same pak bude platit i pro move)
//            // TODO: operace jdou volat nad vice nody najednou (move je ocividny use-case a vidim i nekolik vybranych nodu a resize na jednom se bude projevovat i na druhem)
//            // TODO: navic se da operace vyvolat pomoci klavesnice
//            var addResizeBorder = function(x1, y1, x2, y2, cursor, handler) {
//                var resizeBorder = controlsGroup.addLine({x1: x1, y1: y1, x2: x2, y2: y2, cursor: cursor, "stroke-width": "5", stroke: "red"});
//                // TODO: get rid of that goddamn .element everywhere :(
//                newDragEventHandler(resizeBorder.element).dragMove(handler);
//            };
//
//            addResizeBorder(10, 10, 50, 10, "se-resize", function(dx, dy) {
//                mNodeRect.width += dx;
//                mNodeRect.height += dy;
//                update();
//            });





            update();

            var dragHandler = newDragEventHandler(mUiBuilder.svg.element);
            dragHandler.dragStart(onDragStart);
            dragHandler.dragMove(onDragMove);
            dragHandler.dragEnd(onDragEnd);


            mUiBuilder.svg.element.click(function () {
                log.debug("click");
            });

            mUiBuilder.svg.element.dblclick(function () {
                log.debug("dblclick");
            });

            // TODO: I need proper getter
            that.uiBuilder = mUiBuilder;
        }

        function onDragStart(e) {
            log.debug("move dragStart");
            mMoveOperation = newMoveOperation(that);
        }

        function onDragMove(e, dx, dy) {
            mMoveOperation.preview(dx, dy);
        }

        function onDragEnd(e, dx, dy) {
            mMoveOperation.execute(dx, dy);
        }



        /**
         * Updates node. Returns true if update is successful. This method can request its re-run
         * by returning false. This will happen when rendered text does not fit a node and node
         * size is adjusted.
         */
        function updateInner() {
            // remove any existing elements
            mUiBuilder.svg.clear();

            my.onUpdate(mUiBuilder);

            updateResizeBorder(mUiBuilder);

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
            mUiBuilder.contour.element.attr({
                fill : backgroundColor
            });

            mTextRect = {
                x: mNodeRect.x + TEXT_PADDING,
                y: mNodeRect.y + TEXT_PADDING,
                width: mNodeRect.width - 2 * TEXT_PADDING,
                height: mNodeRect.height - 2 * TEXT_PADDING
            };

            var textElement = mUiBuilder.svg.addText({
                x: mTextRect.x,
                y: mTextRect.y,
                'alignment-baseline': 'text-before-edge'});
            textElement.text(visibleLines);

//              // TODO: change size should be negotiable during onUpdate
//              if (mAutoResizeMode === AUTO_RESIZE_MODE.growAndShrink || mAutoResizeMode === AUTO_RESIZE_MODE.growOnly) {
//
//                var textWidth = textElement.rootElement.getBBox().width;
//                var textHeight = textElement.rootElement.getBBox().height;
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
//                if (sizeChanged) {
//                    // size has changed, we need to update again
//                    return false;
//                }
//            }

            // update completed successfully
            return true;
        }

        function updateResizeBorder(nodeUiBuilder) {
            // TODO: do I really want to recreate all this on every update?
            var controlsGroup = nodeUiBuilder.svg.addGroup();

            var CORNER_SIZE = 15;

            // TODO:
            controlsGroup.addLine({
                x1: mNodeRect.x + mNodeRect.width,
                y1: mNodeRect.y,
                x2: mNodeRect.x + mNodeRect.width,
                y2: mNodeRect.y + mNodeRect.height,
                "stroke-width": 7,
                stroke: "red",
                opacity: 0,
                fill: "none",
                cursor: "e-resize"
            });

            // TODO: fakt %d?
            // TODO: fuj
            var resizeBorder = controlsGroup.addPath({
                d: sprintf("M %d %d L %d %d L %d %d",
                    mNodeRect.x + mNodeRect.width, mNodeRect.y + mNodeRect.height - CORNER_SIZE,
                    mNodeRect.x + mNodeRect.width, mNodeRect.y + mNodeRect.height,
                    mNodeRect.x + mNodeRect.width - CORNER_SIZE, mNodeRect.y + mNodeRect.height
                ),
                "stroke-width": 7,
                stroke: "red",
                opacity: 0,
                fill: "none",
                cursor: "se-resize"
            });

            var resizeDragHandler = newDragEventHandler(resizeBorder.element);
            var resizeOperation;

            resizeDragHandler.dragStart(function (e) {
                log.debug("resize dragStart");
                // TODO: why stopPropagation is not enough?
                e.stopImmediatePropagation();
                resizeOperation = newResizeOperation(that);
            });

            resizeDragHandler.dragMove(function (e, dx, dy) {
                e.stopImmediatePropagation();
                resizeOperation.preview(0, 0, dx, dy);
            });

            resizeDragHandler.dragEnd(function (e, dx, dy) {
                e.stopImmediatePropagation();
                resizeOperation.execute(0, 0, dx, dy);
            });

            //var resizeBorder = controlsGroup.addLine({x1: x1, y1: y1, x2: x2, y2: y2, cursor: cursor, "stroke-width": "5", stroke: "red"});
        }

        /**
         * Called when node is updating. This function can be overridden by inheriting objects
         * to customize node rendering.
         *
         * This function must at minimum create contour.
         */
        my.onUpdate = function (nodeUiBuilder) {
            // TODO: I should read nodeRect from same interface as subclasses
            var contour = nodeUiBuilder.svg.addRect({
                x: mNodeRect.x,
                y: mNodeRect.y,
                width: mNodeRect.width,
                height: mNodeRect.height,
                stroke: "black"
            });
            nodeUiBuilder.contour = contour;
        };
        var onUpdate = null; // you should always call shared version of onUpdate

        // TODO: public interface spread around whole object
        that.diagram = mDiagram;

        that._test = that._test || {};
        that._test.DEFAULT_NODE_WIDTH = defaultNodeWidth;
        that._test.DEFAULT_NODE_HEIGHT = defaultNodeHeight;

        init();

        return that;
    };

    WIKIDIA.newUseCaseNode = function (diagram, spec, my) {
        var that;

        my = my || {};

        that = WIKIDIA.newNode(diagram, spec, my);

        my.onUpdate = function (nodeUiBuilder) {
            var halfWidth = nodeUiBuilder.nodeRect.width / 2;
            var halfHeight = nodeUiBuilder.nodeRect.height / 2;

            var contour = nodeUiBuilder.svg.addEllipse({
                cx: nodeUiBuilder.nodeRect.x + halfWidth,
                cy: nodeUiBuilder.nodeRect.y + halfHeight,
                rx: halfWidth,
                ry: halfHeight
            });
            nodeUiBuilder.contour = contour;
        };

        return that;
    };


})(this);
