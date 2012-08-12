define(function(require, exports, module) {
    "use strict";

    var model = require("model");
    var view = require("view");
    var diagramPresenter = require("presenter/diagramPresenter");

    // TOOD:

    /**
     * Provides requestAnimationFrame in a cross browser way.
     * @author paulirish / http://paulirish.com/
     */

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
        var node1 = model.node({x: 130, y: 130, text: "node1"});
        var node2 = model.node({x: 130, y: 130, text: "node2"});
        var node3 = model.node({x: 250, y: 110, text: "node3"});
        var node4 = model.node({x: 110, y: 300, text: "node4"});
        diagram.addItem(node1);
        diagram.addItem(node2);
        diagram.addItem(node3);
        diagram.addItem(node4);

        connect(node1, node2);
        connect(node1, node4);
        connect(node3, node4);
        connect(node2, node3);

        function connect(node1, node2) {
            var n1c = nodeCenter(node1);
            var n2c = nodeCenter(node2);

            var line = model.line({x1: n1c.x, y1: n1c.y, x2: n2c.x, y2: n2c.y});
            diagram.addItem(line);

            line.points(0).addConnection(node1);
            line.points(1).addConnection(node2);
        }


        var presenter = diagramPresenter(diagram, $("#diagram"), $("#nodeEdit"));

        $("#autoLayout").click(function () {
            var nodes = diagram.items().filter(function (item) {return item.isNode;});
            autoLayout(nodes);
        });

        $("#inspect").click(function () {
            var code = $("#codeToInspect").val();
            var f = Function(code);
            var o = f();

            console.dir(o);
            inspect(o);
        });

        $("#addNode").click(function () {
            diagram.addItem(model.node());
        });

        $("#addClass").click(function () {
            diagram.addItem(model.node({kind: "class"}));
        });

        $("#addUseCase").click(function () {
            diagram.addItem(model.node({kind: "useCase"}));
        });

        function inspect(o) {

            var objectNode = model.node({kind: "class"});
            var text = o.constructor ? o.constructor.name : "???";
            text += "\n--";

            Object.keys(o).forEach(function (prop) {
                if (!(prop instanceof Object)) { // TODO: test jestli je primitive
                    text += "\n" + prop + ": ";
                    if (o[prop] === undefined) {
                        text += "undefined";
                    } else if (o[prop] === null) {
                        text += "null";
                    } else {
                        text += o[prop].toString();
                    }

                } else {
                    inspect(o[prop]);
                }
            });

            objectNode.text = text;
            diagram.addItem(objectNode);

            var proto = Object.getPrototypeOf(o);
            if (proto) {
                inspect(proto);
            }

            console.dir();
            console.dir(Object.getPrototypeOf(o));
        }

        function quote(s) {
            return '"' + s + '"';
        }


    });



    function autoLayout(nodes) {

        var iteration = 0;
        var ITERATION_COUNT = 50;
        var ITERATION_INTERVAL = 100;

        var vertices = [];
        var verticesById = {};
        nodes.forEach(function (node) {
            // TODO: vertices should be centered in node's center
            var v = {
                node: node,
                x: node.x,
                y: node.y,
                velocity: {x: 0, y: 0},
                edges: []
            };
            vertices.push(v);
            verticesById[node.id] = v;
        });
        vertices.forEach(function (v) {
            v.node.connections().forEach(function (c) {
                var otherNode = c.line.points(0).connections(0) === v.node ? c.line.points(1).connections(0) : c.line.points(0).connections(0);
                //console.log("connection from " + v.node.text + " to " + otherNode.text);

                if (otherNode) {
                    v.edges.push(verticesById[otherNode.id]);
                }
            });
        });

        //setTimeout(iterationFun, ITERATION_INTERVAL);
        requestAnimationFrame(iterationFun);

        function iterationFun() {
            iteration++;

            //console.log("ITERATION " + iteration);

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

                v1.x += netForce.x;
                v1.y += netForce.y;

                v1.node.moveTo(v1.x, v1.y);

                //console.log(v1.node.text + ": <" + netForce.x + ", " + netForce.y + ">");
            });

            //console.log("");

            if (iteration < ITERATION_COUNT) {
                //setTimeout(iterationFun, ITERATION_INTERVAL)
                requestAnimationFrame(iterationFun);
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
            if (result.x === 0) result.x = 1; // TODO: could be solved more elegantly?
            if (result.y === 0) result.y = 1;
            result.x = r * result.x * -1;
            result.y = r * result.y * -1;

            return result;
        }

        function springAttraction(v1, v2) {
            var C2 = 1;
            var springLength = 200;

            var dist = distance(v1, v2);
            if (dist === 0) { // TODO: could be solved more elegantly?
                dist = springLength / 10;
            }
            var a = C2 * Math.log(dist / springLength);
            var result = subtract(v2, v1);
            if (result.x === 0) result.x = 1; // TODO: could be solved more elegantly?
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


    }


    function nodeCenter(node) {
        return {
            x: node.x + (node.width / 2),
            y: node.y + (node.height / 2)
        }
    }

});