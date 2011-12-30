var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    WIKIDIA.modules = WIKIDIA.modules || {};

    WIKIDIA.modules.log = {
        info: function (text, arg1, arg2, argN) {
            if (console) {
                var formattedText = sprintf.apply(null, arguments);
                console.info(formattedText + "\n");
            }
        },
        warn: function (text, arg1, arg2, argN) {
            if (console) {
                var formattedText = sprintf.apply(null, arguments);
                console.warn(formattedText + "\n");
            }
        },
        error: function (text, arg1, arg2, argN) {
            if (console) {
                var formattedText = sprintf.apply(null, arguments);
                console.error(formattedText + "\n");
            }
        },
        debug: function (text, arg1, arg2, argN) {
            if (console) {
                var formattedText = sprintf.apply(null, arguments);
                console.log(formattedText + "\n");
            }
        },
        dir: function (object) {
            if (console) {
                console.dir(object);
            }
        }
    };

})(this);
