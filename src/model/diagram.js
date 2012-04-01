var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.diagram = function () {
    "use strict";

    var that = {},
        items = [],
        onItemAddedHandlers = [],
        onItemRemovedHandlers = [],
        lastId = 0;

    that.addItem = function (item) {
        lastId++;
        item.id = lastId;
        items.push(item);
        if (that.changeEventsEnabled) {
            that.fireItemAdded(item);
        }
    };

    that.removeItem = function (item) {
        var i = items.indexOf(item);
        if (i === -1) {
            throw new Error("Item '{item}' not found in connections.".supplant({item: item}));
        }
        items.splice(i, 1);
        item.id = null;
        if (that.changeEventsEnabled) {
            that.fireItemRemoved(item);
        }
    };

    that.items = function () {
        return items;
    };

    that.changeEventsEnabled = true;

    that.itemAdded = function (handler) {
        onItemAddedHandlers.push(handler);
    };

    that.itemRemoved = function (handler) {
        onItemRemovedHandlers.push(handler);
    };

    that.fireItemAdded = function (item) {
        onItemAddedHandlers.forEach(function (handler) {
            handler(that, item);
        });
    };

    that.fireItemRemoved = function (item) {
        onItemRemovedHandlers.forEach(function (handler) {
            handler(that, item);
        });
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