// Public blog layout that doesn't require authentication
import { Link } from "react-router-dom";
import { Home, User, LogIn } from "lucide-react";
import logo from "../assets/BrightReflectionaryHorizontal.svg";

export default function PublicBlogLayout({ children }) {
  return (
    <div className="flex min-h-screen overflow-hidden relative bg-gradient-to-r from-slate-900 via-purple-800 to-fuchsia-900">
      {/* Simple Header for Public Blog */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img
                  src={logo}
                  alt="Reflectionary Logo"
                  className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              
              <Link
                to="/blog"
                className="text-purple-300 hover:text-purple-200 transition-colors font-medium"
              >
                Blog
              </Link>

              <Link
                to="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <main className="flex-1 pt-20">
        <div className="min-h-screen backdrop-blur-sm bg-black/10">
          {children}
        </div>
      </main>
    </div>
  );
}