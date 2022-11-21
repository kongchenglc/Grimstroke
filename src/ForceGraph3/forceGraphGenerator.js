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
exports.NetworkTopology = void 0;
var d3_1 = require("d3");
var pixi_js_1 = require("pixi.js");
var Node_1 = require("./components/Node");
var Edge_1 = require("./components/Edge");
var NetworkTopology = /** @class */ (function () {
    function NetworkTopology(props) {
        var _this = this;
        var _a;
        this.state = {
            combos: {}
        };
        this.model = {
            nodes: [],
            edges: [],
            combos: []
        };
        this.appInit = function (_a) {
            var container = _a.container;
            _this.app = new pixi_js_1.Application({
                resizeTo: container,
                antialias: !0,
                transparent: !0,
                resolution: 1
            });
            container.appendChild(_this.app.view);
            _this.simulation = (0, d3_1.forceSimulation)()
                .force('link', (0, d3_1.forceLink)().id(function (d) { return d.id; }));
        };
        this.tickerInit = function () {
            var _a;
            _this.ticker = new pixi_js_1.Ticker();
            _this.ticker.autoStart = true;
            ((_a = _this.ticker) === null || _a === void 0 ? void 0 : _a.maxFPS) !== undefined && (_this.ticker.maxFPS = 70);
        };
        // private componentsPoolInit = (data: ISourceData) => {
        // }
        this.modelInit = function (data) {
            var _a, _b;
            if (data) {
                // // 初始化 combos model
                // data?.combos?.forEach((combo, index) => {
                //   let comboModel: IComboComponentModel = {
                //     comboNode: {
                //       id: combo.id,
                //       type: COMBO,
                //       renderer: new Node({
                //         x: 1000,
                //         y: 1000,
                //         container: this.app,
                //         node: {
                //           id: combo.id
                //         }
                //       })
                //     },
                //     comboHull: {
                //       renderer: new Graphics()
                //     },
                //     nodes: []
                //   }
                //   this.model.combos[index] = comboModel
                // })
                // 初始化 edges model
                (_a = data === null || data === void 0 ? void 0 : data.edges) === null || _a === void 0 ? void 0 : _a.forEach(function (edge, index) {
                    var edgeModel = {
                        source: edge.source,
                        target: edge.target,
                        renderer: new Edge_1.Edge({
                            container: _this.app,
                            source: edge.source,
                            target: edge.target,
                            width: 2
                        })
                    };
                    _this.model.edges[index] = edgeModel;
                });
                // 初始化 node model
                (_b = data === null || data === void 0 ? void 0 : data.nodes) === null || _b === void 0 ? void 0 : _b.forEach(function (node, index) {
                    var nodeModel = {
                        x: -1000,
                        y: -1000,
                        id: node.id,
                        type: Node_1.NODE,
                        renderer: new Node_1.Node(__assign(__assign({}, node), { type: Node_1.NODE, container: _this.app }))
                    };
                    _this.model.nodes[index] = nodeModel;
                });
            }
        };
        this.stateInit = function (data) {
            var _a;
            (_a = data.combos) === null || _a === void 0 ? void 0 : _a.forEach(function (combo) {
                _this.state.combos[combo.id] = {
                    expand: true
                };
            });
        };
        this.updateModel = function () {
            // TODO: 根据 state 和 pool 更新 Model
            _this.model = _this.model;
        };
        this.layout = function () {
            var _a;
            _this.simulation
                .force('charge', (0, d3_1.forceManyBody)().strength(-400))
                .force('center', (0, d3_1.forceCenter)((_this.app.view.width) / 2, (_this.app.view.height) / 2));
            _this.simulation.nodes(_this.model.nodes);
            (_a = _this.simulation.force('link')) === null || _a === void 0 ? void 0 : _a.links(_this.model.edges);
            _this.simulation
                .alpha(1)
                .tick(300)
                .alpha(0)
                .on('end', function () {
                var _a, _b, _c, _d;
                (_d = (_c = (_b = (_a = _this.simulation) === null || _a === void 0 ? void 0 : _a.force) === null || _b === void 0 ? void 0 : _b.call(_a, 'charge', null)) === null || _c === void 0 ? void 0 : _c.force) === null || _d === void 0 ? void 0 : _d.call(_c, 'center', null);
            });
        };
        this.reset = function () {
            var _a, _b, _c, _d;
            (_b = (_a = _this.ticker) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_d = (_c = _this.app.stage) === null || _c === void 0 ? void 0 : _c.removeChildren) === null || _d === void 0 ? void 0 : _d.call(_c);
            _this.state = {
                combos: {}
            };
            _this.model = {
                nodes: [],
                edges: [],
                combos: []
            };
            _this.model = {
                nodes: [],
                edges: [],
                combos: []
            };
        };
        this.setData = function (data) {
            // TODO: 优化复用displayObjectPool
            _this.reset();
            _this.tickerInit();
            _this.modelInit(data);
            _this.stateInit(data);
            _this.layout();
            _this.render();
        };
        this.destroy = function () {
            var _a, _b, _c;
            (_a = _this.ticker) === null || _a === void 0 ? void 0 : _a.destroy();
            (_b = _this.simulation) === null || _b === void 0 ? void 0 : _b.stop();
            (_c = _this.app) === null || _c === void 0 ? void 0 : _c.destroy(true, { children: true });
        };
        var data = (_a = props.data) !== null && _a !== void 0 ? _a : { nodes: [] };
        this.appInit(props);
        this.tickerInit();
        // this.componentsPoolInit(data)
        this.modelInit(data);
        this.stateInit(data);
        this.layout();
        this.render();
    }
    NetworkTopology.prototype.render = function () {
        var _this = this;
        // TODO: model 标记更新
        this.ticker.add(function () {
            // 绘制节点
            _this.model.nodes.forEach(function (node) {
                var x = node.x, y = node.y, renderer = node.renderer;
                renderer.setState({ x: x, y: y });
            });
            // // 绘制 组/范围
            // Object.values(this.state.combos).forEach((combo) => {
            //   if (combo.expand && (combo.nodes.length > 2)) {
            //     combo.comboHull.renderer.clear()
            //     const hullPoints = polygonHull(combo.nodes).map(item => [item.renderer.position._x, item.renderer.position._y])
            //     const hull = Delaunay.from(hullPoints)
            //     combo.hullGfx.beginFill(colorScale(combo.name), 0.2)
            //     hull.renderHull(combo.hullGfx);
            //     combo.hullGfx.endFill()
            //   }
            // })
            // 绘制线条
            _this.model.edges.forEach(function (edge) {
                var source = edge.source, target = edge.target, renderer = edge.renderer;
                renderer.setState({
                    source: source,
                    target: target
                });
            });
        });
    };
    return NetworkTopology;
}());
exports.NetworkTopology = NetworkTopology;
