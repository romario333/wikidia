define(function(require) {
    "use strict";

    /**
     * Text area which user uses to edit content of selected node or line.
     */
    return function (textArea) {
        var that = {};

        var onFocus, onBlur;

        that.text = function (value) {
            if (arguments.length === 0) {
                return textArea.val();
            } else {
                textArea.val(value);
            }
        };

        that.focus = function (handler) {
            onFocus = handler;
        };

        that.blur = function (handler) {
            onBlur = handler;
        };

        textArea.focus(function (e) {
            if (onFocus) {
                onFocus();
            }
        });

        textArea.blur(function (e) {
            if (onBlur) {
                onBlur();
            }
        });

        return that;
    };
});