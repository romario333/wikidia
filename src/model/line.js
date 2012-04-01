var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.line = function (spec) {
    "use strict";

    var utils = WIKIDIA.utils;

    var connections = [],
        onChangeHandlers = [];

    // inner constructor (I need this to support cloning)
    function lineInner(spec, connections, onChangeHandlers) {
        var that = WIKIDIA.model.item(),
            observableProperties = {};

        // TODO: DRY
        function addObservableProperty(propertyName, defaultValue) {
            Object.defineProperty(that, propertyName, {
                get: function () {
                    return observableProperties[propertyName];
                },
                set: function (value) {
                    var oldValue = observableProperties[propertyName];
                    if (value !== oldValue && that.changeEventsEnabled) {
                        // value changed, fire change event
                        that.fireChange();
                    }
                    observableProperties[propertyName] = value;
                }
            });

            observableProperties[propertyName] = defaultValue;
        }

        spec = spec || {};

        addObservableProperty("text", spec.text || "");
        addObservableProperty("x1", spec.x1 || 0);
        addObservableProperty("y1", spec.y1 || 0);
        addObservableProperty("x2", spec.x2 || 0);
        addObservableProperty("y2", spec.y2 || 0);
        addObservableProperty("kind", spec.kind || "line");

        // TODO: DRY (a pokud nebudu pouzivat, tak pryc)
        /**
         * Binds an event handler to the "change" event. This handler is called when any property
         * is changed. You can disable firing of this event using {@link that.changeEventEnabled} property.
         *
         * @param handler
         */
        that.change = function (handler) {
            onChangeHandlers.push(handler);
        };

        /**
         * If true, change events are fired.
         */
        that.changeEventsEnabled = true;

        /**
         * Fires  change event. You want to use this typically when you disabled change events to do several changes
         * and now want to notify observers about changes.
         */
        that.fireChange = function () {
            onChangeHandlers.forEach(function (handler) {
                handler(that);
            });
        };

        // TODO: this method should be shared only by line and node
        that._addConnection = function (item) {
            if (!item.id) {
                throw new Error("Cannot add connection to item, it has no id set.");
            }

            connections.push(item);

            if (that.changeEventsEnabled) {
                that.fireChange();
            }
        };

        that.addConnection = function (item) {
            that._addConnection(item);
            item._addConnection(that);
        };


        that._removeConnection = function (item) {
            var i = connections.indexOf(item);
            if (i === -1) {
                throw new Error("Item '{item}' not found in connections.".supplant({item: item}));
            }
            connections.splice(i, 1);

            if (that.changeEventsEnabled) {
                that.fireChange();
            }
        };

        that.removeConnection = function (item) {
            that._removeConnection(item);
            item._removeConnection(that);
        };

        that.connections = function () {
            // TODO: how to enforce addConnection for connections manipulation?
            return connections;
        };

        that.copyShallow = function () {
            var connectionsCopy = connections.slice();
            var onChangeHandlersCopy = onChangeHandlers.slice();
            return lineInner(observableProperties, connectionsCopy, onChangeHandlersCopy);
        };

        that.isLine = true;

        that._test = {
            onChangeHandlers: onChangeHandlers
        };

        return that;
    }

    return lineInner(spec, connections, onChangeHandlers);
};
