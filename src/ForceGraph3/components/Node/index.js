"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.Node = exports.NODE = exports.COMBO = void 0;
var d3_1 = require("d3");
var pixi_js_1 = require("pixi.js");
var colorScale = (function () {
    var scale = (0, d3_1.scaleOrdinal)(d3_1.schemeCategory10);
    return function (num) { return parseInt(scale(num).slice(1), 16); };
})();
var getPixiText = function (value) {
    var text = new pixi_js_1.Text(value, {
        fontSize: 12,
        fill: '#FFF'
    });
    text.anchor.set(0.5);
    text.resolution = 5;
    return text;
};
exports.COMBO = 'combo';
exports.NODE = 'node';
var Node = /** @class */ (function () {
    function Node(props) {
        var _this = this;
        this.stateInit = function (props) {
            var _a, _b, _c;
            _this.state = __assign(__assign({}, props), { x: (_a = props.x) !== null && _a !== void 0 ? _a : -1000, y: (_b = props.y) !== null && _b !== void 0 ? _b : -1000, type: (_c = props.type) !== null && _c !== void 0 ? _c : exports.NODE });
        };
        this.modelInit = function () {
            var _a, _b, _c;
            var gfx = new pixi_js_1.Graphics();
            gfx.lineStyle(1.5, 0xFFFFFF);
            gfx.beginFill(colorScale("".concat(_this.state.comboId)));
            gfx.drawCircle(0, 0, 20);
            gfx.addChild(getPixiText(_this.state.label || _this.state.id || ''));
            gfx.interactive = true;
            gfx.buttonMode = true;
            (_c = (_b = (_a = _this.container) === null || _a === void 0 ? void 0 : _a.stage) === null || _b === void 0 ? void 0 : _b.addChild) === null || _c === void 0 ? void 0 : _c.call(_b, gfx);
            _this.model = {
                x: -10000,
                y: -10000,
                id: _this.state.id,
                type: _this.state.type,
                renderer: gfx
            };
        };
        this.setState = function (newState) {
            _this.state = __assign(__assign({}, _this.state), newState);
            _this.updateModel();
            _this.render();
        };
        this.updateModel = function () {
            _this.model = {
                x: _this.state.x,
                y: _this.state.y,
                id: _this.state.id,
                type: _this.state.type,
                renderer: _this.model.renderer
            };
        };
        this.container = props.container;
        this.stateInit(props);
        this.modelInit();
    }
    Node.prototype.render = function () {
        this.model.renderer.position = {
            x: this.state.x,
            y: this.state.y
        };
    };
    return Node;
}());
exports.Node = Node;
