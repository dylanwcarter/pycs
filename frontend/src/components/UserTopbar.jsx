import logo from '../assets/images/pycs-logo.png';
import pycsImage from '../assets/images/pycs-image.jpeg';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './buttons/LogoutButton';
import TrainButton from './buttons/TrainButton';
import PredictButton from './buttons/PredictButton';
import TestButton from './buttons/TestButton';
import DashboardButton from './buttons/DashboardButton';
import ProfileIcon from '../assets/images/profile-icon.png';

function UserTopbar() {
  const navigate = useNavigate();

  return (
    <div className="bg-black flex items-center px-6 py-3">
      <div
        className="flex items-center space-x-1"
        onClick={() => navigate('/dashboard')}
      >
        <img src={pycsImage} className="h-10" alt="PYCS Image" />
        <img src={logo} className="h-6" alt="Logo" />
      </div>
      <div className="flex items-center space-x-6 ml-10">
        <DashboardButton />
        <TestButton />
        <TrainButton />
        <PredictButton />
      </div>
      <div className="flex items-center space-x-4 ml-auto">
        <LogoutButton />
        <img
          src={ProfileIcon}
          className="h-8 filter invert"
          alt="Profile Icon"
          onClick={() => navigate('/settings')}
        ></img>
      </div>
    </div>
  );
}

export default UserTopbar;
