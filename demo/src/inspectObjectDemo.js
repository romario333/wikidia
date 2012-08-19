define(function(require, exports, module) {
    "use strict";

    var AUTO_LAYOUT_DEBUG = false;

    var model = require("model");
    var view = require("view");
    var diagramPresenter = require("presenter/diagramPresenter");

    if ( !window.requestAnimationFrame ) {

        window.requestAnimationFrame = ( function() {

            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

                    window.setTimeout( callback, 1000 / 60 );

                };

        } )();

    }

    $(document).ready(function () {

        $("#demo").height($(document).height());

        var diagram = model.diagram();
        window.diagram = diagram;

        var presenter = diagramPresenter(diagram, $("#diagram"), $("#nodeEdit"));

        var diagramWidth = presenter.diagramSize().width - $("#controlPanel").width();
        var diagramHeight = presenter.diagramSize().height;

        $("#autoLayout").click(function () {
            autoLayout();
        });

        $("#pushArrows").click(function () {
            pushArrowsToNodeBoundaries();
        });

        $("#inspect").click(function () {
            var code = $("#codeToInspect").val();
            var f = Function(code);
            var o = f();

            diagram.clear();

            inspect(o);
            autoLayout();
            if (!AUTO_LAYOUT_DEBUG) {
                pushArrowsToNodeBoundaries();
            }
        });

        var visitedObjects = [], objNodes = {}, lastObjId = 0;
        function inspect(o) {
            inspectInner(o);

            // reset to initial state
            var obj;
            while (obj = visitedObjects.pop()) {
                delete obj._inspectOid;
            }
            objNodes = {};
            lastObjId = 0;
        }

        function inspectInner(o) {
            if (o.hasOwnProperty("_inspectOid")) {
                // already inspected, skip it
                return objNodes[o._inspectOid];
            }

            visitedObjects.push(o);

            var objectNode = model.node({kind: "class"});
            diagram.addItem(objectNode);

            o._inspectOid = ++lastObjId;
            objNodes[o._inspectOid] = objectNode;

            var text = getObjectName(o);
            text += "\n--\n";
            var attributes = [], operations = [];

            Object.keys(o).forEach(function (prop) {
                if (prop === "_inspectOid") {
                    return;
                }
                var value = o[prop];
                if (value instanceof Function) {
                    operations.push(prop + "()");
                } else if (value instanceof Object) {
                    var childNode = inspectInner(o[prop]);
                    connect(childNode, objectNode, "{{lineType=-<>}}\n" + prop);
                } else {
                    var attr = prop + ": ";
                    if (o[prop] === undefined) {
                        attr += "undefined";
                    } else if (o[prop] === null) {
                        attr += "null";
                    } else {
                        attr += o[prop].toString();
                    }
                    attributes.push(attr);
                }
            });

            text += attributes.join("\n");
            if (operations.length > 0) {
                text += "\n--\n" + operations.join("\n");
            }

            objectNode.text = text;
            presenter.fitContent(objectNode);

            var proto = Object.getPrototypeOf(o);
            if (proto) {
                var protoNode = inspectInner(proto);
                connect(objectNode, protoNode, "{{lineType=->>}}");
            }

            return objectNode;
        }

        function getObjectName(o) {
            if (o === Object.prototype) {
                return "Object.prototype";
            }
            if (o.constructor) {
                var name = o.constructor.name;
                if (o.constructor.prototype === o) {
                    name += ".prototype";
                }
                return name;
            }
            return "???";
            // o.constructor ? o.constructor.name : "???"
        }

        function connect(node1, node2, text) {
            var n1c = nodeCenter(node1);
            var n2c = nodeCenter(node2);

            var line = model.line({x1: n1c.x, y1: n1c.y, x2: n2c.x, y2: n2c.y});
            line.text = text;
            diagram.addItem(line);

            line.points(0).addConnection(node1);
            line.points(1).addConnection(node2);

            function nodeCenter(node) {
                return {
                    x: Math.floor(node.x + (node.width / 2)),
                    y: Math.floor(node.y + (node.height / 2))
                }
            }
        }

        function autoLayout() {

            var iteration = 0;
            var ITERATION_COUNT = 30;

            var nodes = diagram.items().filter(function (item) {return item.isNode;});

            var vertices = [];
            var verticesById = {};
            var nextInitPos = initPosGenerator(diagramWidth, diagramHeight);
            nodes.forEach(function (node) {
                var initPos = nextInitPos();
                node.moveTo(initPos.x, initPos.y);

                var v = {
                    node: node,
                    x: node.x,
                    y: node.y,
                    size: Math.max(node.width, node.height),
                    velocity: {x: 0, y: 0},
                    edges: []
                };
                vertices.push(v);
                verticesById[node.id] = v;

                if (AUTO_LAYOUT_DEBUG) {
                    console.log("Created vertex at [" + v.x + ", " + v.y + "]");
                }
            });
            vertices.forEach(function (v) {
                v.node.connections().forEach(function (c) {
                    var otherNode = c.line.points(0).connections(0) === v.node ? c.line.points(1).connections(0) : c.line.points(0).connections(0);
                    if (otherNode) {
                        v.edges.push(verticesById[otherNode.id]);
                    }
                });
            });

            if (AUTO_LAYOUT_DEBUG) {
                requestAnimationFrame(iterationFun);
            } else {
                iterationFun();
            }

            function iterationFun() {
                iteration++;

                if (AUTO_LAYOUT_DEBUG) {
                    console.log("ITERATION " + iteration);
                }

                vertices.forEach(function (v1) {

                    var netForce = {x: 0, y: 0};

                    // for each other node
                    vertices.forEach(function (v2) {
                        if (v1 !== v2) {
                            netForce = add(netForce, repulsion(v1, v2));
                        }
                    });

                    // for each spring connected to this item
                    v1.edges.forEach(function (v2) {
                        netForce = add(netForce, springAttraction(v1, v2));
                    });

                    // TODO: quick hack, sometimes net force fires away to very large numbers
                    if (Math.abs(netForce.x) > 50) {
                        netForce.x = netForce.x > 0 ? 50 : -50;
                    }
                    if (Math.abs(netForce.y) > 50) {
                        netForce.y = netForce.y > 0 ? 50 : -50;
                    }

                    v1.x += Math.floor(netForce.x);
                    v1.y += Math.floor(netForce.y);

                    if (AUTO_LAYOUT_DEBUG) {
                        console.log(v1.node.id + ": <" + netForce.x + ", " + netForce.y + ">");
                        v1.node.moveTo(v1.x, v1.y);
                    }
                });

                if (AUTO_LAYOUT_DEBUG) {
                    console.log("");
                }

                if (iteration < ITERATION_COUNT) {
                    if (AUTO_LAYOUT_DEBUG) {
                        requestAnimationFrame(iterationFun);
                    } else {
                        iterationFun();
                    }
                } else {
                    // we are finished, set new positions for nodes
                    vertices.forEach(function (v) {
                        v.node.moveTo(v.x, v.y);
                    });
                }
            }

            function repulsion(v1, v2) {
                var C1 = 1;

                var dist = distance(v1, v2);
                if (dist === 0) {
                    dist = 1;
                }
                var r = C1 / Math.sqrt(dist);
                var result = subtract(v2, v1);
                if (result.x === 0) result.x = 1;
                if (result.y === 0) result.y = 1;
                result.x = r * result.x * -1;
                result.y = r * result.y * -1;

                return result;
            }

            function springAttraction(v1, v2) {
                var C2 = 1;
                var springLength = ( (v1.size + v2.size) / 2 ) + 100;

                var dist = distance(v1, v2);
                if (dist === 0) {
                    dist = springLength / 10;
                }
                var a = C2 * Math.log(dist / springLength);
                var result = subtract(v2, v1);
                if (result.x === 0) result.x = 1;
                if (result.y === 0) result.y = 1;
                result.x = a * result.x;
                result.y = a * result.y;

                return result;
            }

            function add(v1, v2) {
                return {
                    x: v1.x + v2.x,
                    y: v1.y + v2.y
                }
            }

            function subtract(v1, v2) {
                return {
                    x: v1.x - v2.x,
                    y: v1.y - v2.y
                }
            }

            function distance(v1, v2) {
                return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
            }

            function initPosGenerator(maxWidth, maxHeight) {

                var STEP = 100;
                var x = 2*STEP, y = 3*STEP;

                return function () {
                    x += STEP;
                    if (x > maxWidth) {
                        x = 0;
                        y += STEP;
                    }
                    if (y > maxHeight) {
                        y = 0;
                    }
//                    x = Math.round(Math.random() * maxWidth);
//                    y = Math.round(Math.random() * maxHeight);

                    return {
                        x: x,
                        y: y
                    }
                };
            }
        }

        function pushArrowsToNodeBoundaries() {
            var lines = diagram.items().filter(function (item) {return item.isLine;});

            lines.forEach(function (line) {
                var node1 = line.points(0).connections(0);
                var node2 = line.points(1).connections(0);

                var c2cLine = {x1: line.points(0).x, y1: line.points(0).y, x2: line.points(1).x, y2: line.points(1).y};
                var node1Point = lineRectIntersections(c2cLine, node1)[0];
                var node2Point = lineRectIntersections(c2cLine, node2)[0];

                line.points(0).x = node1Point.x;
                line.points(0).y = node1Point.y;
                line.points(1).x = node2Point.x;
                line.points(1).y = node2Point.y;

                // TODO: interesting, why do I have to do this manually?
                line.fireChange();
            });


            function lineRectIntersections(line, rect) {
                var intersections = [];

                var borders = [
                    {x1: rect.x, y1: rect.y, x2: rect.x + rect.width, y2: rect.y},
                    {x1: rect.x + rect.width, y1: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height},
                    {x1: rect.x + rect.width, y1: rect.y + rect.height, x2: rect.x, y2: rect.y + rect.height},
                    {x1: rect.x, y1: rect.y + rect.height, x2: rect.x, y2: rect.y}
                ];

                borders.forEach(function (border) {
                    var i = lineLineIntersection(line, border);
                    if (i !== null && i.x >= rect.x && i.x <= rect.x + rect.width && i.y >= rect.y && i.y <= rect.y + rect.height) {
                        intersections.push(i);
                    }
                });

                return intersections;
            }

            // line-line intersection based on Slope–intercept form of linear equation
            function lineLineIntersection(line1, line2) {
                var m1 = lineSlope(line1);
                var b1 = lineYIntercept(line1, m1);

                var m2 = lineSlope(line2);
                var b2 = lineYIntercept(line2, m2);

                if (m1 === m2) {
                    // same slope, they have either no intersection or infinity of them
                    return null;
                }

                var result = {};

                if (m1 === null || m2 === null) {
                    // one of the lines is vertical
                    // get slope and y-intercept of non-vertical line
                    var m = m1 === null ? m2 : m1;
                    var b = m1 === null ? b2 : b1;

                    result.x = m1 === null ? line1.x1 : line2.x2; // get x from vertical line
                    result.y = m * result.x + b;
                } else {
                    result.x = (b2 - b1) / (m1 - m2);
                    result.y = m1 * result.x + b1;
                }
                result.x = Math.round(result.x);
                result.y = Math.round(result.y);

                if (pointLiesOnLine(result, line1) && pointLiesOnLine(result, line2)) {
                    return result;
                }
                return null;
            }

            function pointLiesOnLine(point, line) {
                var minX = Math.min(line.x1, line.x2);
                var maxX = Math.max(line.x1, line.x2);
                var minY = Math.min(line.y1, line.y2);
                var maxY = Math.max(line.y1, line.y2);

                return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
            }

            function lineSlope(line) {
                if (line.x1 == line.x2) {
                    // slope for vertical line is not defined
                    return null;
                }
                return ((line.y1 - line.y2) / (line.x1 - line.x2));
            }

            function lineYIntercept(line, slope) {
                return line.y1 - slope * line.x1;
            }
        }

    });

});
