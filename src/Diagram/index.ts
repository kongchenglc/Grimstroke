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

export abstract class Diagram {
  abstract app
  private sourceData

  constructor() {
    
  }
}