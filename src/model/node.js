var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.node = function (spec) {
    "use strict";

    var DEFAULT_SIZE = 100;

    var that = {},
        observableProperties = {},
        onChangeHandlers = [];

    // TODO: how fast will this be compared to function call and simple property access?
    function addObservableProperty(propertyName, defaultValue) {
        Object.defineProperty(that, propertyName, {
            get: function () {
                return observableProperties[propertyName];
            },
            set: function (value) {
                var oldValue = observableProperties[propertyName];
                if (value !== oldValue && that.changeEventEnabled) {
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
    addObservableProperty("x", spec.x || 0);
    addObservableProperty("y", spec.y || 0);
    addObservableProperty("width", spec.width || DEFAULT_SIZE);
    addObservableProperty("height", spec.height || DEFAULT_SIZE);

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
    that.changeEventEnabled = true;

    /**
     * Fires  change event. You want to use this typically when you disabled change events to do several changes
     * and now want to notify observers about changes.
     */
    that.fireChange = function () {
        onChangeHandlers.forEach(function (handler) {
            handler(that);
        });
    };

    return that;
};
