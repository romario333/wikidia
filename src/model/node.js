var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.node = function (spec) {
    "use strict";

    var DEFAULT_SIZE = 100;

    var that = {};

    spec = spec || {};

    that.text = spec.text || "";
    that.x = spec.x || 0;
    that.y = spec.y || 0;
    that.width = spec.width || DEFAULT_SIZE;
    that.height = spec.height || DEFAULT_SIZE;

    that.update = function (nodeBuilder) {
        // TODO: nodeBuilder.drawContour();
        // TODO: preklad souradnic, starting at 0,0
        nodeBuilder.rect({x: that.x, y: that.y, width: that.width, height: that.height});
    };

    return that;
};

WIKIDIA.model.classNode = function (spec) {
    "use strict";

    var that = WIKIDIA.model.node(spec);

    that.update = function (nodeBuilder) {
        var sections = that.text.split("--");
        sections.forEach(function (section, index) {
            nodeBuilder.text(section);

            if (index !== sections.length - 1) {
                nodeBuilder.line({x1: 0, x2: that.width});
            }
        });
    };

    return that;
};