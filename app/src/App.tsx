import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import pages
import Home from './pages/Home';
import About from './pages/About';
import Schedule from './pages/Schedule';
import Rules from './pages/Rules';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navbar />

        {/* Main content */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
