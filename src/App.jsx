import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import BoardsPage from './pages/BoardsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/:cityKey" element={<ExplorePage />} />
          <Route path="/boards" element={<BoardsPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
