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
import {
  Node,
  INode,
  COMBO,
  NODE,
  INodeComponentModel,
} from '../Node'

export interface IComboComponentModel {
  comboNode: INodeComponentModel
  comboHull: {
    renderer: Graphics
  }
  nodes: INode[]
}

export interface IComboProps {
  id: number | string,
  label?: number | string,
  parentId?: number | string,
}
