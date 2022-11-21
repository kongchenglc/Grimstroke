import {
  SimulationNodeDatum,
  SimulationLinkDatum,
  Simulation,
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  ForceLink,
  polygonHull,
  Delaunay,
  scaleOrdinal,
  schemeCategory10,
  select,
  drag,
  zoom,
  zoomIdentity,
  ZoomTransform,
} from "d3";
import {
  Text,
  Graphics,
  Application,
  extensions,
  InteractionManager,
  DisplayObject,
  FramebufferSystem,
  Renderer
} from "pixi.js";
// import { EventSystem } from '@pixi/events';

interface INode {
  id: number | string,
  label?: number | string,
  comboId?: number | string,
}

interface IEdge {
  source: number | string,
  target: number | string,
  label?: number | string,
}

interface ICombo {
  id: number | string,
  label?: number | string,
  parentId?: number | string,
}

interface ISourceData {
  nodes: INode[],
  edges?: IEdge[],
  combos?: ICombo[]
}

interface INetworkTopologyProps {
  /**
    *  DOM id or HTMLElement
    */
  container: HTMLElement
  data?: ISourceData
}

const COMBO = 'combo'
type COMBO = typeof COMBO
const NODE = 'node'
type NODE = typeof NODE

interface IRenderNode extends SimulationNodeDatum, INode {
  id: number | string,
  type: COMBO | NODE
  gfx: Graphics
}

interface IRenderEdge extends SimulationLinkDatum<IRenderNode> {
  gfx: Graphics
}

interface ICombosStatus {
  [key: string | number]: {
    expand: boolean
    comboNode: IRenderNode
    comboHull: {
      gfx: Graphics
    }
    nodes: INode[]
  }
}

interface IDisplayObjectPool {
  nodesGfx: Graphics[],
  edgesGfx: Graphics[],
  combos: {
    comboNodesGfx: Graphics[],
    comboHullsGfx: Graphics[]
  }
}

const colorScale = (function () {
  let scale = scaleOrdinal(schemeCategory10);
  return (num: string) => parseInt(scale(num).slice(1), 16);
})();

const getPixiText = (value: string | number) => {
  const text = new Text(value, {
    fontSize: 12,
    fill: '#FFF'
  });
  text.anchor.set(0.5);
  text.resolution = 5;
  return text as unknown as DisplayObject
}

export class NetworkTopology {
  private app: Application
  private simulation: Simulation<IRenderNode, IRenderEdge>

  private sourceData: ISourceData = {
    nodes: [],
    edges: [],
    combos: []
  }

  private displayObjectPool: IDisplayObjectPool = {
    nodesGfx: [],
    edgesGfx: [],
    combos: {
      comboNodesGfx: [],
      comboHullsGfx: []
    }
  }
  private combosStatus: ICombosStatus = {}
  private renderData: {
    nodes: IRenderNode[],
    edges: IRenderEdge[],
  } = {
      nodes: [],
      edges: [],
    }
  private transform: ZoomTransform

  constructor(props: INetworkTopologyProps) {
    this.appInit(props)
    this.displayObjectInit(props.data ?? { nodes: [] })
    this.enableDrag()
    this.enableZoom()
    this.render()
  }

  private appInit = ({ container }: INetworkTopologyProps) => {
    // extensions.remove(InteractionManager);
    this.app = new Application({
      resizeTo: container,
      antialias: !0,
      transparent: !0,
      resolution: 1
    })
    container.appendChild(this.app.view);
    this.transform = zoomIdentity;
    // this.app.renderer.addSystem(EventSystem, 'events');

    this.simulation = forceSimulation<IRenderNode>()
      .force('charge', forceManyBody().strength(-400))
      .force('link', forceLink<IRenderNode, IRenderEdge>().id((d) => d.id))
      .force('center', forceCenter((this.app.view.width) / 2, (this.app.view.height) / 2));
  }

  private displayObjectInit = (data: ISourceData) => {
    if (data) {
      this.sourceData = data
      // 初始化 combosStatus
      data?.combos?.forEach((combo, index) => {
        this.combosStatus[combo.id] = {
          expand: true,
          comboNode: {
            // id: `${COMBO}-${combo.id}`,
            id: combo.id,
            type: COMBO,
            gfx: this.displayObjectPool.combos.comboNodesGfx[index]
          },
          comboHull: {
            gfx: this.displayObjectPool.combos.comboHullsGfx[index]
          },
          nodes: []
        }
      })
      // 绘制对象初始化
      if (data?.combos) {
        this.displayObjectPool.combos.comboHullsGfx = data?.combos?.map(() => new Graphics())
        this.displayObjectPool.combos.comboNodesGfx = data?.combos?.map(() => new Graphics())
      }
      if (data?.edges) {
        this.displayObjectPool.edgesGfx = data?.edges?.map(() => {
          const gfx = new Graphics()
          gfx.alpha = 0.6
          this.app?.stage?.addChild?.(gfx as unknown as DisplayObject)
          return gfx
        })
      }
      if (data?.nodes) {
        this.displayObjectPool.nodesGfx = data?.nodes.map((node) => {
          if (node.comboId !== undefined) {
            this.combosStatus[node.comboId].nodes.push(node)
          }
          const gfx = new Graphics()
          gfx.lineStyle(1.5, 0xFFFFFF);
          gfx.beginFill(colorScale(`${node.comboId}`));
          gfx.drawCircle(0, 0, 20);
          gfx.addChild(getPixiText(node.label || node.id || ''));
          gfx.interactive = true;
          gfx.buttonMode = true;
          this.app?.stage?.addChild?.(gfx as unknown as DisplayObject)
          return gfx
        })
      }
    }
  }

