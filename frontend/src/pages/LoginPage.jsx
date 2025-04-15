import { useState, useEffect } from 'react';
import supabase from '../util/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import LandingTopbar from '../components/LandingTopbar';

const customTheme = {
  ...ThemeSupa,
  default: {
    ...ThemeSupa.default,
    colors: {
      ...ThemeSupa.default.colors,
      brand: '#2563eb',
      brandAccent: '#1d4ed8',
      inputBackground: '#1f2937',
      inputText: '#e5e7eb',
      inputBorder: '#374151',
      inputLabelText: '#9ca3af',
      messageText: '#e5e7eb',
      anchorTextColor: '#93c5fd',
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

export default function LoginPage() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      } else {
        setSession(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (session === null) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <LandingTopbar />

        <div className="flex-grow flex items-center justify-center px-4 pb-10">
          {' '}
          <div className="w-full max-w-md">
            <div className="bg-black p-8 rounded-lg border border-gray-700">
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
      </div>
    );
  }

  return null;
}
