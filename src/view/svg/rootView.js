define(function(require) {
    "use strict";

    return function (container) {
        var parent = require("./viewBase");
        var svgHelper = require("./svgHelper");

        var element = $(svgHelper.createSvgElement("svg"));
        var that = parent(element);

        container.append(element);

        that._test = {
            svg: function () {
                return svgHelper.printSvg(element);
            }
        };

        return that;
    };
});