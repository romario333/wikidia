var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    WIKIDIA.modules = WIKIDIA.modules || {};
    var module = WIKIDIA.modules.svg = {};

    var NS_SVG = "http://www.w3.org/2000/svg";

    var svgElement = module.svgElement = function (element) {
        var that = {}, // public interface
            mElement;

        function init(element) {
            if (element) {
                mElement = element;
            } else {
                mElement = createSvgElement("svg");
            }
        }

        init(element);

        function createSvgElement(tagName, attrs) {
            var element = $(document.createElementNS(NS_SVG, tagName));
            if (attrs) {
                element.attr(attrs);
            }
            return element;
        }

        that.element = mElement;

        function group(attrs) {
            var element = createSvgElement("g", attrs);
            mElement.append(element);
            return svgElement(element);
        }
        that.group = group;

        function rect(attrs) {
            var element = createSvgElement("rect", attrs);
            mElement.append(element);
            return svgElement(element);
        }
        that.rect = rect;

        function text(attrs) {
            /* samples of possible aligns:

            top-left corner is [0,0]
            <text x="0" y="0" text-anchor="start" dominant-baseline="text-before-edge">

            [0,0] is in the middle
            <text x="0" y="0" text-anchor="middle" dominant-baseline="central">
            TODO: mozna spis alignment-baseline?


            and more... http://www.w3.org/TR/SVG/text.html#AlignmentProperties

             */

            var textContent = "";
            if (attrs.text) {
                textContent = attrs.text;
                delete attrs.text;
            }

            var element = createSvgElement("text", attrs);
            element.text(textContent);

            mElement.append(element);
            return svgElement(element);
        }
        that.text = text;

        function clear() {
            mElement.empty();
        }
        that.clear = clear;

        return that;
    };


})(this);
