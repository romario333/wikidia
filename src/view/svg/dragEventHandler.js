define(function(require) {
    "use strict";

    return function (element) {
        var readyForDrag = false,
            isDragged = false,
            dragInfo = {
                startX: null,
                startY: null,
                x: null,
                y: null,
                dx: 0,
                dy: 0,
                lastDx: 0,
                lastDy: 0
            },
            // TODO: only one listener can be registered at the  moment
            onDragStart,
            onDragMove,
            onDragEnd;

        element.mousedown(function (e) {
            dragInfo.startX = e.clientX;
            dragInfo.startY = e.clientY;
            readyForDrag = true;
        });

        // TODO: possible optimization: register only one global event handler
        $(document.body).mousemove(function (e) {
            if (readyForDrag) {
                isDragged = true;
                readyForDrag = false;
                if (onDragStart) {
                    dragInfo.x = dragInfo.startX;
                    dragInfo.y = dragInfo.startY;
                    dragInfo.dx = 0;
                    dragInfo.dy = 0;
                    dragInfo.lastDx = 0;
                    dragInfo.lastDy = 0;
                    onDragStart(e, dragInfo);
                }
                // we have to disable click event temporarily, because mouseup on the same element later will produce click and we
                // don't want to fire click handlers
                removeClickHandlers(e.target);
            }
            if (isDragged) {
                if (onDragMove) {
                    dragInfo.lastDx = dragInfo.dx;
                    dragInfo.lastDy = dragInfo.dy;
                    dragInfo.dx = e.clientX - dragInfo.startX;
                    dragInfo.dy = e.clientY - dragInfo.startY;
                    onDragMove(e, dragInfo);
                }
            }
        });

        $(document).mouseup(function (e) {
            readyForDrag = false;
            if (isDragged) {
                isDragged = false;
                if (onDragEnd) {
                    dragInfo.lastDx = dragInfo.dx;
                    dragInfo.lastDy = dragInfo.dy;
                    dragInfo.dx = e.clientX - dragInfo.startX;
                    dragInfo.dy = e.clientY - dragInfo.startY;
                    onDragEnd(e, dragInfo);
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
            clickTarget.off("click");
        }

        function restoreClickHandlers() {
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

});