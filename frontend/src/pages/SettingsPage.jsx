import { useState, useEffect } from 'react';
import UserTopbar from '../components/UserTopbar';
import { supabase } from './LoginPage';

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [backendResponse, setBackendResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          userError,
        } = await supabase.auth.getUser();

        const { data, sessionError } = await supabase.auth.getSession();

        if (userError) throw userError;
        if (sessionError) throw sessionError;

        setUser(user);
        setSession(data.session);

        if (data.session) {
          const response = await fetch(
            import.meta.env.VITE_EXPRESS_URL + '/test',
            {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            },
          );

          if (!response.ok) throw new Error('Backend request failed');

          const result = await response.json();
          setBackendResponse(result);
        }
      } catch (error) {
        setError(error.message);
        console.error('Error fetching data:', error);
        if (error.status === 401) window.location.href = '/login';
      }
    };

    fetchData();
    setLoading(false);
  }, []);

  return loading ? (
    <div>
      <UserTopbar></UserTopbar>
      <div className="min-h-screen bg-black">
        <h1 className="text-gray-200">Loading...</h1>
      </div>
    </div>
  ) : (
    <div>
      <UserTopbar />
      <div className="min-h-screen bg-black">
        <div className="text-gray-200">
          <h1>User: {user?.email}</h1>
          <h1>Account Created: {user?.created_at}</h1>
          <h2 className="text-xl font-bold mb-2">Backend Response:</h2>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(backendResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
