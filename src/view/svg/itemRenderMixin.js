define(function(require) {
    "use strict";

    var svgHelper = require("./svgHelper");

    /**
     * `itemRenderMixin` contains render operations available for diagram items (nodes and lines).
     * This function applies the mixin - that is it add these operations to the target object.
     *
     * @param target    The target object to which render operations will be added.
     * @param content   SVG element representing the content of the item.
     */
    return function itemRenderMixin(target, content) {
        /**
         * Clears content of the node. It's typically called as the first thing by renderer when it's going to update
         * node contents.
         */
        target.clear = function () {
            content.empty();
        };

        /**
         * Draws a rectangle.
         *
         * @param spec.x        The x-axis coordinate of the upper left corner of the rectangle.
         * @param spec.y        The y-axis coordinate of the upper left corner of the rectangle.
         * @param spec.width
         * @param spec.height
         * @param spec.rx       For rounded rectangles, the x-axis radius of the ellipse used to round off the corners of the rectangle.
         * @param spec.ry       For rounded rectangles, the y-axis radius of the ellipse used to round off the corners of the rectangle.
         * @param spec.fill     Fill color.
         * @param spec.stroke   Stroke color.
         */
        target.rect = function (spec) {
            var el = svgHelper.createSvgElement("rect", spec);
            content.append(el);
        };

        /**
         * Draws a line.
         *
         * @param spec.x1
         * @param spec.y1
         * @param spec.x2
         * @param spec.y2
         * @param spec.stroke   Stroke color.
         */
        target.line = function (spec) {
            var el = svgHelper.createSvgElement("line", spec);
            content.append(el);
        };

        /**
         * Draws a circle.
         *
         * @param spec.cx       The x-axis coordinate of the center of the circle.
         * @param spec.cy       The y-axis coordinate of the center of the circle.
         * @param spec.r        The radius of the circle.
         * @param spec.fill     Fill color.
         * @param spec.stroke   Stroke color.
         */
        target.circle = function (spec) {
            var el = svgHelper.createSvgElement("circle", spec);
            content.append(el);
        };

        /**
         * Draws an ellipse
         *
         * @param spec.cx       The x-axis coordinate of the center of the ellipse.
         * @param spec.cy       The y-axis coordinate of the center of the ellipse.
         * @param spec.rx       The x-axis radius of the ellipse.
         * @param spec.ry       The y-axis radius of the ellipse.
         * @param spec.fill     Fill color.
         * @param spec.stroke   Stroke color.
         */
        target.ellipse = function (spec) {
            var el = svgHelper.createSvgElement("ellipse", spec);
            content.append(el);
        };

        /**
         * Draws a text. Only single line text is supported, any `\n` will be ignored.
         *
         * @param spec.x        The x-axis coordinate of the upper left corner of the text.
         * @param spec.y        The y-axis coordinate of the upper left corner of the text.
         * @param spec.text     The text to render.
         * @return {Object}     Size of the rendered text.
         */
        target.text = function (spec) {
            var textElement = createTextElement(spec);
            content.append(textElement);
            var bBox = textElement[0].getBBox();
            return {
                width: bBox.width,
                height: bBox.height
            };
        };

        /**
         * Measures a text without rendering.
         *
         * @param spec.x        The x-axis coordinate of the upper left corner of the text.
         * @param spec.y        The y-axis coordinate of the upper left corner of the text.
         * @param spec.text     The text to render.
         * @return {Object}     Size of the rendered text.
         */
        target.measureText = function (spec) {
            var textElement = createTextElement(spec);
            // add text temporarily to the document so we can get its size
            content.append(textElement);
            var bBox = textElement[0].getBBox();
            var textSize = {
                width:  bBox.width,
                height: bBox.height
            };
            textElement.remove();
            return textSize;
        };

        function createTextElement(spec) {
            var textElement = svgHelper.createSvgElement("text", {
                x: spec.x || 0,
                y: spec.y || 0,
                'dominant-baseline': 'text-before-edge'
            });
            textElement.text(spec.text);
            return textElement;
        }

        target.path = function (spec) {
            var pathBuilder = svgHelper.pathBuilder();
            pathBuilder.attr(spec);

            return {
                moveTo: function (x, y) {
                    pathBuilder.moveTo(x, y);
                    return this;
                },
                lineTo: function (x, y) {
                    pathBuilder.lineTo(x, y);
                    return this;
                },
                closePath: function () {
                    pathBuilder.closePath();
                    return this;
                },
                done: function () {
                    content.append(pathBuilder.create());
                }
            };
        };
    };
});