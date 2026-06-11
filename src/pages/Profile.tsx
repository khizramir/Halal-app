import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Profile</h1>
        <p className="text-gray-500 text-sm">Your account & settings</p>
      </header>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center mb-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-3">
          👤
        </div>
        <h2 className="text-xl font-bold text-gray-800">Guest User</h2>
        <p className="text-sm text-gray-500">guest@halal-app.com</p>
        <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
          Sign In
        </button>
      </div>
      <div className="bg-white rounded-xl shadow divide-y">
        {['Settings', 'Notifications', 'Privacy Policy', 'About', 'Help & Support'].map((item) => (
          <button
            key={item}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
          >
            {item}
            <span className="text-gray-400">›</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Profile;
