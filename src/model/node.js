define(function (require) {
    "use strict";

    var item = require("model/item");
    var utils = require("utils");

    return function (spec) {
        var DEFAULT_SIZE = 90;

        var that = item();

        spec = spec || {};

        utils.addObservableProperty(that, "text", spec.text || "");
        utils.addObservableProperty(that, "x", spec.x || 0);
        utils.addObservableProperty(that, "y", spec.y || 0);
        utils.addObservableProperty(that, "width", spec.width || DEFAULT_SIZE);
        utils.addObservableProperty(that, "height", spec.height || DEFAULT_SIZE);
        utils.addObservableProperty(that, "kind", spec.kind || "node");

        that.isNode = true;

        return that;
    };
});
