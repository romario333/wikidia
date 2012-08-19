define(function (require) {
    "use strict";

    /**
     * @constructor
     *
     * This object represents a generic item in diagram. It serves as a base
     * implementation for concrete items (`node`, `line`, `linePoint`). Every item has `text` and `kind`
     * property.
     *
     * Item implements _Observer_ pattern, you can subscribe to change events, disable them temporarily
     * and fire them.
     *
     * Item can be connected to other items - it keeps array of its connections. Note that connections are
     * bi-directional, meaning that item on the other side of connections keeps reference to this item too.
     *
     */
    return function () {

        var utils = require("utils");

        var that = utils.objectWithId(),
            connections = [],
            onChangeHandlers = [],
            changeEventsEnabled = true;

        /**
         * Id of item in diagram. It should be unique within diagram and only diagram should set it.
         */
        that.id = null;

        /**
         * Binds an event handler to the `change` event. This handler is called when any property
         * is changed. You can disable firing of this event by `changeEventsEnabled()` function.
         *
         * @param handler   Function which will be called when something changes in item.
         */
        that.change = function (handler) {
            onChangeHandlers.push(handler);
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
         * Fires a change event. You want to use this typically when you have disabled change events to do several
         * changes at once and now want to notify observers about these changes.
         */
        that.fireChange = function () {
            onChangeHandlers.forEach(function (handler) {
                handler(that);
            });
        };

        that._addConnection = function (item) {
            if (!item.id) {
                throw new Error("Cannot add connection to item, it has no id set.");
            }

            connections.push(item);

            if (that.changeEventsEnabled()) {
                that.fireChange();
            }
        };

        /**
         * Adds connection to the specified item. Note that connections are bi-directional, you don't have to
         * call `removeConnection` on the other item.
         *
         * @param item Item to which this item will be connected.
         */
        that.addConnection = function (item) {
            that._addConnection(item);
            item._addConnection(that);
        };

        that._removeConnection = function (item) {
            var i = connections.indexOf(item);
            if (i === -1) {
                throw new Error("Item '{itemId}' not found in connections of item '{thisId}'.".supplant({itemId:item.id, thisId: that.id}));
            }
            connections.splice(i, 1);

            if (that.changeEventsEnabled()) {
                that.fireChange();
            }
        };

        /**
         * Removes connection to the specified item. Note that connections are bi-directional, you don't have to
         * call `removeConnection` on the other item.
         *
         * @param item Item from which we want to disconnect.
         */
        that.removeConnection = function (item) {
            that._removeConnection(item);
            item._removeConnection(that);
        };

        /**
         * Returns all items to which this item is connected.
         *
         * @return {*}
         */
        that.connections = function () {
            if (arguments.length === 1) {
                return connections[arguments[0]];
            } else {
                return connections.slice();
            }
        };

        /**
         * Disconnect this item from any other items.
         */
        that.disconnect = function () {
            that.connections().forEach(function (connection) {
                that.removeConnection(connection);
            });
        };

        that._test = {
            onChangeHandlers:onChangeHandlers
        };

        return that;
    };
});
