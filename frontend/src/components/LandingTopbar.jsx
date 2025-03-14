import LoginButton from './buttons/LoginButton';
import logo from '../assets/images/pycs-logo.png';
import pycsImage from '../assets/images/pycs-image.jpeg';
import AboutButton from './buttons/AboutButton';
import HowItWorksButton from './buttons/HowItWorksButton';
import ContactButton from './buttons/ContactButton';
import { useNavigate } from 'react-router-dom';

function LandingTopbar() {
  const navigate = useNavigate();

  return (
    <div className="bg-black flex items-center px-6 py-3">
      <div
        className="flex items-center space-x-1"
        onClick={() => navigate('/')}
      >
        <img src={pycsImage} className="h-10" alt="PYCS Image" />
        <img src={logo} className="h-6" alt="Logo" />
      </div>

      <div className="flex items-center space-x-6 ml-10">
        <AboutButton />
        <HowItWorksButton />
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <ContactButton />
        <LoginButton />
      </div>
    </div>
  );
}

export default LandingTopbar;
