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
    function Diagram() {
        this._items = [];
        this._onItemAddedHandlers = [];
        this._onItemRemovedHandlers = [];
        this._changeEventsEnabled = true;
        this._lastId = 0;
    }

    /**
     * Adds item to the diagram and assigns it an `id`.
     *
     * @param item
     */
    Diagram.prototype.addItem = function (item) {
        if (!item.isLine && !item.isNode) {
            throw new Error("Only nodes and lines can be added to diagram");
        }

        item.id = ++this._lastId;

        if (item.isLine) {
            var that = this;
            item.points().forEach(function (point) { // TODO: put to line via some generic callback?
                point.id = ++that._lastId;
            });
        }

        this._items.push(item);
        if (this._changeEventsEnabled) {
            this.fireItemAdded(item);
        }
    };

    /**
     * Removes item from the diagram.
     *
     * @param item
     */
    Diagram.prototype.removeItem = function (item) {
        if (!item.isLine && !item.isNode) {
            throw new Error("Only nodes and lines can be removed from diagram");
        }

        var i = this._items.indexOf(item);
        if (i === -1) {
            throw new Error("Item '{itemId}' not found in diagram.".supplant({itemId: item.id}));
        }

        // remove item's connection before removing it from diagram
        item.disconnect();

        this._items.splice(i, 1);
        item.id = null;

        if (item.isLine) {
            item.points().forEach(function (point) {
                point.id = null;
            });
        }

        if (this._changeEventsEnabled) {
            this.fireItemRemoved(item);
        }
    };

    /**
     * Returns all items in the diagram.
     *
     * @return {Array}
     */
    Diagram.prototype.items = function () {
        return this._items;
    };

    // TODO: proc fce? ted uz vypada trochu zbytecne
    /**
     * This function allows you to enable or disable firing of change events.
     * If no `value` is provided, it returns whether change events are enabled.
     *
     * @param value
     * @return {Boolean}
     */
    Diagram.prototype.changeEventsEnabled = function (value) {
        if (arguments.length === 0) {
            return this._changeEventsEnabled;
        } else {
            this._changeEventsEnabled = value;
        }
    };

    /**
     * Binds an event handler to the `itemAdded` event.
     *
     * @param handler   Function to call when an item is added to the diagram.
     */
    Diagram.prototype.itemAdded = function (handler) {
        this._onItemAddedHandlers.push(handler);
    };

    /**
     * Binds an event handler to the `itemRemoved` event.
     *
     * @param handler   Function to call when an item is removed from the diagram.
     */
    Diagram.prototype.itemRemoved = function (handler) {
        this._onItemRemovedHandlers.push(handler);
    };

    /**
     * Fires the `itemAdded` event. You want to use this typically when you have disabled change events to do several
     * changes at once and now want to notify observers about these changes.
     *
     * @param item  Item which has been added to the diagram.
     */
    Diagram.prototype.fireItemAdded = function (item) {
        var that = this;
        this._onItemAddedHandlers.forEach(function (handler) {
            handler(that, item);
        });
    };

    /**
     * Fires the `itemRemoved` event. You want to use this typically when you have disabled change events to do several
     * changes at once and now want to notify observers about these changes.
     *
     * @param item  Item which has been removed from the diagram.
     */
    Diagram.prototype.fireItemRemoved = function (item) {
        var that = this;
        this._onItemRemovedHandlers.forEach(function (handler) {
            handler(that, item);
        });
    };

    /**
     * Returns JSON representation of the diagram.
     *
     * @return {String}
     */
    Diagram.prototype.toJSON = function () {
        var json = "[";
        var that = this;
        this._items.forEach(function (item, index) {
            json += item.toJSON();
            if (index < that._items.length - 1) {
                json += ", ";
            }
        });
        json += "]";
        return json;
    };

    return function () {
        return new Diagram();
    }
});