  private calculateRenderData = () => {
    this.renderData = {
      nodes: [],
      edges: [],
    }
    const settedCombo = new Set()
    const nodeIdComboIdMap = new Map()

    // 计算需要渲染的节点，包括收起的分组节点
    this.sourceData.nodes.forEach((node, index) => {
      // 有分组且收起
      if (node?.comboId !== undefined && this.combosStatus[node?.comboId].expand === false) {
        // 有分组未创建分组节点
        if (!settedCombo.has(node.comboId)) {
          this.renderData.nodes.push(this.combosStatus[node.comboId].comboNode)
          settedCombo.add(node.comboId)
        }
      } else {
        // 没分组 或者 展开
        this.renderData.nodes.push({
          ...node,
          // id: `${NODE}-${node.id}`,
          id: node.id,
          type: NODE,
          gfx: this.displayObjectPool.nodesGfx[index]
        })
      }
      // 记录对应id
      nodeIdComboIdMap.set(node.id, node.comboId)
    })

    // 包括收起的分组节点的连线
    this.sourceData.edges?.forEach((edge, index) => {
      let newLink = {
        gfx: this.displayObjectPool.edgesGfx[index],
        source: this.combosStatus?.[nodeIdComboIdMap.get(edge?.source)]?.expand === false
          ? this.combosStatus?.[nodeIdComboIdMap.get(edge?.source)]?.comboNode?.id
          : edge.source,
        target: this.combosStatus?.[nodeIdComboIdMap.get(edge?.target)]?.expand === false
          ? this.combosStatus?.[nodeIdComboIdMap.get(edge?.target)]?.comboNode?.id
          : edge.target,
      }
      this.renderData.edges.push(newLink)
    })

    // 分配分组的gfx

  }

  private simulateStart = () => {
    this.simulation
      .nodes(this.renderData.nodes);

    this.simulation.force<ForceLink<IRenderNode, IRenderEdge>>('link')?.links(this.renderData.edges);

    this.simulation
      // 移除力
      .alphaTarget(0.1)
      .tick(300)
      .on('end', () => {
        this.simulation?.force?.('charge', null)?.force?.('center', null)?.force?.('link')
      })
    // 移除力
    // .on('tick', this.simulationTicked);

    this.app?.ticker?.maxFPS !== undefined && (this.app.ticker.maxFPS = 70)
    this.app?.ticker?.add(this.simulationTicked)
  }

  private simulationTicked = () => {
    // 绘制节点
    this.renderData.nodes.forEach(node => {
      let { x, y, gfx } = node;

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
    this.renderData.edges.forEach(edge => {
      let { source, target, gfx } = edge;

      gfx.clear()
      gfx.lineStyle({
        width: 1,
        color: 0x999999
      });
      gfx.moveTo((source as IRenderNode)?.x || 0, (source as IRenderNode).y || 0);
      gfx.lineTo((target as IRenderNode)?.x || 0, (target as IRenderNode).y || 0);
    })
  }


  private onDragStart = (e: { subject: { fx: any; x: any; fy: any; y: any; }; }, d: any) => {
    this.disableZoom()

    this.simulation
      ?.alphaTarget(0.1)
      ?.restart();

    e.subject.fx = e.subject.x;
    e.subject.fy = e.subject.y;
  }

  private onDragEnd = (e: any) => {
    this.simulation?.alphaTarget(0);
    // e.subject.fx = null;
    // e.subject.fy = null;
    this.enableZoom()
  }

  private onDragMove = (e: { subject: { fx: any; fy: any; }; x: any; y: any; }) => {
    e.subject.fx = e.x;
    e.subject.fy = e.y;
  }
  private enableDrag = () => {
    select(this.app.view)
      .call(
        drag()
          .container(this.app.view)
          .subject((event) => this.simulation.find(this.transform.invertX(event.x), this.transform.invertY(event.y), 20))
          .on('start', this.onDragStart)
          .on('drag', this.onDragMove)
          .on('end', this.onDragEnd) as any
      );
  }

  private enableZoom = () => {
    select(this.app.view).call(
      zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([0.5, 8])
        .on("zoom", ({ transform }) => {
          this.transform = transform

          this.app.stage.scale.x = transform.k
          this.app.stage.scale.y = transform.k
          this.app.stage.position.x = transform.x
          this.app.stage.position.y = transform.y
        })
    );
  }

  private disableZoom = () => {
    select(this.app.view).call(
      zoom<HTMLCanvasElement, unknown>()
        .on("zoom", null)
    );
  }

  setData = (data: ISourceData) => {
    this.app.stage?.removeChildren?.()
    // TODO: 优化复用displayObjectPool
    this.displayObjectInit(data)
    this.render()
  }

  render = () => {
    this.calculateRenderData()
    this.simulateStart()
  }

  destroy = () => {
    this.simulation.stop();
    this.app?.destroy(true, { children: true });
  }
}