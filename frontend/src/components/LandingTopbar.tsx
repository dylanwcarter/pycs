import LoginButton from './buttons/LoginButton';
import logo from '../assets/images/pycs-logo.png';
import AboutButton from './buttons/AboutButton';
import HowItWorksButton from './buttons/HowItWorksButton';

function LandingTopbar() {
  return (
    <div className="bg-black flex items-center justify-between">
      <img src={logo} className="ml-4 h-12 px-2 py-2"></img>
      <div className="flex justify-end space-x-8">
        <AboutButton></AboutButton>
        <HowItWorksButton></HowItWorksButton>
        <LoginButton></LoginButton>
      </div>
    </div>
  );
}

export default LandingTopbar;
