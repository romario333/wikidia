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
            // we have to disable click event temporarily, because mouseup on the same element later will produce click and we
            // don't want to fire click handlers
            removeClickHandlers(e.target);
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

            // TODO: this is terrible, there must be easier way
            $(e.target).one("click", function (e) {
                e.stopImmediatePropagation();
            });
            restoreClickHandlers();

        }
    });

    // TODO: I doubt that this is part of jQuery's API
    var clickTarget;
    var clickEvents;
    function removeClickHandlers(element) {
        if (clickTarget) {
            restoreClickHandlers();
        }

        clickTarget = $(element);
        if (clickTarget.data("events") && clickTarget.data("events").click) {
            clickEvents = clickTarget.data("events").click.slice();
        }
        console.dir(clickEvents);
        clickTarget.off("click");
    }

    function restoreClickHandlers() {
        console.log("restore");
        console.dir(clickEvents);
        if (clickEvents) {
            clickEvents.forEach(function (clickEvent) {
                clickTarget.on(clickEvent.type, clickEvent.selector, clickEvent.data, clickEvent.handler);
            });
            clickTarget = undefined;
            clickEvents = undefined;
        }
    }

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