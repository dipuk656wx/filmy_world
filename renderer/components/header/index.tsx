import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../search-bar';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg px-2">
      <div className="w-full px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Back Button and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Go back"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-500">🎬</div>
              <span className="text-xl font-bold">MovieDB</span>
            </Link>
          </div>

          {/* Search Bar */}
          <SearchBar />

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/movies" 
              className="hover:text-blue-400 transition-colors"
            >
              Movies
            </Link>
            <Link 
              to="/tv-shows" 
              className="hover:text-blue-400 transition-colors"
            >
              TV Shows
            </Link>
            <Link 
              to="/people" 
              className="hover:text-blue-400 transition-colors"
            >
              People
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;