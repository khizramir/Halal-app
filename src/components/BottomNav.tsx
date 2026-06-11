import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/scan', label: 'Scan', icon: '📷' },
  { path: '/restaurants', label: 'Eat', icon: '🍽️' },
  { path: '/lifestyle', label: 'Life', icon: '✨' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full text-xs ${
              isActive ? 'text-green-600' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
