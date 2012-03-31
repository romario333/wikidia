var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};

WIKIDIA.view.svg.dragEventHandler = function (element) {
    "use strict";

    var readyForDrag = false,
        isDragged = false,
        dragStartX,
        dragStartY,
        // TODO: only one listener can be registered at the  moment
        onDragStart,
        onDragMove,
        onDragEnd;

    element.mousedown(function (e) {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        readyForDrag = true;
    });

    // TODO: tady povesim pomerne hodne uplne stejnych handleru na body, nestacil by jeden?
    $(document.body).mousemove(function (e) {
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

    $(document.body).mouseup(function (e) {
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

    var that = {
        dragStart: function (handler) {
            onDragStart = handler;
        },
        dragMove: function (handler) {
            onDragMove = handler;
        },
        dragEnd: function (handler) {
            onDragEnd = handler;
        }
    };
    return that;
};