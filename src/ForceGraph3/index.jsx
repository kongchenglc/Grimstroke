import React from "react";
import { NetworkTopology } from "./forceGraphGenerator";
import styles from "./forceGraph.module.css";
import data from '../data/data-stand-change.json'

export function ForceGraph({ sourceData }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    let destroyFn;

    if (containerRef.current) {
      const networkTopology = new NetworkTopology({
        container: containerRef.current,
        data: sourceData,
      });
      // setTimeout(() => {
      //   networkTopology.setData(data)
      //   // networkTopology.destroy()
      // }, 1000)
      destroyFn = networkTopology.destroy;
    }

    return destroyFn;
  }, [sourceData]);

  return <div ref={containerRef} className={styles.container} />;
}