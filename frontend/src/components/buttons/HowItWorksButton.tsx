import { useNavigate } from 'react-router-dom';

function HowItWorksButton() {
  const navigate = useNavigate();

  return (
    <button
      className="text-gray-400 bg-black text-md hover:text-gray-300 transition"
      onClick={() => navigate('/how-it-works')}
    >
      How It Works
    </button>
  );
}

export default HowItWorksButton;
