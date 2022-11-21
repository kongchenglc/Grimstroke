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

export const COMBO = 'combo'
export type COMBO = typeof COMBO
export const NODE = 'node'
export type NODE = typeof NODE

export interface INodeSourceData {
  id: number | string,
  label?: number | string,
  comboId?: number | string,
}

export interface INode extends SimulationNodeDatum, INodeSourceData {}

interface INodeState extends INode {
  x: number,
  y: number,
  type: COMBO | NODE
}


interface INodeModel extends INodeState {
  renderer: Graphics
}

export interface INodeComponentProps extends Partial<INodeState> {
  container: Application
  id: number | string,
  type: COMBO | NODE
}

export interface INodeComponentModel extends INodeState {
  renderer: Node
}

export class Node {
  private container: Application
  private model: INodeModel
  private state: INodeState

  constructor(props: INodeComponentProps) {
    this.container = props.container
    this.stateInit(props)
    this.modelInit()
  }

  stateInit = (props: INodeComponentProps) => {
    this.state = {
      ...props,
      x: props.x ?? -1000,
      y: props.y ?? -1000,
      type: props.type ?? NODE,
    }
  }

  modelInit = () => {
    const gfx = new Graphics()
    gfx.lineStyle(1.5, 0xFFFFFF);
    gfx.beginFill(colorScale(`${this.state.comboId}`));
    gfx.drawCircle(0, 0, 20);
    gfx.addChild(getPixiText(this.state.label || this.state.id || ''));
    gfx.interactive = true;
    gfx.buttonMode = true;
    this.container?.stage?.addChild?.(gfx)

    this.model = {
      x: -10000,
      y: -10000,
      id: this.state.id,
      type: this.state.type,
      renderer: gfx
    }
  }

  setState = (newState) => {
    this.state = { ...this.state, ...newState }
    this.updateModel()
    this.render()
  }

  updateModel = () => {
    this.model = {
      x: this.state.x,
      y: this.state.y,
      id: this.state.id,
      type: this.state.type,
      renderer: this.model.renderer
    }
  }

  render() {
    this.model.renderer.position = {
      x: this.state.x,
      y: this.state.y
    }
  }
}