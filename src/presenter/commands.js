var WIKIDIA = WIKIDIA || {};
WIKIDIA.presenter = WIKIDIA.presenter || {};

WIKIDIA.presenter.moveCommand = function (items) {
    "use strict";

    var that = {},
        originalData = [];

    items.forEach(function (item) {
        originalData[item.oid] = item.data.copyShallow();
    });

    // TODO: stalo by za uvahu predelat, aby prijimalo x a y?
    that.dx = 0;
    that.dy = 0;

    that.preview = function () {
        that.execute();
    };

    that.cancelPreview = function () {
        that.undo();
    };

    that.execute = function () {
        items.forEach(function (item) {
            if (item.data.isNode) {
                var node = item.data;
                var originalNode = originalData[item.oid];
                node.changeEventsEnabled  = false;
                node.x = originalNode.x + that.dx;
                node.y = originalNode.y + that.dy;
                node.changeEventsEnabled  = true;
                node.fireChange();
            } else if (item.data.isLine) {
                var line = item.data;
                var originalLine = originalData[item.oid];
                line.changeEventsEnabled = false;
                line.x1 = originalLine.x1 + that.dx;
                line.y1 = originalLine.y1 + that.dy;
                line.x2 = originalLine.x2 + that.dx;
                line.y2 = originalLine.y2 + that.dy;
                line.changeEventsEnabled  = true;
                line.fireChange();
            } else {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }
        });
    };

    that.undo = function () {
        items.forEach(function (item) {
            if (item.data.isNode) {
                var node = item.data;
                var originalNode = originalData[item.oid];
                node.changeEventsEnabled  = false;
                node.x = originalNode.x;
                node.y = originalNode.y;
                node.changeEventsEnabled  = true;
                node.fireChange();
            } else if (item.data.isLine) {
                var line = item.data;
                var originalLine = originalData[item.oid];
                line.changeEventsEnabled = false;
                line.x1 = originalLine.x1;
                line.y1 = originalLine.y1;
                line.x2 = originalLine.x2;
                line.y2 = originalLine.y2;
                line.changeEventsEnabled  = true;
                line.fireChange();
            } else {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }
        });
    };

    return that;
};

WIKIDIA.presenter.resizeNodeCommand = function (items) {
    "use strict";

    var that = {},
        originalData = [];

    // TODO: DRY: bulkCommand?
    items.forEach(function (item) {
        originalData[item.oid] = item.data.copyShallow();
    });

    that.dWidth = 0;
    that.dHeight = 0;

    that.preview = function () {
        that.execute();
    };

    that.cancelPreview = function () {
        that.undo();
    };

    that.execute = function () {
        items.forEach(function (item) {
            if (!item.data.isNode) {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }

            var node = item.data;
            var originalNode = originalData[item.oid];
            node.changeEventsEnabled  = false;
            node.width = originalNode.width + that.dWidth;
            node.height = originalNode.height + that.dHeight;
            node.changeEventsEnabled  = true;
            node.fireChange();
        });
    };

    that.undo = function () {
        items.forEach(function (item) {
            if (!item.data.isNode) {
                throw new Error("Unexpected item, kind='{kind}'.".supplant({kind: item.data.kind}));
            }

            var node = item.data;
            var originalNode = originalData[item.oid];
            node.changeEventsEnabled  = false;
            node.width = originalNode.width;
            node.height = originalNode.height;
            node.changeEventsEnabled  = true;
            node.fireChange();
        });
    };

    return that;
};

WIKIDIA.presenter.addLineCommand = function (x1, y1) {
    "use strict";

    var that = {};

    that.x2 = x1;
    that.y2 = y1;


    that.preview = function () {
        that.execute();
    };

    that.cancelPreview = function () {
        that.undo();
    };

    that.execute = function () {


    };

    that.undo = function () {

    };
};