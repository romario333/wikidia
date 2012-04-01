var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.item = function (spec) {
    "use strict";

    var utils = WIKIDIA.utils;

    var that = utils.objectWithId();

    /**
     * Id of item in diagram. It should be unique within diagram and only diagram should set it.
     */
    that.id = null;

    return that;
};
