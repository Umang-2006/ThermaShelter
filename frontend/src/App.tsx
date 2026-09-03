import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import AnalyzeDesign from './pages/AnalyzeDesign';
import OptimizeDesign from './pages/OptimizeDesign';
import CompareDesigns from './pages/CompareDesigns';
import About from './pages/About';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<AnalyzeDesign />} />
          <Route path="/optimize" element={<OptimizeDesign />} />
          <Route path="/compare" element={<CompareDesigns />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
