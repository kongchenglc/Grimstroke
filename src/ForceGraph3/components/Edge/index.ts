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
import { INodeComponentModel } from '../Node'

export interface IEdegeSourceData {
  source: number | string,
  target: number | string,
}

export interface IEdege extends SimulationLinkDatum<INodeComponentModel> { }

interface IEdgeState extends IEdege {
  width: number,
  label?: number | string
}

interface IEdgeModel extends IEdgeState {
  renderer: Graphics
}

export interface IEdgeComponentProps extends IEdgeState {
  container: Application
}

export interface IEdgeComponentModel extends Omit<IEdgeState, 'width'> {
  renderer: Edge
}


export class Edge {
  private container: Application
  private model: IEdgeModel
  private state: IEdgeState
  private ticker: Ticker

  constructor(props: IEdgeComponentProps) {
    this.container = props.container
    this.stateInit(props)
    this.modelInit()
    this.tickerInit()
    this.startAnimation()
  }

  private stateInit = ({ width = 10, source, target }: IEdgeComponentProps) => {
    this.state = {
      width, source, target
    }
  }

  private modelInit = () => {
    const gfx = new Graphics()
    gfx.alpha = 0.6
    this.container?.stage?.addChild?.(gfx)

    this.model = {
      source: this.state.source,
      target: this.state.target,
      width: this.state.width,
      renderer: gfx
    }
  }

  private tickerInit = () => {
    this.ticker = new Ticker()
    this.ticker.autoStart = true
    this.ticker?.maxFPS !== undefined && (this.ticker.maxFPS = 70)
  }

  private startAnimation = () => {
    this.ticker?.add?.(() => {
      this.setState({
        width:
          this.state?.width <= 7
            ? this.state?.width + 0.1
            : 1
      })
    })
  }

  private updateModel = () => {
    this.model = {
      source: this.state.source,
      target: this.state.target,
      width: this.state.width,
      renderer: this.model.renderer
    }
  }

  setState = (newState) => {
    this.state = { ...this.state, ...newState }
    this.updateModel()
    this.render()
  }

  render() {
    this.model?.renderer?.clear?.()
    this.model?.renderer?.lineStyle?.({
      width: this.model.width,
      color: 0x999999
    });
    this.model?.renderer?.moveTo?.((this.model.source as INodeComponentModel)?.x || 0, (this.model.source as INodeComponentModel)?.y || 0);
    this.model?.renderer?.lineTo?.((this.model.target as INodeComponentModel)?.x || 0, (this.model.target as INodeComponentModel)?.y || 0);
  }
}