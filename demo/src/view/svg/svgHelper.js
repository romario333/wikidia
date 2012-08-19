/*global SVGElement*/

define(function(require) {
    "use strict";

    var NS_SVG = "http://www.w3.org/2000/svg";

    return {
        createSvgElement: function (tagName, attributes) {
            var el = $(document.createElementNS(NS_SVG, tagName));
            if (attributes) {
                el.attr(attributes);
            }
            return el;
        },

        pathBuilder: function() {
            var el = this.createSvgElement("path");
            var pathData = "";
            return {
                moveTo: function (x, y) {
                    pathData += "M {x} {y} ".supplant({x: x, y: y});
                    return this;
                },
                lineTo: function (x, y) {
                    pathData += "L {x} {y} ".supplant({x: x, y: y});
                    return this;
                },
                closePath: function () {
                    pathData += "z ";
                    return this;
                },
                attr: function (attributes) {
                    el.attr(attributes);
                    return this;
                },
                create: function () {
                    el.attr("d", pathData);
                    return el;
                }
            };
        },

        /**
         * Prints SVG to string. It's not 100% valid SVG though, use only for debug purposes and tests.
         *
         * @param elements
         */
        printSvg: function (elements) {
            var svg = "", i;

            if (elements.length) {

                // access via index will work for both arrays and jQuery collections
                for (i = 0; i < elements.length; i++) {
                    svg += this.printSvg(elements[i]);
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
                    svg += this.printSvg(element.childNodes[i]);
                }

                svg += "</" + element.tagName + ">";

            }

            return svg;
        }
    };
});
