import React from 'react';
import RadarMap from './components/RadarMap';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>MRMS Weather Radar</h1>
        <p>Real-time Reflectivity at Lowest Altitude (RALA)</p>
      </header>
      <main className="app-main">
        <RadarMap />
      </main>
    </div>
  );
}

export default App;