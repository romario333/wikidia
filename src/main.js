define(function(require, exports, module) {
    "use strict";

    var model = require("model");
    var view = require("view");
    var diagramPresenter = require("presenter/diagramPresenter");

    $(document).ready(function () {

        $("#demo").height($(document).height());

        var diagram = model.diagram();
        diagram.addItem(model.node({x: 0, y: 0, text: "node1"}));
        diagram.addItem(model.node({x: 0, y: 90, text: "node2"}));
        diagram.addItem(model.node({x: 90, y: 90, text: "use-case node", kind: "useCase"}));

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