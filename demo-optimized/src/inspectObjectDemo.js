define("model/diagram",["require"],function(a){return function(){var a={},b=[],c=[],d=[],e=!0,f=0;return a.addItem=function(c){if(!c.isLine&&!c.isNode)throw new Error("Only nodes and lines can be added to diagram");c.id=++f,c.isLine&&c.points().forEach(function(a){a.id=++f}),b.push(c),e&&a.fireItemAdded(c)},a.removeItem=function(c){if(!c.isLine&&!c.isNode)throw new Error("Only nodes and lines can be removed from diagram");var d=b.indexOf(c);if(d===-1)throw new Error("Item '{itemId}' not found in diagram.".supplant({itemId:c.id}));c.disconnect(),b.splice(d,1),c.id=null,c.isLine&&c.points().forEach(function(a){a.id=null}),e&&a.fireItemRemoved(c)},a.clear=function(){var c;while(c=b.pop())e&&a.fireItemRemoved(c)},a.items=function(){return b},a.changeEventsEnabled=function(a){if(arguments.length===0)return e;e=a},a.itemAdded=function(a){c.push(a)},a.itemRemoved=function(a){d.push(a)},a.fireItemAdded=function(b){c.forEach(function(c){c(a,b)})},a.fireItemRemoved=function(b){d.forEach(function(c){c(a,b)})},a.toJSON=function(){var a="[";return b.forEach(function(c,d){a+=c.toJSON(),d<b.length-1&&(a+=", ")}),a+="]",a},a}}),define("utils",["require"],function(a){return String.prototype.supplant||(String.prototype.supplant=function(a){return this.replace(/\{([^\{\}]*)\}/g,function(b,c){var d=a[c];return typeof d=="string"||typeof d=="number"?d:b})}),{objectWithId:function b(){return b.lastId||(b.lastId=0),b.lastId++,{oid:b.lastId}},addObservableProperty:function(a,b,c){Object.defineProperty(a,b,{get:function(){return a["__"+b]},set:function(c){var d=a["__"+b];a["__"+b]=c,c!==d&&a.changeEventsEnabled()&&a.fireChange()}}),a["__"+b]=c},copyShallow:function(a){return jQuery.extend({},a)},copyDeep:function(a){return jQuery.extend(!0,{},a)}}}),define("model/item",["require","utils"],function(a){return function(){var b=a("utils"),c=b.objectWithId(),d=[],e=[],f=!0;return c.id=null,c.change=function(a){e.push(a)},c.changeEventsEnabled=function(a){if(arguments.length===0)return f;f=a},c.fireChange=function(){e.forEach(function(a){a(c)})},c._addConnection=function(a){if(!a.id)throw new Error("Cannot add connection to item, it has no id set.");d.push(a),c.changeEventsEnabled()&&c.fireChange()},c.addConnection=function(a){c._addConnection(a),a._addConnection(c)},c._removeConnection=function(a){var b=d.indexOf(a);if(b===-1)throw new Error("Item '{itemId}' not found in connections of item '{thisId}'.".supplant({itemId:a.id,thisId:c.id}));d.splice(b,1),c.changeEventsEnabled()&&c.fireChange()},c.removeConnection=function(a){c._removeConnection(a),a._removeConnection(c)},c.connections=function(){return arguments.length===1?d[arguments[0]]:d.slice()},c.disconnect=function(){c.connections().forEach(function(a){c.removeConnection(a)})},c._test={onChangeHandlers:e},c}}),define("model/line",["require","model/item","utils"],function(a){var b=a("model/item"),c=a("utils");return function(a){function f(a,d){var e=b();return c.addObservableProperty(e,"x",a.x||0),c.addObservableProperty(e,"y",a.y||0),e.isLinePoint=!0,e.line=d,e.change=function(){throw new Error("You can't use change observing properties on point, use properties on line instead.")},e.fireChange=d.fireChange,e.changeEventsEnabled=function(){if(arguments.length!==0)throw new Error("You can't use change observing properties on point, use properties on line instead.");return d.changeEventsEnabled()},e}var d=b(),e=[];return a=a||{},e.push(f({x:a.x1||0,y:a.y1||0},d)),e.push(f({x:a.x2||0,y:a.y2||0},d)),c.addObservableProperty(d,"text",a.text||""),c.addObservableProperty(d,"kind",a.kind||"line"),d.points=function(a){return arguments.length===0?e.slice():e[a]},d.pointAt=function(a,b){for(var c=0;c<e.length;c++){var f=e[c];if(f.x===a&&f.y===b)return f}throw new Error("Point [{x}, {y}] not found on line with id '{line}'.".supplant({x:a,y:b,line:d.id}))},d.addConnection=function(a){throw new Error("You can't connect to line directly, use function on its point instead.")},d.removeConnection=function(a){throw new Error("You can't disconnect from line directly, use function on its point instead.")},d.connections=function(){throw new Error("You can't get list of line connections directly, use function on its point instead.")},d.disconnect=function(){d.points().forEach(function(a){a.connections().forEach(function(b){a.removeConnection(b)})})},d.isLine=!0,d}}),define("model/node",["require","model/item","utils"],function(a){var b=a("model/item"),c=a("utils");return function(a){var d=90,e=b();return a=a||{},c.addObservableProperty(e,"text",a.text||""),c.addObservableProperty(e,"x",a.x||0),c.addObservableProperty(e,"y",a.y||0),c.addObservableProperty(e,"width",a.width||d),c.addObservableProperty(e,"height",a.height||d),c.addObservableProperty(e,"kind",a.kind||"node"),e.moveTo=function(a,b){e.connections().forEach(function(c){if(!c.isLinePoint)throw new Error("Don't know how to handle item.");c.line.changeEventsEnabled(!0),c.x=c.x-e.x+a,c.y=c.y-e.y+b,c.line.changeEventsEnabled(!1),c.line.fireChange()}),e.x=a,e.y=b},e.move=function(a,b){e.moveTo(e.x+a,e.y+b)},e.resizeTo=function(a,b){e.changeEventsEnabled(!1),e.connections().forEach(function(c){if(!c.isLinePoint)throw new Error("Don't know how to handle item.");var d=!1;c.line.changeEventsEnabled(!0),c.x===e.x+e.width&&(c.x=e.x+a,d=!0),c.y===e.y+e.height&&(c.y=e.y+b,d=!0),c.line.changeEventsEnabled(!1),d&&c.line.fireChange()}),e.width=a,e.height=b,e.changeEventsEnabled(!0),e.fireChange()},e.isNode=!0,e}}),define("model",["require","model/diagram","model/line","model/node"],function(a){return{diagram:a("model/diagram"),line:a("model/line"),node:a("model/node")}}),define("view/svg/svgHelper",["require"],function(a){var b="http://www.w3.org/2000/svg";return{createSvgElement:function(a,c){var d=$(document.createElementNS(b,a));return c&&d.attr(c),d},pathBuilder:function(){var a=this.createSvgElement("path"),b="";return{moveTo:function(a,c){return b+="M {x} {y} ".supplant({x:a,y:c}),this},lineTo:function(a,c){return b+="L {x} {y} ".supplant({x:a,y:c}),this},closePath:function(){return b+="z ",this},attr:function(b){return a.attr(b),this},create:function(){return a.attr("d",b),a}}},printSvg:function(a){var b="",c;if(a.length)for(c=0;c<a.length;c++)b+=this.printSvg(a[c]);else{var d=a;if(!(d instanceof SVGElement))throw new Error("'{element}' is not a SVG element.".supplant({element:d}));b="<"+d.tagName;var e;for(c=0;c<d.attributes.length;c++)e=d.attributes[c],b+=' {name}="{value}"'.supplant(e);b+=">";for(c=0;c<d.childNodes.length;c++)b+=this.printSvg(d.childNodes[c]);b+="</"+d.tagName+">"}return b}}}),define("view/svg/viewBase",["require","./svgHelper"],function(a){return function(b){var c=a("./svgHelper"),d={},e,f,g,h;return b.click(function(a){a.stopPropagation(),e&&e(d)}),b.dblclick(function(a){a.stopPropagation(),f&&f(d)}),b.mousedown(function(a){a.stopPropagation(),g&&g(d)}),b.mouseup(function(a){h&&h(d)}),d.click=function(a){e=a},d.doubleClick=function(a){f=a},d.mouseDown=function(a){g=a},d.mouseUp=function(a){h=a},d.element=function(){return b},d.previewMove=function(a,c){b.attr("transform","translate({dx},{dy})".supplant({dx:a,dy:c}))},d.cancelPreviewMove=function(){b.removeAttr("transform")},d.createElement=function(a,d){var e=c.createSvgElement(a,d);return b.append(e),e},d.remove=function(){b.remove()},d}}),define("view/svg/rootView",["require","./viewBase","./svgHelper"],function(a){return function(b){var c=a("./viewBase"),d=a("./svgHelper"),e=$(d.createSvgElement("svg")),f=c(e);return b.append(e),f.containerWidth=function(){return b.width()},f.containerHeight=function(){return b.height()},f._test={svg:function(){return d.printSvg(e)}},f}}),define("view/svg/dragEventHandler",["require"],function(a){return function(a){function j(a){h&&k(),h=$(a),h.data("events")&&h.data("events").click&&(i=h.data("events").click.slice()),h.off("click")}function k(){i&&(i.forEach(function(a){h.on(a.type,a.selector,a.data,a.handler)}),h=undefined,i=undefined)}var b=!1,c=!1,d={startX:null,startY:null,x:null,y:null,dx:0,dy:0,lastDx:0,lastDy:0},e,f,g;a.mousedown(function(a){d.startX=a.clientX,d.startY=a.clientY,b=!0}),$(document.body).mousemove(function(a){b&&(c=!0,b=!1,e&&(d.x=d.startX,d.y=d.startY,d.dx=0,d.dy=0,d.lastDx=0,d.lastDy=0,e(a,d)),j(a.target)),c&&f&&(d.lastDx=d.dx,d.lastDy=d.dy,d.dx=a.clientX-d.startX,d.dy=a.clientY-d.startY,f(a,d))}),$(document).mouseup(function(a){b=!1,c&&(c=!1,g&&(d.lastDx=d.dx,d.lastDy=d.dy,d.dx=a.clientX-d.startX,d.dy=a.clientY-d.startY,g(a,d)),$(a.target).one("click",function(a){a.stopImmediatePropagation()}),k())});var h,i,l={dragStart:function(a){e=a},dragMove:function(a){f=a},dragEnd:function(a){g=a}};return l}}),define("view/svg/diagramView",["require","./viewBase","./svgHelper","./dragEventHandler"],function(a){return function(b){function o(){f.css("-webkit-user-select","none"),f.css("-khtml-user-select","none"),f.css("-o-user-select","none"),f.css("user-select","none");var a=e(f);a.dragStart(function(a,b){k&&k(h)}),a.dragMove(function(a,b){l&&l(h,b.dx,b.dy)}),a.dragEnd(function(a,b){m&&m(h,b.dx,b.dy)})}var c=a("./viewBase"),d=a("./svgHelper"),e=a("./dragEventHandler"),f=b.createElement("g",{"class":"diagram"});i=d.createSvgElement("rect",{"class":"eventBox",opacity:0,fill:"blue",width:"100%",height:"100%"}),f.append(i),j=d.createSvgElement("g",{"class":"grid"}),f.append(j);var g=d.createSvgElement("g",{"class":"viewPort"});f.append(g);var h=c(g),i,j,k,l,m,n;return i.click(function(){n&&n(h)}),h.click=function(a){n=a},h.gridStep=null,h.update=function(){j.empty();if(h.gridStep!==null){var a=b.containerWidth(),c=b.containerHeight(),e,f,g;for(e=0;e<a;e+=h.gridStep)g=d.createSvgElement("line",{x1:e,y1:0,x2:e,y2:c,stroke:"blue",opacity:.5}),j.append(g);for(f=0;f<c;f+=h.gridStep)g=d.createSvgElement("line",{x1:0,y1:f,x2:a,y2:f,stroke:"blue",opacity:.5}),j.append(g)}},h.scrollTo=function(a,b){g.attr("transform","translate({x},{y})".supplant({x:a,y:b}))},h.dragStart=function(a){k=a},h.dragMove=function(a){l=a},h.dragEnd=function(a){m=a},h.offset=function(){return b.element().offset()},h.size=function(){var a=f[0].getBBox();return{width:a.width,height:a.height}},o(),h}}),define("view/svg/itemRenderMixin",["require","./svgHelper"],function(a){var b=a("./svgHelper");return function(c,d){function e(a){var c=b.createSvgElement("text",{x:a.x||0,y:a.y||0,"dominant-baseline":"text-before-edge"});return c.text(a.text),c}c.clear=function(){d.empty()},c.rect=function(a){var c=b.createSvgElement("rect",a);d.append(c)},c.line=function(a){var c=b.createSvgElement("line",a);d.append(c)},c.circle=function(a){var c=b.createSvgElement("circle",a);d.append(c)},c.ellipse=function(a){var c=b.createSvgElement("ellipse",a);d.append(c)},c.text=function(a){var b=e(a);d.append(b);var c=b[0].getBBox();return{width:c.width,height:c.height}},c.measureText=function(a){var b=e(a);d.append(b);var c=b[0].getBBox(),f={width:c.width,height:c.height};return b.remove(),f},c.path=function(a){var c=b.pathBuilder();return c.attr(a),{moveTo:function(a,b){return c.moveTo(a,b),this},lineTo:function(a,b){return c.lineTo(a,b),this},closePath:function(){return c.closePath(),this},done:function(){d.append(c.create())}}}}}),define("view/svg/nodeView",["require","./viewBase","./svgHelper","./dragEventHandler","./itemRenderMixin"],function(a){return function(b){function D(){h.attr("cursor","move"),j=i.createElement("g",{"class":"content"}),k=i.createElement("rect",{"class":"eventBox",opacity:0,fill:"blue"}),l=i.createElement("g",{"class":"resize-border",display:"none"}),m=i.createElement("circle",{"class":"connect-point",cx:0,cy:0,r:0,fill:"red",stroke:"blue",display:"none"}),m.attr("cursor","default"),n=i.createElement("circle",{"class":"connect-point-locked",cx:0,cy:0,r:0,fill:"none",stroke:"black","stroke-width":2,display:"none"});var a=f(h);a.dragStart(function(a,b){!B&&!C&&o&&o(i)}),a.dragMove(function(a,b){!B&&!C&&p&&p(i,b.dx,b.dy)}),a.dragEnd(function(a,b){!B&&!C&&q&&q(i,b.dx,b.dy)});var c=f(m);c.dragStart(function(a,b){C=!0;if(u){var c=a.target.cx.animVal.value,d=a.target.cy.animVal.value;u(i,c,d)}}),c.dragMove(function(a,b){v&&v(i,b.dx,b.dy)}),c.dragEnd(function(a,b){C=!1,w&&w(i,b.dx,b.dy)}),m.mouseup(function(a){if(x){var b=a.target.cx.animVal.value,c=a.target.cy.animVal.value;x(i,b,c)}}),m.mouseenter(function(a){m.attr("fill","black")}),m.mouseleave(function(a){m.attr("fill","red")}),h.mouseenter(function(a){!B&&y&&y(i)}),h.mouseleave(function(a){!B&&z&&z(i)}),h.mousemove(function(a){if(!B&&A){var c=b.offset();A(i,a.pageX-c.left,a.pageY-c.top)}})}function E(a){l.empty(),l.append(e.createSvgElement("rect",{x:a.x-2,y:a.y-2,width:a.width+4,height:a.height+4,fill:"none",stroke:"black","stroke-dasharray":"4,4"}));var b=e.pathBuilder().moveTo(a.x+a.width,a.y+a.height-c).lineTo(a.x+a.width,a.y+a.height).lineTo(a.x+a.width-c,a.y+a.height).attr({"stroke-width":7,stroke:"red",opacity:0,fill:"none",cursor:"se-resize"}).create();l.append(b);var d=f(b);d.dragStart(function(a,b){B=!0,r&&r(i)}),d.dragMove(function(a,b){s&&s(i,b.dx,b.dy)}),d.dragEnd(function(a,b){B=!1,t&&t(i,b.dx,b.dy)})}var c=15,d=a("./viewBase"),e=a("./svgHelper"),f=a("./dragEventHandler"),g=a("./itemRenderMixin"),h=b.createElement("g",{"class":"node"}),i=d(h),j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B=!1,C=!1;return i.dragStart=function(a){o=a},i.dragMove=function(a){p=a},i.dragEnd=function(a){q=a},i.resizeDragStart=function(a){r=a},i.resizeDragMove=function(a){s=a},i.resizeDragEnd=function(a){t=a},i.connectPointDragStart=function(a){u=a},i.connectPointDragMove=function(a){v=a},i.connectPointDragEnd=function(a){w=a},i.connectPointDrop=function(a){x=a},i.mouseEnter=function(a){y=a},i.mouseLeave=function(a){z=a},i.mouseMove=function(a){A=a},i.showResizeBorder=function(){l.attr("display","block")},i.hideResizeBorder=function(){l.attr("display","none")},i.showConnectionPoint=function(a){if(m.attr("cx")==a.x&&m.attr("cy")==a.y&&m.attr("display")==="block")return;m.attr({cx:a.x,cy:a.y,display:"block"}),$(m[0].r.baseVal).animate({value:10},{duration:"fast"})},i.hideConnectionPoints=function(){m.attr({display:"none"}),m.delay(500).queue(function(){m.attr({r:0})})},i.animateLock=function(){n.attr({cx:m.attr("cx"),cy:m.attr("cy"),r:40,display:"block"}),$(n[0].r.baseVal).animate({value:0},{duration:"fast"})},i.previewMove=function(a,b){h.attr("transform","translate({dx},{dy})".supplant({dx:a,dy:b}))},i.cancelPreviewMove=function(){h.attr("transform","")},i.updateBounds=function(a){E(a);var c=b.gridStep?b.gridStep/3:5;k.attr({x:a.x-c,y:a.y-c,width:a.width+2*c,height:a.height+2*c})},i.isSelected=function(a){k.attr("opacity",a?.5:0)},i.contentSize=function(){var a=j[0].getBBox();return{width:a.width,height:a.height}},i._test={},i._test.contentSvg=function(){var a="",b,c=j[0];for(b=0;b<c.childNodes.length;b++)a+=e.printSvg(c.childNodes[b]);return a},D(),g(i,j),i}}),define("view/svg/lineView",["require","./viewBase","./svgHelper","./dragEventHandler","./itemRenderMixin"],function(a){return function(b){function t(){i=h.createElement("g",{"class":"content"});var a=b.gridStep?b.gridStep/3:5;j=h.createElement("line",{"class":"eventBox",stroke:"blue",opacity:0,"stroke-width":a*2}),k=h.createElement("g",{"class":"connect-points"}),k.attr("cursor","default"),g.mouseenter(function(a){!o&&q&&q(h)}),g.mouseleave(function(a){!o&&r&&r(h)}),g.mousemove(function(a){if(!o&&s){var c=b.offset();s(h,a.pageX-c.left,a.pageY-c.top)}});var c=e(k);c.dragStart(function(a,b){o=!0;if(l){var c=a.target.cx.animVal.value,d=a.target.cy.animVal.value;l(h,c,d)}}),c.dragMove(function(a,b){m&&m(h,b.dx,b.dy)}),c.dragEnd(function(a,b){o=!1,n&&n(h,b.dx,b.dy)}),k.mouseup(function(a){if(p){var b=a.target.cx.animVal.value,c=a.target.cy.animVal.value;p(h,b,c)}})}var c=a("./viewBase"),d=a("./svgHelper"),e=a("./dragEventHandler"),f=a("./itemRenderMixin"),g=b.createElement("g",{"class":"line"}),h=c(g),i,j,k,l,m,n,o=!1,p,q,r,s;return h.connectPointDragStart=function(a){l=a},h.connectPointDragMove=function(a){m=a},h.connectPointDragEnd=function(a){n=a},h.connectPointDrop=function(a){p=a},h.mouseEnter=function(a){q=a},h.mouseLeave=function(a){r=a},h.mouseMove=function(a){s=a},h.updateBounds=function(a){j.attr(a)},h.isSelected=function(a){j.attr("opacity",a?.5:0)},h.showConnectionPoints=function(a){a.forEach(function(a){var b=d.createSvgElement("circle",{cx:a.x,cy:a.y,r:6,fill:"red",stroke:"blue"});k.append(b)})},h.hideConnectionPoints=function(){k.empty()},t(),f(h,i),h}}),define("view/keyboard",["require"],function(a){return function(){var a={},b,c=!1;return $(document).keydown(function(a){a.which===17&&(c=!0)}),$(document).keyup(function(a){a.ctrlKey&&(c=!1),b&&b({ctrlKey:a.ctrlKey,which:a.which})}),$(window).blur(function(){c=!1}),a.keyUp=function(a){b=a},a.isCtrlKeyDown=function(){return c},a}}),define("view/itemEditView",["require"],function(a){return function(a){var b={},c,d;return b.text=function(b){if(arguments.length===0)return a.val();a.val(b)},b.focus=function(a){c=a},b.blur=function(a){d=a},a.focus(function(a){c&&c()}),a.blur(function(a){d&&d()}),b}}),define("view",["require","view/svg/rootView","view/svg/diagramView","view/svg/nodeView","view/svg/lineView","view/keyboard","view/itemEditView"],function(a){return{rootView:a("view/svg/rootView"),diagramView:a("view/svg/diagramView"),nodeView:a("view/svg/nodeView"),lineView:a("view/svg/lineView"),keyboard:a("view/keyboard"),itemEditView:a("view/itemEditView")}}),define("presenter/commands",["require","model"],function(a){var b=a("model");return{moveCommand:function(a){function e(b,c){a.forEach(function(a){if(a.item.isNode){var d=a.item;d.moveTo(d.x+b,d.y+c)}})}var b={},c=0,d=0;return b.dx=0,b.dy=0,b.isMoveCommand=!0,b.preview=function(){a.forEach(function(a){if(a.item.isNode){a.view.previewMove(b.dx,b.dy);var e=a.item;e.changeEventsEnabled(!1),e.move(b.dx-c,b.dy-d),e.changeEventsEnabled(!0)}}),c=b.dx,d=b.dy},b.cancelPreview=function(){a.forEach(function(a){if(a.item.isNode){a.view.cancelPreviewMove();var c=a.item;c.changeEventsEnabled(!1),c.move(-b.dx,-b.dy),c.changeEventsEnabled(!0)}})},b.execute=function(){e(b.dx,b.dy)},b.undo=function(){return e(-b.dx,-b.dy),a},b},resizeNodeCommand:function(a){function e(b,c){a.forEach(function(a){if(a.item.isNode){var d=a.item;d.resizeTo(d.width+b,d.height+c)}})}var b={},c=0,d=0;return b.dWidth=0,b.dHeight=0,b.isResizeNodeCommand=!0,b.preview=function(){e(b.dWidth-c,b.dHeight-d),c=b.dWidth,d=b.dHeight},b.cancelPreview=function(){e(-b.dWidth,-b.dHeight)},b.execute=function(){e(b.dWidth,b.dHeight)},b.undo=function(){return e(-b.dWidth,-b.dHeight),a},b},createLineCommand:function(a,c,d,e){var f={},g;return f.x1=d,f.y1=e,f.x2=d,f.y2=e,f.itemToConnect=null,g=b.line({text:"{{lineType=->}}"}),a.addItem(g),f.preview=function(){g.changeEventsEnabled(!1),g.points(0).x=f.x1,g.points(0).y=f.y1,g.points(1).x=f.x2,g.points(1).y=f.y2,g.changeEventsEnabled(!0),g.fireChange()},f.cancelPreview=function(){},f.execute=function(){g.changeEventsEnabled(!1),g.points(0).x=f.x1,g.points(0).y=f.y1,g.points(1).x=f.x2,g.points(1).y=f.y2,g.points(0).addConnection(c),f.itemToConnect&&g.points(1).addConnection(f.itemToConnect.item),g.changeEventsEnabled(!0),g.fireChange(),f.itemToConnect&&(f.itemToConnect.view.hideConnectionPoints(),f.itemToConnect.view.animateLock())},f.undo=function(){return[]},f},moveLinePointCommand:function(a){function f(b,c){a.line.changeEventsEnabled(!1),a.x+=b,a.y+=c,a.line.changeEventsEnabled(!0),a.line.fireChange()}var b={},c=0,d=0,e;b.dx=0,b.dy=0,b.itemToConnect=null;if(a.connections().length>1)throw new Error("More that one connection on point '{id}'.".supplant(a));return a.connections().length===1&&(e=a.connections(0)),b.preview=function(){f(b.dx-c,b.dy-d),c=b.dx,d=b.dy},b.cancelPreview=function(){f(-b.dx,-b.dy)},b.execute=function(){f(b.dx,b.dy),a.line.changeEventsEnabled(!1),e&&a.removeConnection(e),b.itemToConnect&&a.addConnection(b.itemToConnect.item),a.line.changeEventsEnabled(!0),a.line.fireChange(),b.itemToConnect&&(b.itemToConnect.view.hideConnectionPoints(),b.itemToConnect.view.animateLock())},b.undo=function(){return f(-b.dx,-b.dy),a.line.changeEventsEnabled(!1),e&&a.addConnection(e),b.connectToItem&&a.removeConnection(b.connectToItem),a.line.changeEventsEnabled(!0),a.line.fireChange(),[]},b},editItemCommand:function(a){var b={},c=a.text;return b.newText=c,b.isEditItemCommand=!0,b.execute=function(){a.text=b.newText},b.undo=function(){return a.text=c,[a]},b.hasChanged=function(){return b.newText!==a.text},b},deleteItemsCommand:function(a,b){var c={},d=[];return c.execute=function(){b.forEach(function(b){var c=b.item;c.isLine?c.points().forEach(function(a){a.connections().forEach(function(b){d.push({from:a,to:b})})}):c.connections().forEach(function(a){d.push({from:c,to:a})}),a.removeItem(c)})},c.undo=function(){return b.forEach(function(b){a.addItem(b.item)}),d.forEach(function(a){a.from.addConnection(a.to)}),b},c}}}),define("presenter/renderFilters",["require","utils"],function(a){var b=a("utils");return{renderFilterChain:function(a,c){var d;for(d=1;d<c.length;d++)c[d-1]._next=c[d];return c[d-1]._next=a,{rect:function(a){a=a?b.copyShallow(a):{},c[0].rect(a)},line:function(a){a=a?b.copyShallow(a):{},c[0].line(a)},text:function(a){return a=a?b.copyShallow(a):{},c[0].text(a)},measureText:function(a){return c[0].measureText(a)},circle:function(a){a=a?b.copyShallow(a):{},c[0].circle(a)}}},relative:function(a,c){return{_next:null,rect:function(d){return d=b.copyShallow(d),d.x=d.x?d.x+a:a,d.y=d.y?d.y+c:c,this._next.rect(d)},line:function(d){return d=b.copyShallow(d),d.x1=d.x1?d.x1+a:a,d.y1=d.y1?d.y1+c:c,d.x2=d.x2?d.x2+a:a,d.y2=d.y2?d.y2+c:c,this._next.line(d)},text:function(d){return d=b.copyShallow(d),d.x=d.x?d.x+a:a,d.y=d.y?d.y+c:c,this._next.text(d)},measureText:function(a){return a=b.copyShallow(a),this._next.measureText(a)},circle:function(d){return d=b.copyShallow(d),d.x=d.x?d.x+a:a,d.y=d.y?d.y+c:c,this._next.circle(d)}}},verticalFlow:function(a){var c=3,d=c;return{_next:null,rect:function(a){throw a=b.copyShallow(a),new Error("Not implemented yet.")},line:function(a){a=b.copyShallow(a),a.y1||(a.y1=d),a.y2||(a.y2=d),this._next.line(a),d=Math.max(a.y1,a.y2)+c},text:function(e){e=b.copyShallow(e),e.y||(e.y=d);var f=e.align||"left",g;if(f==="center")g=this._next.measureText({text:e.text}),e.x=0,a>g.width&&(e.x=(a-g.width)/2);else{if(f==="right")throw new Error("TODO: not implemented yet.");e.x=e.x?e.x+c:c}return g=this._next.text(e),d=e.y+g.height+c,g},measureText:function(a){return a=b.copyShallow(a),this._next.measureText(a)},circle:function(a){return a=b.copyShallow(a),this._next.circle(a)}}}}}),define("presenter/renderers",["require","presenter/renderFilters"],function(a){function c(a){var b={lines:[],properties:{}},c=a.split("\n");return c.forEach(function(a){var c=a.match(/^\{\{([^=]+)=([^}]+)\}\}$/);c===null?b.lines.push(a):b.properties[c[1]]=c[2]}),b}var b=a("presenter/renderFilters"),d;return{rendererForItem:function(a){if(!d){d={node:this.nodeRenderer(),"class":this.classNodeRenderer(),useCase:this.useCaseNodeRenderer(),line:this.lineRenderer(),actor:this.actorRenderer(),note:this.noteRenderer()};if(!d[a.kind])throw new Error("I don't have renderer for item with kind '{kind}'".supplant({kind:a.kind}))}return d[a.kind]},nodeRenderer:function(){var a={};return a.TEXT_PADDING=5,a._render=function(a){var b=a.item,d=a.view;d.clear(),d.updateBounds({x:b.x,y:b.y,width:b.width,height:b.height}),d.isSelected(a.isSelected);var e=c(b.text),f=e.properties.fill||"white",g=e.properties.stroke||"black";return{lines:e.lines,properties:e.properties,fillColor:f,strokeColor:g}},a.render=function(c){var d=a._render(c),e=c.item,f=c.view;f.rect({x:e.x,y:e.y,width:e.width,height:e.height,rx:3,ry:3,fill:d.fillColor,stroke:d.strokeColor});var g=b.renderFilterChain(f,[b.verticalFlow(e.width),b.relative(e.x,e.y)]);d.lines.forEach(function(a){g.text({text:a})})},a.showNearbyConnectionPoint=function(a,b,c,d,e){var f,g,h,i,j,k=[];Math.abs(c-a.x)<e&&(i=Math.floor(d/e)*e,j=i+e,k.push({x:a.x,y:i}),k.push({x:a.x,y:j})),Math.abs(c-(a.x+a.width))<e&&(i=Math.floor(d/e)*e,j=i+e,k.push({x:a.x+a.width,y:i}),k.push({x:a.x+a.width,y:j})),Math.abs(d-a.y)<e&&(g=Math.floor(c/e)*e,h=g+e,k.push({x:g,y:a.y}),k.push({x:h,y:a.y})),Math.abs(d-(a.y+a.height))<e&&(g=Math.floor(c/e)*e,h=g+e,k.push({x:g,y:a.y+a.height}),k.push({x:h,y:a.y+a.height}));var l=Infinity;k.forEach(function(a){var b=Math.pow(Math.abs(a.x-c),2)+Math.pow(Math.abs(a.y-d),2);b<l&&(f=a,l=b)}),f?b.showConnectionPoint(f):b.hideConnectionPoints()},a},classNodeRenderer:function(){var a=this.nodeRenderer();return a.render=function(c){var d=a._render(c),e=c.item,f=c.view;f.rect({x:e.x,y:e.y,width:e.width,height:e.height,rx:3,ry:3,fill:d.fillColor,stroke:d.strokeColor});var g=b.renderFilterChain(f,[b.verticalFlow(e.width),b.relative(e.x,e.y)]),h=!0;d.lines.forEach(function(a){a==="--"?(g.line({x1:0,x2:e.width,stroke:d.strokeColor}),h=!1):g.text({text:a,align:h?"center":"left"})})},a},useCaseNodeRenderer:function(){var a=this.nodeRenderer();return a.render=function(c){var d=a._render(c),e=c.item,f=c.view,g=e.width/2,h=e.height/2;f.ellipse({cx:e.x+g,cy:e.y+h,rx:g,ry:h,fill:d.fillColor,stroke:d.strokeColor,"stroke-width":1.5});var i=b.renderFilterChain(f,[b.verticalFlow(e.width),b.relative(e.x,e.y)]),j=0,k=0;d.lines.forEach(function(a){j+=f.measureText({text:a}).height}),e.height>j&&(k=(e.height-j)/2),d.lines.forEach(function(a,b){b===0?i.text({y:k,text:a,align:"center"}):i.text({text:a,align:"center"})})},a},actorRenderer:function(){var a=this.nodeRenderer();return a.render=function(c){var d=a._render(c),e=c.item,f=c.view,g=0;d.lines.forEach(function(a){g+=f.measureText({text:a}).height});var h=Math.min(e.height-g,e.height),i=e.x,j=e.y;f.circle({cx:i+e.width/2,cy:j+h/6,r:Math.min(e.width/2,h/6),stroke:d.strokeColor,fill:d.fillColor,"stroke-width":1.5});var k=f.path({stroke:d.strokeColor,"stroke-width":1.5});k.moveTo(i+e.width/2,j+h/3).lineTo(i+e.width/2,j+2*h/3).moveTo(i+e.width/2,j+2*h/3).lineTo(i,j+h).moveTo(i+e.width/2,j+2*h/3).lineTo(i+e.width,j+h).moveTo(i,j+h/2.5).lineTo(i+e.width,j+h/2.5).done();var l=b.renderFilterChain(f,[b.verticalFlow(e.width),b.relative(i,j+h)]);d.lines.forEach(function(a){l.text({text:a,align:"center"})})},a},noteRenderer:function(){var a=this.nodeRenderer();return a.render=function(c){var d=a._render(c),e=c.item,f=c.view,g=20,h=e.x,i=e.y,j=e.width,k=e.height,l=f.path({stroke:d.strokeColor,"stroke-width":1.5,fill:d.fillColor});l.moveTo(h+j-g,i).lineTo(h+j-g,i+g).lineTo(h+j,i+g).lineTo(h+j-g,i).lineTo(h,i).lineTo(h,i+k).lineTo(h+j,i+k).lineTo(h+j,i+g).done();var m=b.renderFilterChain(f,[b.verticalFlow(e.width),b.relative(h,i)]);d.lines.forEach(function(a){m.text({text:a})})},a},lineRenderer:function(){var a={};return a.render=function(a){var d,e,f=a.item,g=a.view,h=c(f.text),i=h.properties.lineType||"->",j={x1:f.points(0).x,y1:f.points(0).y,x2:f.points(1).x,y2:f.points(1).y,strokeColor:h.properties.stroke||"black",fillColor:h.properties.fill||"white",lineType:i.substr(0,1),headType:i.substr(1),lines:h.lines};j.headType==="<<>>"&&(j.fillColor=j.strokeColor),g.clear(),g.updateBounds(j),g.isSelected(a.isSelected);var k={x1:j.x1,y1:j.y1,x2:j.x2,y2:j.y2,stroke:j.strokeColor,"stroke-width":1.5,fill:j.fillColor};j.lineType==="."&&(k["stroke-dasharray"]="8 5"),g.line(k);if(j.headType!==""){var l=20,m=Math.atan2(j.y2-j.y1,j.x2-j.x1),n=g.path({stroke:j.strokeColor,"stroke-width":1.5,fill:j.fillColor});if(j.headType===">")n.moveTo(j.x2,j.y2).lineTo(j.x2-l*Math.cos(m-Math.PI/6),j.y2-l*Math.sin(m-Math.PI/6)).moveTo(j.x2,j.y2).lineTo(j.x2-l*Math.cos(m+Math.PI/6),j.y2-l*Math.sin(m+Math.PI/6)).moveTo(j.x2,j.y2);else if(j.headType===">>")n.moveTo(j.x2,j.y2).lineTo(j.x2-l*Math.cos(m-Math.PI/6),j.y2-l*Math.sin(m-Math.PI/6)).lineTo(j.x2-l*Math.cos(m+Math.PI/6),j.y2-l*Math.sin(m+Math.PI/6)).closePath();else if(j.headType==="<>"||j.headType==="<<>>")d=j.x2,e=j.y2,n.moveTo(d,e),d-=l*Math.cos(m-Math.PI/6),e-=l*Math.sin(m-Math.PI/6),n.lineTo(d,e),d-=l*Math.cos(m+Math.PI/6),e-=l*Math.sin(m+Math.PI/6),n.lineTo(d,e),d+=l*Math.cos(m-Math.PI/6),e+=l*Math.sin(m-Math.PI/6),n.lineTo(d,e),n.closePath();n.done()}if(j.lines.length>0){d=Math.min(j.x1,j.x2),e=Math.min(j.y1,j.y2);var o=Math.max(j.x1,j.x2)-d,p=Math.max(j.y1,j.y2)-e,q=b.renderFilterChain(g,[b.verticalFlow(o),b.relative(d,e)]),r=0,s=0;j.lines.forEach(function(a){r+=g.measureText({text:a}).height}),p>r&&(s=(p-r)/2),j.lines.forEach(function(a,b){b===0?q.text({y:s,text:a,align:"center"}):q.text({text:a,align:"center"})})}},a}}}),define("presenter/commandExecutor",["require"],function(a){return function(){var a={},b=[];return a.execute=function(a){b.push(a),a.execute()},a.undo=function(a){if(b.length>0)return b.pop().undo()},a}}),define("presenter/diagramPresenter",["require","presenter/commands","presenter/renderers","presenter/commandExecutor","utils","view"],function(a){var b=a("presenter/commands"),c=a("presenter/renderers"),d=a("presenter/commandExecutor");return function(e,f,g,h){function u(){h||(h=a("view")),o=d(),r=hb(),l=h.keyboard(),n=h.itemEditView(g);var b=h.rootView(f);p=h.diagramView(b),p.gridStep=j,e.items().forEach(function(a){if(a.isNode)v(a);else{if(!a.isLine)throw new Error("Don't know what this item is: "+a.kind);w(a)}}),p.update(),p.click(D),p.dragStart(E),p.dragMove(F),p.dragEnd(G),e.itemAdded(y),e.itemRemoved(z),n.focus(L),n.blur(M),l.keyUp(C),q.forEach(function(a){x(a)})}function v(a){var b=h.nodeView(p),c=i.objectWithId();return c.item=a,c.view=b,c.isSelected=!1,q.push(c),a.change(A),b.mouseDown(H),b.click(I),b.doubleClick(J),b.dragStart(N),b.dragMove(O),b.dragEnd(P),b.resizeDragStart(Q),b.resizeDragMove(R),b.resizeDragEnd(S),b.connectPointDragStart(T),b.connectPointDragMove(U),b.connectPointDragEnd(W),b.connectPointDrop(V),b.mouseEnter(X),b.mouseLeave(Y),b.mouseMove(Z),c}function w(a){var b=h.lineView(p),c=i.objectWithId();return c.item=a,c.view=b,c.isSelected=!1,q.push(c),a.change(B),b.mouseDown(H),b.click(I),b.doubleClick(J),b.mouseEnter(cb),b.mouseLeave(db),b.connectPointDragStart($),b.connectPointDragMove(_),b.connectPointDragEnd(bb),b.connectPointDrop(ab),c}function x(a){var b=c.rendererForItem(a.item);b.render(a)}function y(a,b){if(b.isLine)w(b);else{if(!b.isNode)throw new Error("Unexpected item, kind='{kind}'.".supplant({kind:b.kind}));v(b)}x(q.forItem(b))}function z(a,b){var c=q.forItem(b);c.view.remove(),q.remove(c)}function A(a){x(q.forItem(a))}function B(a){x(q.forItem(a))}function C(a){if(a.ctrlKey===!0&&a.which===90){var c=o.undo();r.select(c)}if(a.which===46&&r.itemInfos().length>0){var d=b.deleteItemsCommand(e,r.itemInfos());o.execute(d)}}function D(a){r.clear()}function E(a){}function F(a,b,c){var d=gb({x:m.left+b,y:m.top+c});a.scrollTo(d.x,d.y)}function G(a,b,c){var d=gb({x:m.left+b,y:m.top+c});m.left=d.x,m.top=d.y}function H(a){var b=q.forView(a);l.isCtrlKeyDown()||b.isSelected||r.select(b)}function I(a){var b=q.forView(a);l.isCtrlKeyDown()&&r.addOrRemove(b)}function J(a){}function K(a){fb(),!r.isMultiple()&&a.isSelected?n.text(a.item.text):n.text("")}function L(a){eb()}function M(a){fb()}function N(a){s=b.moveCommand(r.itemInfos())}function O(a,b,c){var d=gb({x:b,y:c});s.dx=d.x,s.dy=d.y,s.preview()}function P(a,b,c){s.cancelPreview();var d=gb({x:b,y:c});s.dx=d.x,s.dy=d.y,o.execute(s),s=null}function Q(a){s=b.resizeNodeCommand(r.itemInfos())}function R(a,b,c){var d=gb({x:b,y:c});s.dWidth=d.x,s.dHeight=d.y,s.preview()}function S(a,b,c){s.cancelPreview();var d=gb({x:b,y:c});s.dWidth=d.x,s.dHeight=d.y,o.execute(s),s=null}function T(a,c,d){var f=q.forView(a).item;s=b.createLineCommand(e,f,c,d),t=!0}function U(a,b,c){var d=gb({x:b,y:c});s.x2=s.x1+d.x,s.y2=s.y1+d.y,s.preview()}function V(a,b,c){s.itemToConnect=q.forView(a),s.x2=b,s.y2=c}function W(a,b,c){s.cancelPreview(),o.execute(s),s=null,t=!1}function X(a){}function Y(a){a.hideResizeBorder(),a.hideConnectionPoints()}function Z(a,b,d){b-=m.left,d-=m.top,l.isCtrlKeyDown()&&a.showResizeBorder();var e=q.forView(a),f=c.rendererForItem(e.item);if(!l.isCtrlKeyDown()){if(s&&s.isMoveCommand)return;f.showNearbyConnectionPoint(e.item,a,b,d,j)}}function $(a,c,d){a.hideConnectionPoints();var e=q.forView(a).item,f=e.pointAt(c,d);s=b.moveLinePointCommand(f)}function _(a,b,c){var d=gb({x:b,y:c});s.dx=d.x,s.dy=d.y,s.preview()}function ab(a,b,c){var d=q.forView(a).item;s.itemToConnect=d.pointAt(b,c)}function bb(a,b,c){s.cancelPreview(),o.execute(s),s=null}function cb(a){if(!t){var b=q.forView(a).item;a.showConnectionPoints(b.points())}}function db(a){t||a.hideConnectionPoints()}function eb(){s&&(s.cancelPreview&&s.cancelPreview(),s=null),r.itemInfos().length===1&&(s=b.editItemCommand(r.itemInfos(0).item))}function fb(){s&&s.isEditItemCommand&&(s.newText=n.text(),s.hasChanged()&&(o.execute(s),s=null))}function gb(a){var b=function(a,b){var c=Math.floor(a/b)*b,d=c+b;return Math.abs(a-d)<Math.abs(a-c)?d:c};return a.x=b(a.x,j),a.y=b(a.y,j),a.width&&(a.width=b(a.width,j)),a.height&&(a.height=b(a.height,j)),a}function hb(){var a=[];return{addOrRemove:function(a){a.isSelected?this.remove(a):this.add(a)},add:function(b){a.push(b),b.isSelected=!0,K(b),x(b)},remove:function(b){var c=a.indexOf(b);a.splice(c,1),b.isSelected=!1,K(b),x(b)},select:function(a){this.clear();if(Array.isArray(a)){var b=this;a.forEach(function(a){b.add(a)})}else this.add(a)},clear:function(){var b;while(b=a.pop())b.isSelected=!1,K(b),x(b)},itemInfos:function(b){return arguments.length===0?a.slice():a[b]},isMultiple:function(){return a.length>1},length:function(){return a.length}}}var i=a("utils"),j=15,k={},l,m={top:0,left:0},n,o,p,q=[],r,s,t=!1;return q.forView=function(a){var b;for(b=0;b<this.length;b++)if(this[b].view===a)return this[b];throw new Error("Item view not found.")},q.forItem=function(a){var b;for(b=0;b<this.length;b++)if(this[b].item===a)return this[b];throw new Error("Item not found.")},q.remove=function(a){var b=q.indexOf(a);q.splice(b,1)},k.fitContent=function(a){var b=q.forItem(a).view,d=b.contentSize(),e=c.rendererForItem(a).TEXT_PADDING;a.resizeTo(d.width+e,d.height+e)},k.diagramSize=function(){return p.size()},u(),k._test={itemInfos:q,selection:r},k}}),define("inspectObjectDemo",["require","exports","module","model","view","presenter/diagramPresenter"],function(a,b,c){$.browser.webkit||alert("Use Google Chrome or Safari if possible. I haven't time to make this work properly on other browsers. Sorry about that :(");var d=!1,e=a("model"),f=a("view"),g=a("presenter/diagramPresenter");window.requestAnimationFrame||(window.requestAnimationFrame=function(){return window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a,b){window.setTimeout(a,1e3/60)}}()),$(document).ready(function(){function k(a){l(a);var b;while(b=h.pop())delete b._inspectOid;i={},j=0}function l(c){if(c.hasOwnProperty("_inspectOid"))return i[c._inspectOid];h.push(c);var d=e.node({kind:"class"});a.addItem(d),c._inspectOid=++j,i[c._inspectOid]=d;var f=m(c);f+="\n--\n";var g=[],k=[];Object.keys(c).forEach(function(a){if(a==="_inspectOid")return;var b=c[a];if(b instanceof Function)k.push(a+"()");else if(b instanceof Object){var e=l(c[a]);n(e,d,"{{lineType=-<>}}\n"+a)}else{var f=a+": ";c[a]===undefined?f+="undefined":c[a]===null?f+="null":f+=c[a].toString(),g.push(f)}}),f+=g.join("\n"),k.length>0&&(f+="\n--\n"+k.join("\n")),d.text=f,b.fitContent(d);var o=Object.getPrototypeOf(c);if(o){var p=l(o);n(d,p,"{{lineType=->>}}")}return d}function m(a){if(a===Object.prototype)return"Object.prototype";if(a.constructor){var b=a.constructor.name;return a.constructor.prototype===a&&(b+=".prototype"),b}return"???"}function n(b,c,d){function i(a){return{x:Math.floor(a.x+a.width/2),y:Math.floor(a.y+a.height/2)}}var f=i(b),g=i(c),h=e.line({x1:f.x,y1:f.y,x2:g.x,y2:g.y});h.text=d,a.addItem(h),h.points(0).addConnection(b),h.points(1).addConnection(c)}function o(){function k(){b++,d&&console.log("ITERATION "+b),h.forEach(function(a){var b={x:0,y:0};h.forEach(function(c){a!==c&&(b=n(b,l(a,c)))}),a.edges.forEach(function(c){b=n(b,m(a,c))}),Math.abs(b.x)>50&&(b.x=b.x>0?50:-50),Math.abs(b.y)>50&&(b.y=b.y>0?50:-50),a.x+=Math.floor(b.x),a.y+=Math.floor(b.y),d&&(console.log(a.node.id+": <"+b.x+", "+b.y+">"),a.node.moveTo(a.x,a.y))}),d&&console.log(""),b<e?d?requestAnimationFrame(k):k():h.forEach(function(a){a.node.moveTo(a.x,a.y)})}function l(a,b){var c=1,d=p(a,b);d===0&&(d=1);var e=c/Math.sqrt(d),f=o(b,a);return f.x===0&&(f.x=1),f.y===0&&(f.y=1),f.x=e*f.x*-1,f.y=e*f.y*-1,f}function m(a,b){var c=1,d=(a.size+b.size)/2+100,e=p(a,b);e===0&&(e=d/10);var f=c*Math.log(e/d),g=o(b,a);return g.x===0&&(g.x=1),g.y===0&&(g.y=1),g.x=f*g.x,g.y=f*g.y,g}function n(a,b){return{x:a.x+b.x,y:a.y+b.y}}function o(a,b){return{x:a.x-b.x,y:a.y-b.y}}function p(a,b){return Math.sqrt(Math.pow(b.x-a.x,2)+Math.pow(b.y-a.y,2))}function q(a,b){var c=100,d=2*c,e=3*c;return function(){return d+=c,d>a&&(d=0,e+=c),e>b&&(e=0),{x:d,y:e}}}var b=0,e=30,g=a.items().filter(function(a){return a.isNode}),h=[],i={},j=q(c,f);g.forEach(function(a){var b=j();a.moveTo(b.x,b.y);var c={node:a,x:a.x,y:a.y,size:Math.max(a.width,a.height),velocity:{x:0,y:0},edges:[]};h.push(c),i[a.id]=c,d&&console.log("Created vertex at ["+c.x+", "+c.y+"]")}),h.forEach(function(a){a.node.connections().forEach(function(b){var c=b.line.points(0).connections(0)===a.node?b.line.points(1).connections(0):b.line.points(0).connections(0);c&&a.edges.push(i[c.id])})}),d?requestAnimationFrame(k):k()}function p(){function c(a,b){var c=[],e=[{x1:b.x,y1:b.y,x2:b.x+b.width,y2:b.y},{x1:b.x+b.width,y1:b.y,x2:b.x+b.width,y2:b.y+b.height},{x1:b.x+b.width,y1:b.y+b.height,x2:b.x,y2:b.y+b.height},{x1:b.x,y1:b.y+b.height,x2:b.x,y2:b.y}];return e.forEach(function(e){var f=d(a,e);f!==null&&f.x>=b.x&&f.x<=b.x+b.width&&f.y>=b.y&&f.y<=b.y+b.height&&c.push(f)}),c}function d(a,b){var c=f(a),d=g(a,c),h=f(b),i=g(b,h);if(c===h)return null;var j={};if(c===null||h===null){var k=c===null?h:c,l=c===null?i:d;j.x=c===null?a.x1:b.x2,j.y=k*j.x+l}else j.x=(i-d)/(c-h),j.y=c*j.x+d;return j.x=Math.round(j.x),j.y=Math.round(j.y),e(j,a)&&e(j,b)?j:null}function e(a,b){var c=Math.min(b.x1,b.x2),d=Math.max(b.x1,b.x2),e=Math.min(b.y1,b.y2),f=Math.max(b.y1,b.y2);return a.x>=c&&a.x<=d&&a.y>=e&&a.y<=f}function f(a){return a.x1===a.x2?null:(a.y1-a.y2)/(a.x1-a.x2)}function g(a,b){return a.y1-b*a.x1}var b=a.items().filter(function(a){return a.isLine});b.forEach(function(a){var b=a.points(0).connections(0),d=a.points(1).connections(0),e={x1:a.points(0).x,y1:a.points(0).y,x2:a.points(1).x,y2:a.points(1).y},f=c(e,b)[0],g=c(e,d)[0];a.points(0).x=f.x,a.points(0).y=f.y,a.points(1).x=g.x,a.points(1).y=g.y,a.fireChange()})}$("#demo").height($(document).height());var a=e.diagram();window.diagram=a;var b=g(a,$("#diagram"),$("#nodeEdit")),c=b.diagramSize().width-$("#controlPanel").width(),f=b.diagramSize().height;$("#autoLayout").click(function(){o()}),$("#pushArrows").click(function(){p()}),$("#inspect").click(function(){var b=$("#codeToInspect").val(),c=new Function(b),e=c();a.clear(),k(e),o(),d||p()});var h=[],i={},j=0})})