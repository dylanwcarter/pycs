import { useNavigate } from 'react-router-dom';

function LoginButton() {
  const navigate = useNavigate();

  return (
    <button
      className="bg-black text-white rounded-lg text-sm px-2 py-1 border border-gray-800 hover:bg-gray-800 transition"
      onClick={() => navigate('/dashboard')}
    >
      Log In
    </button>
  );
}

export default LoginButton;
