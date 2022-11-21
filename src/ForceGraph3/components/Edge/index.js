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
exports.Edge = void 0;
var pixi_js_1 = require("pixi.js");
var Edge = /** @class */ (function () {
    function Edge(props) {
        var _this = this;
        this.stateInit = function (_a) {
            var _b = _a.width, width = _b === void 0 ? 10 : _b, source = _a.source, target = _a.target;
            _this.state = {
                width: width,
                source: source,
                target: target
            };
        };
        this.modelInit = function () {
            var _a, _b, _c;
            var gfx = new pixi_js_1.Graphics();
            gfx.alpha = 0.6;
            (_c = (_b = (_a = _this.container) === null || _a === void 0 ? void 0 : _a.stage) === null || _b === void 0 ? void 0 : _b.addChild) === null || _c === void 0 ? void 0 : _c.call(_b, gfx);
            _this.model = {
                source: _this.state.source,
                target: _this.state.target,
                width: _this.state.width,
                renderer: gfx
            };
        };
        this.tickerInit = function () {
            var _a;
            _this.ticker = new pixi_js_1.Ticker();
            _this.ticker.autoStart = true;
            ((_a = _this.ticker) === null || _a === void 0 ? void 0 : _a.maxFPS) !== undefined && (_this.ticker.maxFPS = 70);
        };
        this.startAnimation = function () {
            var _a, _b;
            (_b = (_a = _this.ticker) === null || _a === void 0 ? void 0 : _a.add) === null || _b === void 0 ? void 0 : _b.call(_a, function () {
                var _a, _b;
                _this.setState({
                    width: ((_a = _this.state) === null || _a === void 0 ? void 0 : _a.width) <= 7
                        ? ((_b = _this.state) === null || _b === void 0 ? void 0 : _b.width) + 0.1
                        : 1
                });
            });
        };
        this.updateModel = function () {
            _this.model = {
                source: _this.state.source,
                target: _this.state.target,
                width: _this.state.width,
                renderer: _this.model.renderer
            };
        };
        this.setState = function (newState) {
            _this.state = __assign(__assign({}, _this.state), newState);
            _this.updateModel();
            _this.render();
        };
        this.container = props.container;
        this.stateInit(props);
        this.modelInit();
        this.tickerInit();
        this.startAnimation();
    }
    Edge.prototype.render = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        (_c = (_b = (_a = this.model) === null || _a === void 0 ? void 0 : _a.renderer) === null || _b === void 0 ? void 0 : _b.clear) === null || _c === void 0 ? void 0 : _c.call(_b);
        (_f = (_e = (_d = this.model) === null || _d === void 0 ? void 0 : _d.renderer) === null || _e === void 0 ? void 0 : _e.lineStyle) === null || _f === void 0 ? void 0 : _f.call(_e, {
            width: this.model.width,
            color: 0x999999
        });
        (_j = (_h = (_g = this.model) === null || _g === void 0 ? void 0 : _g.renderer) === null || _h === void 0 ? void 0 : _h.moveTo) === null || _j === void 0 ? void 0 : _j.call(_h, ((_k = this.model.source) === null || _k === void 0 ? void 0 : _k.x) || 0, ((_l = this.model.source) === null || _l === void 0 ? void 0 : _l.y) || 0);
        (_p = (_o = (_m = this.model) === null || _m === void 0 ? void 0 : _m.renderer) === null || _o === void 0 ? void 0 : _o.lineTo) === null || _p === void 0 ? void 0 : _p.call(_o, ((_q = this.model.target) === null || _q === void 0 ? void 0 : _q.x) || 0, ((_r = this.model.target) === null || _r === void 0 ? void 0 : _r.y) || 0);
    };
    return Edge;
}());
exports.Edge = Edge;
