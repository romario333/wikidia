/*global WIKIDIA, describe, beforeEach, it, expect, spyOn*/
define(function(require, exports, module) {
    "use strict";

    var diagramPresenter = require("presenter/diagramPresenter");
    var model = require("model");

    describe("diagramPresenter", function () {

        var presenter,
            keyboard;

        beforeEach(function () {
            var diagram = model.diagram();
            diagram.addItem(model.node({x: 30, y: 30, width: 180, height: 90, text: "simple node"}));
            diagram.addItem(model.node({x: 255, y: 30, width: 180, height: 135, text: "class\n--\n- property1\n- property2\n--\n+ doSomething()\n{{fill=#7fffd4}}", kind: "class"}));
            diagram.addItem(model.node({x: 30, y: 210, width: 180, height: 90, text: "use-case\n{{fill=lightgray}}", kind: "useCase"}));

            keyboard = keyboardMock();

            presenter = diagramPresenter(diagram, $(null), $(null), viewMockFactory());
            presenter = presenter._test;
        });

        it("Test single selection.", function () {
            expect(presenter.selection.length()).toEqual(0);
            expect(presenter.itemInfos[0].isSelected).toEqual(false);
            expect(presenter.itemInfos[1].isSelected).toEqual(false);
            expect(presenter.itemInfos[2].isSelected).toEqual(false);

            click(presenter.itemInfos[1].view);

            expect(presenter.selection.length()).toEqual(1);
            expect(presenter.itemInfos[0].isSelected).toEqual(false);
            expect(presenter.itemInfos[1].isSelected).toEqual(true);
            expect(presenter.itemInfos[2].isSelected).toEqual(false);

            click(presenter.itemInfos[2].view);

            expect(presenter.selection.length()).toEqual(1);
            expect(presenter.itemInfos[0].isSelected).toEqual(false);
            expect(presenter.itemInfos[1].isSelected).toEqual(false);
            expect(presenter.itemInfos[2].isSelected).toEqual(true);
        });

        it("Test multiple selection.", function () {
            keyboard.ctrlDown();

            expect(presenter.selection.length()).toEqual(0);
            expect(presenter.itemInfos[0].isSelected).toEqual(false);
            expect(presenter.itemInfos[1].isSelected).toEqual(false);
            expect(presenter.itemInfos[2].isSelected).toEqual(false);

            click(presenter.itemInfos[1].view);

            expect(presenter.selection.length()).toEqual(1);
            expect(presenter.itemInfos[0].isSelected).toEqual(false);
            expect(presenter.itemInfos[1].isSelected).toEqual(true);
            expect(presenter.itemInfos[2].isSelected).toEqual(false);

            click(presenter.itemInfos[2].view);

            expect(presenter.selection.length()).toEqual(2);
            expect(presenter.itemInfos[0].isSelected).toEqual(false);
            expect(presenter.itemInfos[1].isSelected).toEqual(true);
            expect(presenter.itemInfos[2].isSelected).toEqual(true);

            // now return to single selection mode and select some other node
            keyboard.ctrlUp();
            click(presenter.itemInfos[0].view);

            expect(presenter.selection.length()).toEqual(1);
            expect(presenter.itemInfos[0].isSelected).toEqual(true);
            expect(presenter.itemInfos[1].isSelected).toEqual(false);
            expect(presenter.itemInfos[2].isSelected).toEqual(false);
        });

        /**
         * Emulates click event.
         *
         * @param view
         */
        function click(view) {
           view.fireMouseDown();
           view.fireClick();
        }

        function viewMockFactory() {

            return {
                rootView: emptyObject,
                diagramView: diagramViewMock,
                nodeView: nodeViewMock,
                lineView: lineViewMock,
                keyboard: function () {
                    return keyboard;
                },
                itemEditView: itemEditViewMock
            };
        }

        function emptyObject() {
            return {};
        }

        function lineViewMock() {
            var that = itemViewMock();
            addEvent(that, "connectPointDragStart");
            addEvent(that, "connectPointDragMove");
            addEvent(that, "connectPointDragEnd");
            addEvent(that, "connectPointDrop");

            return that;
        }

        function nodeViewMock() {
            var that = itemViewMock();
            addEvent(that, "dragStart");
            addEvent(that, "dragMove");
            addEvent(that, "dragEnd");
            addEvent(that, "resizeDragStart");
            addEvent(that, "resizeDragMove");
            addEvent(that, "resizeDragEnd");
            addEvent(that, "connectPointDragStart");
            addEvent(that, "connectPointDragMove");
            addEvent(that, "connectPointDragEnd");
            addEvent(that, "connectPointDrop");

            return that;
        }

        function itemViewMock() {
            var that = viewMockBase();
            addEvent(that, "mouseEnter");
            addEvent(that, "mouseLeave");
            addEvent(that, "mouseMove");

            that.clear = function () {};
            that.updateBounds = function () {};
            that.isSelected = function () {};

            that.rect = function () {};
            that.line = function () {};
            that.measureText = function () {
                return {
                    width: 0, height: 0
                };
            };
            that.text = function () {
                return {
                    width: 0, height: 0
                };
            };
            that.ellipse = function () {};

            return that;
        }

        function diagramViewMock() {
            var that = viewMockBase();
            that.update = function () {};
            return that;
        }

        function viewMockBase() {
            var that = {};
            addEvent(that, "click");
            addEvent(that, "doubleClick");
            addEvent(that, "mouseDown");
            addEvent(that, "mouseUp");
            return that;
        }

        function itemEditViewMock() {
            var that = {};
            addEvent(that, "focus");
            addEvent(that, "blur");

            that.text = function () {};
            return that;
        }

        function keyboardMock() {
            var that = {};
            var isCtrlKeyDown = false;

            addEvent(that, "keyUp");
            addEvent(that, "keyDown");

            that.isCtrlKeyDown = function () {
                return isCtrlKeyDown;
            };

            that.ctrlDown = function () {
                isCtrlKeyDown = true;
            };
            that.ctrlUp = function () {
                isCtrlKeyDown = false;
            };

            return that;
        }

        function addEvent(object, eventName) {
            object[eventName] = function (handler) {
                object[eventName + "Handler"] = handler;
            };

            object["fire" + capitaliseFirstLetter(eventName)] = function () {
                var handler = object[eventName + "Handler"];
                if (handler) {
                    handler.apply(null, [object]);
                }
            };
        }

        function capitaliseFirstLetter(string)
        {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

    });

});