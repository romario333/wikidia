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

        // TODO: testy pro tyhle dva, navic bych rekl ze s private vars to nebude fungovat, prozkoumat
        copyShallow: function (object) {
            return jQuery.extend({}, object);
        },

        copyDeep: function (object) {
            return jQuery.extend(true, {}, object);
        }

    };

});