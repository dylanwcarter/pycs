import { useAuth0 } from '@auth0/auth0-react';

function SignupButton() {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="bg-gray-200 text-black text-sm px-2 py-1 rounded-lg font-medium mr-8"
      onClick={() => loginWithRedirect()}
    >
      Sign Up
    </button>
  );
}

export default SignupButton;
