import * as d3 from "d3";
import * as PIXI from "pixi.js";
import { EventSystem } from '@pixi/events';

PIXI.extensions.remove(PIXI.InteractionManager);

const colorScale = (function () {
  let scale = d3.scaleOrdinal(d3.schemeCategory10);
  return (num) => parseInt(scale(num).slice(1), 16);
})();

const getPixiText = (value) => {
  const text = new PIXI.Text(value, {
    fontSize: 12,
    fill: '#FFF'
  });
  text.anchor.set(0.5);
  text.resolution = 2;
  return text
}

export function runForceGraphPixi(
  container,
  sourceData,
) {
  let app;
  let simulation;
  let linksGfx;

  let clustersModel = {};

  let renderData = {
    nodes: [],
    links: [],
  }

  appInit()
  setClustersModel()
  calculateRenderData()
  graphInit()
  simulatStart()
  dragable()


  function appInit() {
    // 创建PIXI画布
    const containerRect = container.getBoundingClientRect();
    const height = containerRect.height;
    const width = containerRect.width;
    app = new PIXI.Application({
      width, height,
      antialias: !0,
      transparent: !0,
      resolution: 1
    });
    container.appendChild(app.view);
    app.renderer.addSystem(EventSystem, 'events');

    // 创建simulation
    simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-400))
      .force('link', d3.forceLink().id((d) => d.id))
      .force('center', d3.forceCenter(width / 2, height / 2));

    simulation
      .nodes(sourceData.nodes)

    simulation.force('link')
      .links(sourceData.links);
  }

  function setClustersModel(groupName, key, value = null) {
    // 不传参数就初始化
    if (groupName === undefined || key === undefined) {
      let newClustersModel = {}
      sourceData.nodes.forEach(node => {
        if (!newClustersModel[node.group]) {
          newClustersModel[node.group] = {
            name: node.group,
            expond: true,
            points: [node],
            centroidNode: null, // 质心节点
            hullGfx: null // 范围的绘制模型
          }
        } else {
          newClustersModel[node.group].points.push(node)
        }
      });
      clustersModel = newClustersModel
      return
    } else {
      clustersModel[groupName][key] = value
    }
  }

  function calculateRenderData() {
    renderData = {
      nodes: [],
      links: [],
    }
    const settedCentroidNode = {}

    // nodes
    sourceData.nodes.forEach(node => {
      if (clustersModel[node.group].expond) {
        renderData.nodes.push(node)
      } else {
        // 收起情况下，一个组 push 一个质心节点
        if (!settedCentroidNode[node.group]) {
          if (!clustersModel[node.group].centroidNode) {
            clustersModel[node.group].centroidNode = {
              id: `group-${node.group}`,
              name: node.group,
              group: node.group,
              type: 'centroid',
            }
          }
          renderData.nodes.push(clustersModel[node.group].centroidNode)
          settedCentroidNode[node.group] = true
        }
      }
    })

    // links
    sourceData.links.forEach(link => {
      let newLink = {
        source:
          clustersModel[link.source.group].expond !== true
            ? clustersModel[link.source.group].centroidNode.id
            : link.source,
        target:
          clustersModel[link.target.group].expond !== true
            ? clustersModel[link.target.group].centroidNode.id
            : link.target
      }
      renderData.links.push(newLink)
    })
  }

  function changeExpond(groupName) {
    console.log(groupName)
    // 更新 clustersModel
    setClustersModel(groupName, 'expond', !clustersModel[groupName].expond)
    // 重新计算 renderData
    reFresh()
  }

  function reFresh() {
    app.stage.removeChildren()
    simulation.stop()

    calculateRenderData()
    graphInit()

    simulatStart()
    simulation
      .alphaTarget(0.3)
      .restart();
  }

  function graphInit() {
    // 构建绘制模型 范围/分组
    for (const key in clustersModel) {
      if (Object.hasOwnProperty.call(clustersModel, key)) {
        const group = clustersModel[key];
        group.hullGfx = new PIXI.Graphics()

        group.hullGfx.interactive = true
        group.hullGfx.buttonMode = true
        group.hullGfx.on('click', (e) => {
          if (e.detail === 2) {
            changeExpond(group.name)
          }
        })

        group.hullGfx.lineStyle({
          join: PIXI.LINE_JOIN.ROUND
        });
        app.stage.addChild(group.hullGfx);
      }
    }

    //构建绘制模型 线
    linksGfx = new PIXI.Graphics();
    app.stage.addChild(linksGfx);

    // 构建绘制模型点
    renderData.nodes.forEach(node => {
      node.gfx = new PIXI.Graphics();
      node.gfx.lineStyle(1.5, 0xFFFFFF);
      node.gfx.beginFill(colorScale(node.group));
      node.gfx.drawCircle(0, 0, 20);

      node.gfx.addChild(getPixiText(node.name ?? node.id));
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.on('mousemove', (e) => {
        e.stopPropagationHint = true
      })

      // 单独处理质心类型的点
      if (node.type === 'centroid') {
        // 质心计算有点问题，先随便选用一个组内的点
        node.gfx.position = new PIXI.Point(clustersModel[node.name].points[0].x, clustersModel[node.name].points[0].y);
        node.x = clustersModel[node.name].points[0].x
        node.y = clustersModel[node.name].points[0].y

        node.gfx.drawCircle(0, 0, 30);
        node.gfx.on('click', (e) => {
          if (e.detail === 2) {
            changeExpond(node.name)
          }
        })
      }

      app.stage.addChild(node.gfx);
    });

  }

  function simulatStart() {
    simulation
      .nodes(renderData.nodes)

    simulation.force('link')
      .links(renderData.links);

    // simulation
    //   // // 移除力
    //   // .tick(300)
    //   // .on('end', () => {
    //   //   simulation
    //   //     .force('charge', null)
    //   //     .force('center', null)
    //   //     .force('link').strength(0)
    //   // })
    //   // // 移除力
    // .on('tick', ticked);

    app?.ticker?.add(ticked)
  }

  // 根据计算结果绘制
  function ticked() {
    // 绘制节点
    renderData.nodes.forEach((node) => {
      let { x, y, gfx } = node;
      gfx.position = { x, y };
    });

    // 绘制 组/范围
    Object.values(clustersModel).forEach((group) => {
      if (group.expond && (group.points.length > 2)) {
        group.hullGfx.clear()
        const hullPoints = d3.polygonHull(group.points).map(item => [item.gfx.position._x, item.gfx.position._y])
        const hull = d3.Delaunay.from(hullPoints)
        group.hullGfx.beginFill(colorScale(group.name), 0.2)
        hull.renderHull(group.hullGfx);
        group.hullGfx.endFill()
      }
    })

    // 绘制线条
    linksGfx.clear();
    linksGfx.alpha = 0.6;

    renderData.links.forEach((link) => {
      let { source, target } = link;
      linksGfx.lineStyle({
        width: link.value ?? 1,
        color: 0x999999
      });
      linksGfx.moveTo(source.x, source.y);
      linksGfx.quadraticCurveTo((source.x + target.x) / 2 - 10, target.y, target.x, target.y)
      linksGfx.lineTo(target.x, target.y);
    });
    linksGfx.endFill();
  }

  function dragable() {
    d3.select(app.view)
      .call(d3.drag()
        .container(app.view)
        .subject((event) => simulation.find(event.x, event.y, 20))
        .on('start', onDragStart)
        .on('drag', onDragMove)
        .on('end', onDragEnd));

    function onDragStart(e, d) {
      // viewport.plugins.pause('drag');
      if (!e.active) {
        simulation
          .alphaTarget(0.1)
          .restart();
      }

      e.subject.fx = e.subject.x;
      e.subject.fy = e.subject.y;
    }

    function onDragEnd(e) {
      if (!e.active) {
        simulation.alphaTarget(0);
      }
      // e.subject.fx = null;
      // e.subject.fy = null;
      // viewport.plugins.resume('drag');
    }

    function onDragMove(e) {
      e.subject.fx = e.x;
      e.subject.fy = e.y;
    }
  }

  return {
    destroy: () => {
      simulation.stop();
      app.destroy({ removeView: true });
    }
  };
}