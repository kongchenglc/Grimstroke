import React from "react";
import { runForceGraphPixi } from "./forceGraphGenerator";
import styles from "./forceGraph.module.css";

export function ForceGraph({ sourceData }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    let destroyFn;

    if (containerRef.current) {
      const { destroy } =
        runForceGraphPixi(containerRef.current, sourceData);
      destroyFn = destroy;
    }

    return destroyFn;
  }, [sourceData]);

  return <div ref={containerRef} className={styles.container} />;
}