var WIKIDIA = WIKIDIA || {};
WIKIDIA.utils = WIKIDIA.utils || {};

(function () {
    "use strict";

    var module = WIKIDIA.utils;

    module.objectWithId = function f () {
        if (!f.lastId) {
            f.lastId = 0;
        }
        f.lastId++;
        return {oid: f.lastId};
    };

    module.specValidator = function (spec) {
        var specToValidate = module.copyShallow(spec);
        // create new spec
        spec = {};
        return {
            default: function (name) {
                if (Object.keys(spec).length !== 0) {
                    throw new Error("default should be called as first.");
                }

                if (Object.keys(specToValidate).length === 0) {
                    // spec does not have any properties, treat it as primitive value
                    specToValidate[name] = spec;
                }
                return this;
            },
            required: function (name) {
                if (specToValidate[name] === undefined) {
                    throw new Error("Required property '{name}' not set.".supplant({name: name}));
                }
                spec[name] = specToValidate[name];
                delete specToValidate[name];
                return this;
            },
            optional: function (name, defaultValue) {
                spec[name] = specToValidate[name];
                delete specToValidate[name];
                return this;
            },
            validate: function () {
                if (Object.keys(specToValidate).length !== 0) {
                    throw new Error("Unexpected spec properties: " + Object.keys(specToValidate));
                }
                return spec;
            }
        }
    }


    // TODO: testy pro tyhle dva, navic bych rekl ze s private vars to nebude fungovat, prozkoumat
    module.copyShallow = function (object) {
        return jQuery.extend({}, object);
    };

    module.copyDeep = function (object) {
        return jQuery.extend(true, {}, object);
    };


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

})();