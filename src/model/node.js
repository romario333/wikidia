define(function (require) {
    "use strict";

    var item = require("model/item");

    return function (spec) {
        var DEFAULT_SIZE = 90;

        var that = item();

        spec = spec || {};

        that._addObservableProperty("text", spec.text || "");
        that._addObservableProperty("x", spec.x || 0);
        that._addObservableProperty("y", spec.y || 0);
        that._addObservableProperty("width", spec.width || DEFAULT_SIZE);
        that._addObservableProperty("height", spec.height || DEFAULT_SIZE);
        that._addObservableProperty("kind", spec.kind || "node");

        that.isNode = true;

        return that;
    };
});
