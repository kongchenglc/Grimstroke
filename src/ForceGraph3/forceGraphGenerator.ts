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
  Renderer,
  Ticker
} from "pixi.js";
// import { Diagram } from "../Diagram"
import { IComboComponentModel, IComboProps } from './components/Combo'
import {
  Node,
  INodeSourceData,
  NODE,
  INodeComponentModel,
} from './components/Node'
import { IEdege, IEdgeComponentProps, Edge, IEdgeComponentModel, IEdegeSourceData } from './components/Edge'

interface ISourceData {
  nodes: INodeSourceData[],
  edges?: IEdegeSourceData[],
  combos?: IComboProps[]
}

interface INetworkTopologyProps {
  /**
    *  DOM id or HTMLElement
    */
  container: HTMLElement
  data?: ISourceData
}

interface INetworkTopologyState {
  combos: {
    [key: string | number]: {
      expand: boolean
    }
  }
}

interface INetworkTopologyModel {
  nodes: INodeComponentModel[],
  edges: IEdgeComponentModel[],
  combos: IComboComponentModel[]
}

export class NetworkTopology
// extends Diagram 
{
  private app: Application
  private simulation: Simulation<INodeComponentModel, IEdgeComponentModel>
  private ticker: Ticker

  private state: INetworkTopologyState = {
    combos: {}
  }
  private model: INetworkTopologyModel = {
    nodes: [],
    edges: [],
    combos: []
  }

  constructor(props: INetworkTopologyProps) {
    const data = props.data ?? { nodes: [] }
    this.appInit(props)
    this.tickerInit()

    // this.componentsPoolInit(data)

    this.modelInit(data)
    this.stateInit(data)

    this.layout()
    this.render()
  }

  private appInit = ({ container }: INetworkTopologyProps) => {
    this.app = new Application({
      resizeTo: container,
      antialias: !0,
      transparent: !0,
      resolution: 1
    })
    container.appendChild(this.app.view);

    this.simulation = forceSimulation<INodeComponentModel>()
      .force('link', forceLink<INodeComponentModel, IEdgeComponentModel>().id((d) => d.id))
  }

  private tickerInit = () => {
    this.ticker = new Ticker()
    this.ticker.autoStart = true
    this.ticker?.maxFPS !== undefined && (this.ticker.maxFPS = 70)
  }

  // private componentsPoolInit = (data: ISourceData) => {

  // }

  private modelInit = (data: ISourceData) => {
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
      data?.edges?.forEach((edge, index) => {
        let edgeModel: IEdgeComponentModel = {
          source: edge.source,
          target: edge.target,
          renderer: new Edge({
            container: this.app,
            source: edge.source,
            target: edge.target,
            width: 2,
          })
        }
        this.model.edges[index] = edgeModel
      })
      // 初始化 node model
      data?.nodes?.forEach((node, index) => {
        let nodeModel: INodeComponentModel = {
          x: -1000,
          y: -1000,
          id: node.id,
          type: NODE,
          renderer: new Node({
            ...node,
            type: NODE,
            container: this.app,
          })
        }
        this.model.nodes[index] = nodeModel
      })
    }
  }

  private stateInit = (data: ISourceData) => {
    data.combos?.forEach(combo => {
      this.state.combos[combo.id] = {
        expand: true
      }
    })
  }

  private updateModel = () => {
    // TODO: 根据 state 和 pool 更新 Model
    this.model = this.model
  }

  private layout = () => {
    this.simulation
      .force('charge', forceManyBody().strength(-400))
      .force('center', forceCenter((this.app.view.width) / 2, (this.app.view.height) / 2))

    this.simulation.nodes(this.model.nodes);

    this.simulation.force<ForceLink<INodeComponentModel, IEdgeComponentModel>>('link')?.links(this.model.edges);

    this.simulation
      .alpha(1)
      .tick(300)
      .alpha(0)
      .on('end', () => {
        this.simulation?.force?.('charge', null)?.force?.('center', null)
      })
  }

  private reset = () => {
    this.ticker?.destroy?.();
    this.app.stage?.removeChildren?.()

    this.state = {
      combos: {}
    }
    this.model = {
      nodes: [],
      edges: [],
      combos: []
    }
    this.model = {
      nodes: [],
      edges: [],
      combos: []
    }
  }

  setData = (data: ISourceData) => {
    // TODO: 优化复用displayObjectPool
    this.reset()

    this.tickerInit()
    this.modelInit(data)
    this.stateInit(data)

    this.layout()
    this.render()
  }

  render() {
    // TODO: model 标记更新
    this.ticker.add(() => {
      // 绘制节点
      this.model.nodes.forEach(node => {
        let { x, y, renderer } = node;

        renderer.setState({ x, y });
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
      this.model.edges.forEach(edge => {
        let { source, target, renderer } = edge;
        renderer.setState({
          source,
          target,
        })
      })
    })
  }

  destroy = () => {
    this.ticker?.destroy();
    this.simulation?.stop();
    this.app?.destroy(true, { children: true });
  }
}