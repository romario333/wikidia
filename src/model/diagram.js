define(function(require) {
    "use strict";

    /**
     * @constructor
     *
     * This object represents diagram. Diagram can contain items - items are nodes and lines.
     *
     * Diagram is responsible for tracking of item's identity - it assigns them `id` property, which is unique
     * within diagram.
     *
     * Diagram implements _Observer_ pattern, you can use `itemAdded` and `itemRemoved` methods to track changes
     * in diagram.
     * FIXME: Note that to track changes within individual items, you have to use their observer interface.
     *
     */
    return function () {

        var that = {},
            items = [],
            onItemAddedHandlers = [],
            onItemRemovedHandlers = [],
            changeEventsEnabled = true,
            lastId = 0;

        /**
         * Adds item to the diagram and assigns it an `id`.
         *
         * @param item
         */
        that.addItem = function (item) {
            if (!item.isLine && !item.isNode) {
                throw new Error("Only nodes and lines can be added to diagram");
            }

            item.id = ++lastId;

            if (item.isLine) {
                item.points().forEach(function (point) {
                    point.id = ++lastId;
                });
            }

            items.push(item);
            if (changeEventsEnabled) {
                that.fireItemAdded(item);
            }
        };

        /**
         * Removes item from the diagram.
         *
         * @param item
         */
        that.removeItem = function (item) {
            if (!item.isLine && !item.isNode) {
                throw new Error("Only nodes and lines can be removed from diagram");
            }

            var i = items.indexOf(item);
            if (i === -1) {
                throw new Error("Item '{itemId}' not found in diagram.".supplant({itemId: item.id}));
            }

            // remove item's connection before removing it from diagram
            item.disconnect();

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

        /**
         * Remove all items from the diagram.
         */
        that.clear = function () {
            var removed;
            while (removed = items.pop()) {
                if (changeEventsEnabled) {
                    that.fireItemRemoved(removed);
                }
            }
        };

        /**
         * Returns all items in the diagram.
         *
         * @return {Array}
         */
        that.items = function () {
            return items;
        };

        /**
         * This function allows you to enable or disable firing of change events.
         * If no `value` is provided, it returns whether change events are enabled.
         *
         * @param value
         * @return {Boolean}
         */
        that.changeEventsEnabled = function (value) {
            if (arguments.length === 0) {
                return changeEventsEnabled;
            } else {
                changeEventsEnabled = value;
            }
        };

        /**
         * Binds an event handler to the `itemAdded` event.
         *
         * @param handler   Function to call when an item is added to the diagram.
         */
        that.itemAdded = function (handler) {
            onItemAddedHandlers.push(handler);
        };

        /**
         * Binds an event handler to the `itemRemoved` event.
         *
         * @param handler   Function to call when an item is removed from the diagram.
         */
        that.itemRemoved = function (handler) {
            onItemRemovedHandlers.push(handler);
        };

        /**
         * Fires the `itemAdded` event. You want to use this typically when you have disabled change events to do several
         * changes at once and now want to notify observers about these changes.
         *
         * @param item  Item which has been added to the diagram.
         */
        that.fireItemAdded = function (item) {
            onItemAddedHandlers.forEach(function (handler) {
                handler(that, item);
            });
        };

        /**
         * Fires the `itemRemoved` event. You want to use this typically when you have disabled change events to do several
         * changes at once and now want to notify observers about these changes.
         *
         * @param item  Item which has been removed from the diagram.
         */
        that.fireItemRemoved = function (item) {
            onItemRemovedHandlers.forEach(function (handler) {
                handler(that, item);
            });
        };

        /**
         * Returns JSON representation of the diagram.
         *
         * @return {String}
         */
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
