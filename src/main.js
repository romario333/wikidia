define(function(require, exports, module) {
    "use strict";

    var model = require("model");
    var view = require("view");
    var diagramPresenter = require("presenter/diagramPresenter");

    $(document).ready(function () {

        var diagram = model.diagram();
        diagram.addItem(model.node({x: 0, y: 0, text: "no kind node"}));
        diagram.addItem(model.node({x: 0, y: 0, text: "use-case node", kind: "useCase"}));

        var rootView = view.rootView($("#diagram"));
        var diagramView = view.diagramView(rootView, diagram);

        var presenter = diagramPresenter(diagramView, diagram);

        $("#printJSON").click(function () {
            console.log(diagram.toJSON());
        });

    });

});