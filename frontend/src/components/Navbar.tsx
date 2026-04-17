import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic, LayoutDashboard, FileSpreadsheet, BarChart2, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Mark Entry', path: '/mark-entry', icon: <Mic size={18} /> },
    { name: 'Files', path: '/files', icon: <FileSpreadsheet size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={18} /> },
  ];

  // Extract username from dummy email
  const displayUser = user?.email?.split('@')[0] || 'Faculty';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-bold text-blue-600 m-0">VoiceMark</h2>
        <div className="hidden md:flex gap-6">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-2 font-medium transition-colors ${location.pathname === item.path ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
            >
               {item.icon} {item.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500 font-medium">Hi, {displayUser}</span>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-600 border border-slate-300 rounded-md px-3 py-2 hover:bg-slate-50 transition">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
