import { useState } from 'react';
import UserTopbar from '../components/UserTopbar';

function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dummy user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@agritech.com',
    accountType: 'Premium',
    joined: 'January 2023',
    storageUsed: '65%',
    lastLogin: '2 hours ago',
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Add password validation logic here
  };

  return (
    <div className="min-h-screen bg-black">
      <UserTopbar />
      <div className="p-6 max-w-7xl mx-auto text-gray-200">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* Account Information Section */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Full Name
              </label>
              <p className="text-gray-200">{userData.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <p className="text-gray-200">{userData.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Account Type
              </label>
              <p className="text-gray-200">{userData.accountType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Storage Used
              </label>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: userData.storageUsed }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-400">
                  Receive updates and notifications
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative rounded-full w-12 h-6 transition-colors ${
                  notificationsEnabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-gray-400">Toggle dark theme</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative rounded-full w-12 h-6 transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="mb-8 p-4 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="p-4 border border-red-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-400">
            Danger Zone
          </h2>
          <button className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
            Sign Out All Devices
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
