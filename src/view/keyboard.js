define(function(require) {
    "use strict";

    /**
     * This is pseudo-view, it's here just to send keyboard events to presenter.
     */
    return function () {
        var that = {};

        var onKeyUp;

        var isCtrlKeyDown = true;

        $(document).keydown(function (e) {
            if (e.which === 17) {  // FIXME: e.ctrlKey does not work here
                isCtrlKeyDown = true;
            }
        });

        $(document).keyup(function (e) {
            if (e.ctrlKey) {
                isCtrlKeyDown = false;
            }

            if (onKeyUp) {
                onKeyUp({
                    ctrlKey: e.ctrlKey,
                    which: e.which
                });
            }
        });

        that.keyUp = function (handler) {
            onKeyUp = handler;
        };

        that.isCtrlKeyDown = function () {
            return isCtrlKeyDown;
        };

        return that;
    };
});