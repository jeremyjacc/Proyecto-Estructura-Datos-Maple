import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';

// Components
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import BoardsPage from './pages/BoardsPage.jsx';
import TourPackagesPage from './pages/TourPackagesPage.jsx';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <main className="page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/packages" element={<TourPackagesPage />} />
            <Route path="/boards" element={<BoardsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
