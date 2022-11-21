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
var COMBO = 'combo';
var NODE = 'node';
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
var NetworkTopology = /** @class */ (function () {
    function NetworkTopology(props) {
        var _this = this;
        var _a;
        this.sourceData = {
            nodes: [],
            edges: [],
            combos: []
        };
        this.displayObjectPool = {
            nodesGfx: [],
            edgesGfx: [],
            combos: {
                comboNodesGfx: [],
                comboHullsGfx: []
            }
        };
        this.combosStatus = {};
        this.renderData = {
            nodes: [],
            edges: []
        };
        this.appInit = function (_a) {
            var container = _a.container;
            // extensions.remove(InteractionManager);
            _this.app = new pixi_js_1.Application({
                resizeTo: container,
                antialias: !0,
                transparent: !0,
                resolution: 1
            });
            container.appendChild(_this.app.view);
            _this.transform = d3_1.zoomIdentity;
            // this.app.renderer.addSystem(EventSystem, 'events');
            _this.simulation = (0, d3_1.forceSimulation)()
                .force('charge', (0, d3_1.forceManyBody)().strength(-400))
                .force('link', (0, d3_1.forceLink)().id(function (d) { return d.id; }))
                .force('center', (0, d3_1.forceCenter)((_this.app.view.width) / 2, (_this.app.view.height) / 2));
        };
        this.displayObjectInit = function (data) {
            var _a, _b, _c, _d;
            if (data) {
                _this.sourceData = data;
                // 初始化 combosStatus
                (_a = data === null || data === void 0 ? void 0 : data.combos) === null || _a === void 0 ? void 0 : _a.forEach(function (combo, index) {
                    _this.combosStatus[combo.id] = {
                        expand: true,
                        comboNode: {
                            // id: `${COMBO}-${combo.id}`,
                            id: combo.id,
                            type: COMBO,
                            gfx: _this.displayObjectPool.combos.comboNodesGfx[index]
                        },
                        comboHull: {
                            gfx: _this.displayObjectPool.combos.comboHullsGfx[index]
                        },
                        nodes: []
                    };
                });
                // 绘制对象初始化
                if (data === null || data === void 0 ? void 0 : data.combos) {
                    _this.displayObjectPool.combos.comboHullsGfx = (_b = data === null || data === void 0 ? void 0 : data.combos) === null || _b === void 0 ? void 0 : _b.map(function () { return new pixi_js_1.Graphics(); });
                    _this.displayObjectPool.combos.comboNodesGfx = (_c = data === null || data === void 0 ? void 0 : data.combos) === null || _c === void 0 ? void 0 : _c.map(function () { return new pixi_js_1.Graphics(); });
                }
                if (data === null || data === void 0 ? void 0 : data.edges) {
                    _this.displayObjectPool.edgesGfx = (_d = data === null || data === void 0 ? void 0 : data.edges) === null || _d === void 0 ? void 0 : _d.map(function () {
                        var _a, _b, _c;
                        var gfx = new pixi_js_1.Graphics();
                        gfx.alpha = 0.6;
                        (_c = (_b = (_a = _this.app) === null || _a === void 0 ? void 0 : _a.stage) === null || _b === void 0 ? void 0 : _b.addChild) === null || _c === void 0 ? void 0 : _c.call(_b, gfx);
                        return gfx;
                    });
                }
                if (data === null || data === void 0 ? void 0 : data.nodes) {
                    _this.displayObjectPool.nodesGfx = data === null || data === void 0 ? void 0 : data.nodes.map(function (node) {
                        var _a, _b, _c;
                        if (node.comboId !== undefined) {
                            _this.combosStatus[node.comboId].nodes.push(node);
                        }
                        var gfx = new pixi_js_1.Graphics();
                        gfx.lineStyle(1.5, 0xFFFFFF);
                        gfx.beginFill(colorScale("".concat(node.comboId)));
                        gfx.drawCircle(0, 0, 20);
                        gfx.addChild(getPixiText(node.label || node.id || ''));
                        gfx.interactive = true;
                        gfx.buttonMode = true;
                        (_c = (_b = (_a = _this.app) === null || _a === void 0 ? void 0 : _a.stage) === null || _b === void 0 ? void 0 : _b.addChild) === null || _c === void 0 ? void 0 : _c.call(_b, gfx);
                        return gfx;
                    });
                }
            }
        };
        this.calculateRenderData = function () {
            var _a;
            _this.renderData = {
                nodes: [],
                edges: []
            };
            var settedCombo = new Set();
            var nodeIdComboIdMap = new Map();
            // 计算需要渲染的节点，包括收起的分组节点
            _this.sourceData.nodes.forEach(function (node, index) {
                // 有分组且收起
                if ((node === null || node === void 0 ? void 0 : node.comboId) !== undefined && _this.combosStatus[node === null || node === void 0 ? void 0 : node.comboId].expand === false) {
                    // 有分组未创建分组节点
                    if (!settedCombo.has(node.comboId)) {
                        _this.renderData.nodes.push(_this.combosStatus[node.comboId].comboNode);
                        settedCombo.add(node.comboId);
                    }
                }
                else {
                    // 没分组 或者 展开
                    _this.renderData.nodes.push(__assign(__assign({}, node), { 
                        // id: `${NODE}-${node.id}`,
                        id: node.id, type: NODE, gfx: _this.displayObjectPool.nodesGfx[index] }));
                }
                // 记录对应id
                nodeIdComboIdMap.set(node.id, node.comboId);
            });
            // 包括收起的分组节点的连线
            (_a = _this.sourceData.edges) === null || _a === void 0 ? void 0 : _a.forEach(function (edge, index) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                var newLink = {
                    gfx: _this.displayObjectPool.edgesGfx[index],
                    source: ((_b = (_a = _this.combosStatus) === null || _a === void 0 ? void 0 : _a[nodeIdComboIdMap.get(edge === null || edge === void 0 ? void 0 : edge.source)]) === null || _b === void 0 ? void 0 : _b.expand) === false
                        ? (_e = (_d = (_c = _this.combosStatus) === null || _c === void 0 ? void 0 : _c[nodeIdComboIdMap.get(edge === null || edge === void 0 ? void 0 : edge.source)]) === null || _d === void 0 ? void 0 : _d.comboNode) === null || _e === void 0 ? void 0 : _e.id
                        : edge.source,
                    target: ((_g = (_f = _this.combosStatus) === null || _f === void 0 ? void 0 : _f[nodeIdComboIdMap.get(edge === null || edge === void 0 ? void 0 : edge.target)]) === null || _g === void 0 ? void 0 : _g.expand) === false
                        ? (_k = (_j = (_h = _this.combosStatus) === null || _h === void 0 ? void 0 : _h[nodeIdComboIdMap.get(edge === null || edge === void 0 ? void 0 : edge.target)]) === null || _j === void 0 ? void 0 : _j.comboNode) === null || _k === void 0 ? void 0 : _k.id
                        : edge.target
                };
                _this.renderData.edges.push(newLink);
            });
            // 分配分组的gfx
        };
        this.simulateStart = function () {
            var _a, _b, _c, _d, _e;
            _this.simulation
                .nodes(_this.renderData.nodes);
            (_a = _this.simulation.force('link')) === null || _a === void 0 ? void 0 : _a.links(_this.renderData.edges);
            _this.simulation
                // 移除力
                .alphaTarget(0.1)
                .tick(300)
                .on('end', function () {
                var _a, _b, _c, _d, _e, _f;
                (_f = (_e = (_d = (_c = (_b = (_a = _this.simulation) === null || _a === void 0 ? void 0 : _a.force) === null || _b === void 0 ? void 0 : _b.call(_a, 'charge', null)) === null || _c === void 0 ? void 0 : _c.force) === null || _d === void 0 ? void 0 : _d.call(_c, 'center', null)) === null || _e === void 0 ? void 0 : _e.force) === null || _f === void 0 ? void 0 : _f.call(_e, 'link');
            });
            // 移除力
            // .on('tick', this.simulationTicked);
            ((_c = (_b = _this.app) === null || _b === void 0 ? void 0 : _b.ticker) === null || _c === void 0 ? void 0 : _c.maxFPS) !== undefined && (_this.app.ticker.maxFPS = 70);
            (_e = (_d = _this.app) === null || _d === void 0 ? void 0 : _d.ticker) === null || _e === void 0 ? void 0 : _e.add(_this.simulationTicked);
        };
        this.simulationTicked = function () {
            // 绘制节点
            _this.renderData.nodes.forEach(function (node) {
                var x = node.x, y = node.y, gfx = node.gfx;
                gfx.position = { x: x || 0, y: y || 0 };
            });
            // // 绘制 组/范围
            // Object.values(this.combosStatus).forEach((combo) => {
            //   if (combo.expand && (combo.nodes.length > 2)) {
            //     combo.comboHull.gfx.clear()
            //     const hullPoints = polygonHull(combo.nodes).map(item => [item.gfx.position._x, item.gfx.position._y])
            //     const hull = Delaunay.from(hullPoints)
            //     combo.hullGfx.beginFill(colorScale(combo.name), 0.2)
            //     hull.renderHull(combo.hullGfx);
            //     combo.hullGfx.endFill()
            //   }
            // })
            // 绘制线条
            _this.renderData.edges.forEach(function (edge) {
                var source = edge.source, target = edge.target, gfx = edge.gfx;
                gfx.clear();
                gfx.lineStyle({
                    width: 1,
                    color: 0x999999
                });
                gfx.moveTo((source === null || source === void 0 ? void 0 : source.x) || 0, source.y || 0);
                gfx.lineTo((target === null || target === void 0 ? void 0 : target.x) || 0, target.y || 0);
            });
        };
        this.onDragStart = function (e, d) {
            var _a, _b;
            _this.disableZoom();
            (_b = (_a = _this.simulation) === null || _a === void 0 ? void 0 : _a.alphaTarget(0.1)) === null || _b === void 0 ? void 0 : _b.restart();
            e.subject.fx = e.subject.x;
            e.subject.fy = e.subject.y;
        };
        this.onDragEnd = function (e) {
            var _a;
            (_a = _this.simulation) === null || _a === void 0 ? void 0 : _a.alphaTarget(0);
            // e.subject.fx = null;
            // e.subject.fy = null;
            _this.enableZoom();
        };
        this.onDragMove = function (e) {
            e.subject.fx = e.x;
            e.subject.fy = e.y;
        };
        this.enableDrag = function () {
            (0, d3_1.select)(_this.app.view)
                .call((0, d3_1.drag)()
                .container(_this.app.view)
                .subject(function (event) { return _this.simulation.find(_this.transform.invertX(event.x), _this.transform.invertY(event.y), 20); })
                .on('start', _this.onDragStart)
                .on('drag', _this.onDragMove)
                .on('end', _this.onDragEnd));
        };
        this.enableZoom = function () {
            (0, d3_1.select)(_this.app.view).call((0, d3_1.zoom)()
                .scaleExtent([0.5, 8])
                .on("zoom", function (_a) {
                var transform = _a.transform;
                _this.transform = transform;
                _this.app.stage.scale.x = transform.k;
                _this.app.stage.scale.y = transform.k;
                _this.app.stage.position.x = transform.x;
                _this.app.stage.position.y = transform.y;
            }));
        };
        this.disableZoom = function () {
            (0, d3_1.select)(_this.app.view).call((0, d3_1.zoom)()
                .on("zoom", null));
        };
        this.setData = function (data) {
            var _a, _b;
            (_b = (_a = _this.app.stage) === null || _a === void 0 ? void 0 : _a.removeChildren) === null || _b === void 0 ? void 0 : _b.call(_a);
            // TODO: 优化复用displayObjectPool
            _this.displayObjectInit(data);
            _this.render();
        };
        this.render = function () {
            _this.calculateRenderData();
            _this.simulateStart();
        };
        this.destroy = function () {
            var _a;
            _this.simulation.stop();
            (_a = _this.app) === null || _a === void 0 ? void 0 : _a.destroy(true, { children: true });
        };
        this.appInit(props);
        this.displayObjectInit((_a = props.data) !== null && _a !== void 0 ? _a : { nodes: [] });
        this.enableDrag();
        this.enableZoom();
        this.render();
    }
    return NetworkTopology;
}());
exports.NetworkTopology = NetworkTopology;
