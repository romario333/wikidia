var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    WIKIDIA.modules = WIKIDIA.modules || {};
    var module = WIKIDIA.modules.log = {};

    function info(text, arg1, arg2, argN) {
        if (console) {
            var formattedText = sprintf.apply(null, arguments);
            console.info(formattedText + "\n");
        }
    }
    module.info = info;

    function warn(text, arg1, arg2, argN) {
        if (console) {
            var formattedText = sprintf.apply(null, arguments);
            console.warn(formattedText + "\n");
        }
    }
    module.warn = warn;

    function error(text, arg1, arg2, argN) {
        if (console) {
            var formattedText = sprintf.apply(null, arguments);
            console.error(formattedText + "\n");
        }
    }
    module.error = error;

    function debug(text, arg1, arg2, argN) {
        if (console) {
            var formattedText = sprintf.apply(null, arguments);
            console.log(formattedText + "\n");
        }
    }
    module.debug = debug;

})(this);
