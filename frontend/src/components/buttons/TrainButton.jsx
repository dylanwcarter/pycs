import { useNavigate } from 'react-router-dom';

function TrainButton() {
  const navigate = useNavigate();
  return (
    <button
      className="text-gray-400 bg-black text-md hover:text-gray-300 transition"
      onClick={() => navigate('/train')}
    >
      Train
    </button>
  );
}

export default TrainButton;
