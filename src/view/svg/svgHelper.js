/*global SVGElement*/

var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};

WIKIDIA.view.svg.svgHelper = {};

(function () {
    "use strict";

    var module = WIKIDIA.view.svg.svgHelper;

    var NS_SVG = "http://www.w3.org/2000/svg";

    module.createSvgElement = function (tagName, attributes) {
        var el = $(document.createElementNS(NS_SVG, tagName));
        if (attributes) {
            el.attr(attributes);
        }
        return el;
    };

    /**
     * Prints SVG to string. It's not 100% valid SVG though, use only for debug purposes and tests.
     *
     * @param elements
     */
    module.printSvg = function (elements) {
        var svg = "", i;

        if (elements.length) {

            // access via index will work for both arrays and jQuery collections
            for (i = 0; i < elements.length; i++) {
                svg += module.printSvg(elements[i]);
            }

        } else {

            var element = elements;

            if (!(element instanceof SVGElement)) {
                throw new Error("'{element}' is not a SVG element.".supplant({element: element}));
            }

            svg = "<" + element.tagName;

            var attr;
            for (i = 0; i < element.attributes.length; i++) {
                attr = element.attributes[i];
                svg += ' {name}=\"{value}\"'.supplant(attr);
            }
            svg += ">";

            for (i = 0; i < element.childNodes.length; i++) {
                svg += module.printSvg(element.childNodes[i]);
            }

            svg += "</" + element.tagName + ">";

        }

        return svg;
    };

})();
