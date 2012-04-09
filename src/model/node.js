var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

// TODO: I will need cloning support in the future, consider using pseudo-privacy
WIKIDIA.model.node = function (spec) {
    "use strict";

    var DEFAULT_SIZE = 90;

    var that = WIKIDIA.model.item();

    spec = spec || {};

    // TODO: tady bych mel proste vytvorit objekt, ktery ma automaticky vsechny properties observable?
    that._addObservableProperty("text", spec.text || "");
    that._addObservableProperty("x", spec.x || 0);
    that._addObservableProperty("y", spec.y || 0);
    that._addObservableProperty("width", spec.width || DEFAULT_SIZE);
    that._addObservableProperty("height", spec.height || DEFAULT_SIZE);
    that._addObservableProperty("kind", spec.kind || "node");

    that.isNode = true;

    return that;
};
