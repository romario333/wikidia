/*global Raphael */

var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    WIKIDIA.modules = WIKIDIA.modules || {};
    var module = WIKIDIA.modules.utils = {};

    // TODO: look whether clone is supported in future versions of ECMAScript
    module.copyShallow = function (object) {
        return jQuery.extend({}, object);
    };

    module.copyDeep = function (object) {
        return jQuery.extend(true, {}, object);
    };

})(this);
