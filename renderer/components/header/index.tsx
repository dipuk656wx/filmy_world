import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SearchBar from '../search-bar';
import LanguageSelector from '../language-selector';
import { useTranslation } from '../../store/languageStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
              <FaArrowLeft className="w-4 h-4" />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="./images/showtime_icon.png" 
                alt="Showtime" 
                className="w-8 h-8 rounded"
              />
              <span className="text-xl font-bold">Showtime</span>
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
              {t('movies')}
            </Link>
            <Link 
              to="/tv-shows" 
              className="hover:text-blue-400 transition-colors"
            >
              {t('tvShows')}
            </Link>
            <Link 
              to="/people" 
              className="hover:text-blue-400 transition-colors"
            >
              {t('people')}
            </Link>
            
            {/* Language Selector */}
            <LanguageSelector />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;