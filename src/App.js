import './App.css';

// import { ForceGraph } from './ForceGraph'
// import data from './data/data2.json'

import { ForceGraph } from './ForceGraph3'
import data from './data/data-stand.json'
// import data from './data/data-stand-small.json'

// import './Line'
import './Line2'

function App() {

  return (
    <div className="App">
      <ForceGraph sourceData={data}/>
    </div>
  );
}

export default App;
