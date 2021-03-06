define(function (require) {
    "use strict";

    if (!String.prototype.supplant) {
        String.prototype.supplant = function (o) {
            return this.replace(/\{([^\{\}]*)\}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        };
    }

    return {

        objectWithId: function f () {
            if (!f.lastId) {
                f.lastId = 0;
            }
            f.lastId++;
            return {oid: f.lastId};
        },

        /**
         * Adds observable property to an object. It expects that object implements
         * two functions:
         * - fireChange() - called when change is detected
         * - changeEventsEnabled() - called to decide whether to fire change event or not
         *
         * Also note that it stores property values in new properties starting with __.
         *
         * @param object
         * @param propertyName
         * @param initialValue
         */
        addObservableProperty: function (object, propertyName, initialValue) {
            Object.defineProperty(object, propertyName, {
                    get:function () {
                        return object["__" + propertyName];
                    },
                    set:function (value) {
                        var oldValue = object["__" + propertyName];
                        object["__" + propertyName] = value;
                        if (value !== oldValue && object.changeEventsEnabled()) {
                            // value changed, fire change event
                            object.fireChange();
                        }
                    }
            });

            object["__" + propertyName] = initialValue;
        },

        copyShallow: function (object) {
            return jQuery.extend({}, object);
        },

        copyDeep: function (object) {
            return jQuery.extend(true, {}, object);
        }

};

});