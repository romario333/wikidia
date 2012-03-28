var WIKIDIA = WIKIDIA || {};
WIKIDIA.utils = WIKIDIA.utils || {};

(function () {
    "use strict";

    var module = WIKIDIA.utils;

    module.objectWithId = function f () {
        if (!f.lastId) {
            f.lastId = 0;
        }
        f.lastId++;
        return {oid: f.lastId};
    };

    if (!String.prototype.supplant) {
        String.prototype.supplant = function (o) {
            return this.replace(/\{([^\{\}]*)\}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        };
    }

})();