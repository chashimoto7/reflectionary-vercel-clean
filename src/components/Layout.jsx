// src/components/Layout.jsx
import { Link, NavLink, Outlet } from "react-router-dom";
import { Plus, Notebook, BarChart3, Target, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import logo from "../assets/reflectionary-logo.png";

export default function Layout() {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F5] text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#A8A3B4] p-6 flex flex-col justify-between shadow-md">
        <div>
          <Link to="/" className="flex items-center justify-center mb-4">
            <img src={logo} alt="Reflectionary Logo" className="w-17 h-17" />
          </Link>

          <nav className="space-y-4">
            <NavLink
              to="/new-entry"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                  isActive
                    ? "bg-purple-200 text-purple-900"
                    : "hover:bg-purple-100 text-purple-900"
                }`
              }
            >
              <Plus size={20} className="text-purple-900" />
              New Entry
            </NavLink>

            <NavLink
              to="/journal-history"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                  isActive
                    ? "bg-purple-200 text-purple-900"
                    : "hover:bg-purple-100 text-purple-900"
                }`
              }
            >
              <Notebook size={20} className="text-purple-900" />
              Journal History
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                  isActive
                    ? "bg-purple-200 text-purple-900"
                    : "hover:bg-purple-100 text-purple-900"
                }`
              }
            >
              <BarChart3 size={20} className="text-purple-900" />
              Analytics
            </NavLink>

            <NavLink
              to="/goals"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                  isActive
                    ? "bg-purple-200 text-purple-900"
                    : "hover:bg-purple-100 text-purple-900"
                }`
              }
            >
              <Target size={20} className="text-purple-900" />
              Goals
            </NavLink>
          </nav>
        </div>

        {/* User menu at bottom */}
        {/* User email and Sign Out button */}
        <div className="px-4 py-2 rounded-md bg-purple-100 text-purple-900 text-sm space-y-2">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span className="truncate">{user?.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        <div className="text-xs text-purple-100 mt-4 text-center">
          <p>&copy; {new Date().getFullYear()} Reflectionary</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
