define(function(require) {
    "use strict";

    return function () {

        var that = {},
            items = [],
            onItemAddedHandlers = [],
            onItemRemovedHandlers = [],
            changeEventsEnabled = true,
            lastId = 0;

        that.addItem = function (item) {
            item.id = ++lastId;

            if (item.isLine) {
                item.points().forEach(function (point) { // TODO: put to line via some generic callback?
                    point.id = ++lastId;
                });
            }

            items.push(item);
            if (changeEventsEnabled) {
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

            if (item.isLine) {
                item.points().forEach(function (point) {
                    point.id = null;
                });
            }

            if (changeEventsEnabled) {
                that.fireItemRemoved(item);
            }
        };

        that.items = function () {
            return items;
        };

        that.changeEventsEnabled = function (value) {
            if (arguments.length === 0) {
                return changeEventsEnabled;
            } else {
                changeEventsEnabled = value;
            }
        };

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
});
