import { useNavigate } from 'react-router-dom';

function GetStartedButton() {
  const navigate = useNavigate();

  return (
    <button
      //   onClick={() => navigate('/account')}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md transition-colors text-xl"
    >
      Get Started
    </button>
  );
}

export default GetStartedButton;
