define(function (require) {
    "use strict";

    return function (spec) {

        var utils = require("utils");

        var that = utils.objectWithId(),
            observableProperties = {},
            connections = [],
            onChangeHandlers = [],
            changeEventsEnabled = true;

        /**
         * Id of item in diagram. It should be unique within diagram and only diagram should set it.
         */
        that.id = null;

        /**
         * Binds an event handler to the "change" event. This handler is called when any property
         * is changed. You can disable firing of this event using {@link that.changeEventsEnabled} function.
         *
         * @param handler
         */
        that.change = function (handler) {
            onChangeHandlers.push(handler);
        };


        that.changeEventsEnabled = function (value) {
            if (arguments.length === 0) {
                return changeEventsEnabled;
            } else {
                changeEventsEnabled = value;
            }
        };

        /**
         * Fires  change event. You want to use this typically when you disabled change events to do several changes
         * and now want to notify observers about changes.
         */
        that.fireChange = fireChange;

        function fireChange() {
            onChangeHandlers.forEach(function (handler) {
                handler(that);
            });
        }

        that._addConnection = function (item) {
            if (!item.id) {
                throw new Error("Cannot add connection to item, it has no id set.");
            }

            connections.push(item);

            if (changeEventsEnabled) {
                fireChange();
            }
        };

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

            if (changeEventsEnabled) {
                fireChange();
            }
        };

        that.removeConnection = function (item) {
            that._removeConnection(item);
            item._removeConnection(that);
        };

        that.connections = function () {
            if (arguments.length === 1) {
                return connections[arguments[0]];
            } else {
                return connections.slice();
            }
        };

        that._addObservableProperty = function (propertyName, defaultValue) {
            Object.defineProperty(that, propertyName, {
                get:function () {
                    return observableProperties[propertyName];
                },
                set:function (value) {
                    var oldValue = observableProperties[propertyName];
                    if (value !== oldValue && changeEventsEnabled) {
                        // value changed, fire change event
                        fireChange();
                    }
                    observableProperties[propertyName] = value;
                }
            });

            observableProperties[propertyName] = defaultValue;
        };


        that._test = {
            onChangeHandlers:onChangeHandlers
        };

        return that;
    };
});
