import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CharactersPage } from './pages/CharactersPage';
import { CharacterDetailPage } from './pages/CharacterDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CharactersPage />} />
        <Route path="/character/:id" element={<CharacterDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
