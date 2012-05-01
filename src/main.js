define(function(require, exports, module) {
    "use strict";

    var model = require("model");
    var view = require("view");
    var diagramPresenter = require("presenter/diagramPresenter");

    $(document).ready(function () {

        $("#demo").height($(document).height());

        var diagram = model.diagram();
        diagram.addItem(model.node({x: 30, y: 30, width: 180, height: 90, text: "simple node"}));
        diagram.addItem(model.node({x: 255, y: 30, width: 180, height: 135, text: "class\n--\n- property1\n- property2\n--\n+ doSomething()\n{{fill=#7fffd4}}", kind: "class"}));
        diagram.addItem(model.node({x: 30, y: 210, width: 180, height: 90, text: "use-case\n{{fill=lightgray}}", kind: "useCase"}));

        var rootView = view.rootView($("#diagram"));
        var diagramView = view.diagramView(rootView, diagram);
        var nodeEditView = $("#nodeEdit");

        var presenter = diagramPresenter(diagramView, diagram, nodeEditView);

        $("#addNode").click(function () {
            diagram.addItem(model.node());
        });

        $("#addUseCase").click(function () {
            diagram.addItem(model.node({kind: "useCase"}));
        });



    });

});