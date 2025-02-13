import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="bg-black text-white rounded-lg text-sm px-2 py-1 border border-gray-800 hover:bg-gray-800 transition"
      onClick={() => loginWithRedirect()}
    >
      Log In
    </button>
  );
}

export default LoginButton;
