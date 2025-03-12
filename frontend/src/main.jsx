import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/index.css';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-70z0yvfe2suqrf7k.us.auth0.com"
    clientId="jAVph3Wx53YwtDtnYHFYovHsZJiK2RJk"
    authorizationParams={{
      redirect_uri: 'https://localhost:5173/dashboard',
    }}
  >
    <StrictMode>
      <App />
    </StrictMode>
  </Auth0Provider>,
);
