/*global WIKIDIA, describe, beforeEach, it, expect, spyOn*/

//describe("diagramPresenter", function () {
//    "use strict";
//
//    var diagram,
//        diagramPresenter,
//        items;
//
//    beforeEach(function () {
//        diagram = WIKIDIA.model.diagram();
//        var viewFactory = testViewFactory();
//        var rootView = viewFactory.rootView();
//        var diagramView = WIKIDIA.view.svg.diagramView(rootView, diagram);
//        diagramPresenter = WIKIDIA.presenter.diagramPresenter(diagramView, diagram, viewFactory);
//        items = diagramPresenter._test.items;
//    });
//
//    it("select single item", function () {
//        diagram.addItem(WIKIDIA.model.node());
//        diagram.addItem(WIKIDIA.model.node());
//
//        expect(items[0].isSelected).toBeFalsy();
//        expect(items[1].isSelected).toBeFalsy();
//    });
//});
//
//function testViewFactory() {
//    "use strict";
//
//    function viewMock() {
//        return {
//            createElement: function() {
//
//            }
//        };
//    }
//
//    return {
//        rootView: function () {
//            return viewMock();
//        },
//        diagramView: function () {
//            return viewMock();
//        },
//        nodeView: function () {
//            return viewMock();
//        },
//        lineView: function () {
//            return viewMock();
//        }
//    };
//}