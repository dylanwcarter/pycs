import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import LandingTopbar from '../components/LandingTopbar';

const supabase = createClient(
  'https://vblakthnamztslculhid.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibGFrdGhuYW16dHNsY3VsaGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MTQzMjAsImV4cCI6MjA1NzI5MDMyMH0.OIAByOpKiUV0vVlfA-z7lA065rjKZIDozJQuH_LewjU',
);

// Custom theme configuration
const customTheme = {
  ...ThemeSupa,
  default: {
    ...ThemeSupa.default,
    colors: {
      ...ThemeSupa.default.colors,
      brand: '#2563eb', // Blue-600
      brandAccent: '#1d4ed8', // Blue-700
      inputBackground: '#1f2937', // Gray-800
      inputText: '#e5e7eb', // Gray-200
      inputBorder: '#374151', // Gray-700
      inputLabelText: '#9ca3af', // Gray-400
      messageText: '#e5e7eb', // Gray-200
      anchorTextColor: '#93c5fd', // Blue-300
      buttonText: '#ffffff',
    },
    space: {
      ...ThemeSupa.default.space,
      buttonPadding: '0.75rem 1.5rem',
      inputPadding: '0.75rem 1rem',
    },
    fontSizes: {
      ...ThemeSupa.default.fontSizes,
      baseBodySize: '1rem',
      baseInputSize: '1rem',
      baseLabelSize: '0.875rem',
      baseButtonSize: '1rem',
    },
  },
};

export default function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-black">
        <LandingTopbar />
        <div className="mt-20 max-w-xl mx-auto">
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: customTheme }}
              theme="dark"
              providers={[]}
              localization={{
                variables: {
                  forgotten_password: {
                    link_text: '',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  } else {
    navigate('/dashboard');
    return null;
  }
}
