var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


WIKIDIA.view.svg.view = function (element) {
    "use strict";

    var svgHelper = WIKIDIA.view.svg.svgHelper;

    var that = {};

    var onClick, onDoubleClick, onMouseDown, onMouseUp, onDragStart, onDragMove, onDragEnd;
    var readyForDrag = false,
        isDragged = false,
        dragStartX,
        dragStartY;


    element.click(function (e) {
        // TODO: decide about which events should bubble and which not
        //e.stopPropagation();

        if (onClick) {
            onClick(that);
        }
    });
    element.dblclick(function (e) {
        //e.stopPropagation();
        if (onDoubleClick) {
            onDoubleClick(that);
        }
    });
    element.mousedown(function (e) {

        dragStartX = e.clientX;
        dragStartY = e.clientY;
        readyForDrag = true;

        //e.stopPropagation();
        if (onMouseDown) {
            onMouseDown(that);
        }
    });
    element.mouseup(function (e) {
        //e.stopPropagation();
        if (onMouseUp) {
            onMouseUp(that);
        }
    });

    // TODO: optimize? it would be probably better to listen to mousemove just once here
    $(document).mousemove(function (e) {
        if (readyForDrag) {
            isDragged = true;
            readyForDrag = false;
            if (onDragStart) {
                onDragStart(e);
            }
        }
        if (isDragged) {
            if (onDragMove) {
                var dx = e.clientX - dragStartX;
                var dy = e.clientY - dragStartY;
                onDragMove(e, dx, dy);
            }
        }
    });

    $(document).mouseup(function (e) {
        readyForDrag = false;
        if (isDragged) {
            isDragged = false;
            if (onDragEnd) {
                var dx = e.clientX - dragStartX;
                var dy = e.clientY - dragStartY;
                onDragEnd(e, dx, dy);
            }
        }
    });

    // TODO: only one handler can be registered right now + DRY
    that.click = function (handler) {
        onClick = handler;
    };

    that.doubleClick = function (handler) {
        onDoubleClick = handler;
    };

    that.mouseDown = function (handler) {
        onMouseDown = handler;
    };

    that.mouseUp = function (handler) {
        onMouseUp = handler;
    };

    that.dragStart = function (handler) {
        onDragStart = handler;
    };

    that.dragMove = function (handler) {
        onDragMove = handler;
    };

    that.dragEnd = function (handler) {
        onDragEnd = handler;
    };

    that.element = function () {
        return element;
    };

    that.createElement = function (tagName, attributes) {
        var el = svgHelper.createSvgElement(tagName, attributes);
        element.append(el);
        return el;
    };

    return that;
};