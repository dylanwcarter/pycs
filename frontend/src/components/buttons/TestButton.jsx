import { useNavigate } from 'react-router-dom';

function TestButton() {
  const navigate = useNavigate();
  return (
    <button
      className="text-gray-400 bg-black text-md hover:text-gray-300 transition"
      onClick={() => navigate('/test')}
    >
      Test
    </button>
  );
}

export default TestButton;
