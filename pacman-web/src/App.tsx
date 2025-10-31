import type { ReactElement } from 'react';
import './App.css';
import { PacmanGame } from './components/PacmanGame';

function App(): ReactElement {
  return (
    <main className="app">
      <PacmanGame />
    </main>
  );
}

export default App;
