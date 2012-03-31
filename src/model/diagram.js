var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.diagram = function () {
    "use strict";

    var that = {},
        items = [];

    that.addItem = function (item) {
        items.push(item);
    };

    that.items = function () {
        return items;
    };

    that.toJSON = function () {
        var json = "[";
        items.forEach(function (item, index) {
            json += item.toJSON();
            if (index < items.length - 1) {
                json += ", ";
            }
        });
        json += "]";
        return json;
    };

    return that;
};