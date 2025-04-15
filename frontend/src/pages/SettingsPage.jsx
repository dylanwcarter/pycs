import { useState, useEffect } from 'react';
import UserTopbar from '../components/UserTopbar';
import supabase from '../util/supabase';

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (userError) throw userError;
        if (sessionError) throw sessionError;

        setUser(user);
      } catch (error) {
        setError(error.message);
        console.error('Error:', error);
        if (error.status === 401) window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <UserTopbar />
        <hr className="border-t border-white/20" />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <UserTopbar />
      <hr className="border-t border-white/20" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-8">
          Account Settings
        </h1>

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-200 mb-6">
            Account Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Email:</span>
              <span className="text-gray-200">{user?.email}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Account Created:</span>
              <span className="text-gray-200">
                {formatDate(user?.created_at)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Last Login:</span>
              <span className="text-gray-200">
                {formatDate(user?.last_sign_in_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-200 mb-6">
            Security Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-gray-400 mb-2">Authentication Method</h3>
              <p className="text-gray-200 capitalize">
                {user?.app_metadata?.provider || 'Email'}
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-gray-400 mb-2">Password Updated</h3>
              <p className="text-gray-200">
                {user?.updated_at ? formatDate(user.updated_at) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
