import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import AITutor from './pages/AITutor';
import Accessibility from './pages/Accessibility';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
                  <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
