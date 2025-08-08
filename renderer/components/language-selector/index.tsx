import React, { useState, useRef, useEffect } from 'react';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import { useLanguageStore } from '../../store/languageStore';

const LanguageSelector: React.FC = () => {
  const { 
    currentLanguage, 
    setLanguage, 
    getCurrentLanguageConfig,
    getSupportedLanguages 
  } = useLanguageStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = getCurrentLanguageConfig();
  const supportedLanguages = getSupportedLanguages();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
        aria-label="Select Language"
      >
        <FaGlobe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentConfig.flag} {currentConfig.code.toUpperCase()}
        </span>
        <FaChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden max-h-80 overflow-y-auto">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              Select Language ({Object.keys(supportedLanguages).length} available)
            </div>
            {Object.entries(supportedLanguages).map(([code, config]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                  currentLanguage === code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg flex-shrink-0">{config.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{config.nativeName}</div>
                  <div className="text-xs text-gray-500 truncate">{config.name}</div>
                </div>
                {currentLanguage === code && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
