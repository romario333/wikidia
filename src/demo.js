define(function(require, exports, module) {
    "use strict";

    var model = require("model");
    var view = require("view");
    var diagramPresenter = require("presenter/diagramPresenter");

    $(document).ready(function () {

        $("#demo").height($(document).height());

        var diagram = model.diagram();

        var presenter = diagramPresenter(diagram, $("#diagram"), $("#nodeEdit"));

        $("#addNode").click(function () {
            diagram.addItem(model.node());
        });

        $("#addClass").click(function () {
            diagram.addItem(model.node({kind: "class"}));
        });

        $("#addUseCase").click(function () {
            diagram.addItem(model.node({kind: "useCase"}));
        });

        $("#addActor").click(function () {
            diagram.addItem(model.node({kind: "actor", width: 75, height: 135}));
        });

        $("#addNote").click(function () {
            diagram.addItem(model.node({kind: "note", text: "{{fill=yellow}}"}));
        });

        window.diagram = diagram;

        // create demo diagram
        var diagramNode = node({kind: "class", x: 45, y: 210, width: 180, height: 135, text: "diagram\n--\n- items\n--\n+ clear()\n+ addItem()\n+ removeItem()\n{{fill=#7fffd4}}"});
        var useCaseNode = node({kind: "useCase", x: 240, y: 30, width: 180, height: 90, text: "Draw diagram\n{{fill=lightgray}}"});
        var actorNode = node({kind: "actor", x: 45, y: 15, width: 75, height: 135, text: "Developer"});
        var itemNode = node({kind: "class", x: 420, y: 210, width: 120, height: 120, text: "item\n--\n- text\n- connections\n--\nconnect()"});
        var nodeNode = node({kind: "class", x: 330, y: 420, width: 120, height: 120, text: "node\n--\n- x\n- y\n- width\n- height"});
        var lineNode = node({kind: "class", x: 525, y: 420, width: 120, height: 120, text: "line\n--\n- points"});
        var presenterNode = node({kind: "class", x: 75, y: 420, width: 135, height: 30, text: "diagramPresenter"});
        var noteNode = node({kind: "note", x: 495, y: 30, width: 165, height: 90, text: "{{fill=yellow}}\nThis is just a demo."});

        connect({node1: actorNode, node2: useCaseNode, x1: 120, y1: 75, x2: 240, y2: 75, text: "{{lineType=->}}"});
        connect({node1: itemNode, node2: diagramNode, x1: 420, y1: 240, x2: 225, y2: 240, text: "{{lineType=-<<>>}}"});
        connect({node1: nodeNode, node2: itemNode, x1: 420, y1: 420, x2: 450, y2: 330, text: "{{lineType=->>}}"});
        connect({node1: lineNode, node2: itemNode, x1: 555, y1: 420, x2: 510, y2: 330, text: "{{lineType=->>}}"});
        connect({node1: diagramNode, node2: presenterNode, x1: 135, y1: 345, x2: 135, y2: 420, text: "{{lineType=-<>}}"});
        connect({node1: noteNode, node2: itemNode, x1: 540, y1: 120, x2: 480, y2: 210, text: "{{lineType=.}}"});

        function node(spec) {
            var n = model.node(spec);
            diagram.addItem(n);
            return n;
        }

        function connect(spec) {
            var line = model.line({x1: spec.x1, y1: spec.y1, x2: spec.x2, y2: spec.y2, text: spec.text});
            diagram.addItem(line);

            line.points(0).addConnection(spec.node1);
            line.points(1).addConnection(spec.node2);
        }
    });

});