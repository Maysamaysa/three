import { Routes, Route } from 'react-router-dom';
import { Playground } from './pages/Playground';
import { TutorialChallenge } from './pages/TutorialChallenge';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Playground />} />
      <Route path="/tutorial/:id" element={<TutorialChallenge />} />
    </Routes>
  );
}

export default App;
