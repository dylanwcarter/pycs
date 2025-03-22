import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import DashboardPage from './pages/DashboardPage';
import ContactPage from './pages/ContactPage';
import TrainPage from './pages/TrainPage';
import PredictPage from './pages/PredictPage';
import TestPage from './pages/TestPage';
import TestPlotPage from './pages/TestPlotPage';
import PredictPlotPage from './pages/PredictPlotPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />}></Route>
        <Route path="/dashboard" element={<DashboardPage />}></Route>
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/train" element={<TrainPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/tests/:id" element={<TestPlotPage />} />
        <Route path="/predictions/:id" element={<PredictPlotPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
