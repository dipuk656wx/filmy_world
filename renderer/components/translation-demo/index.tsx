import React from 'react';
import { useTranslation, useLanguageStore } from '../../store/languageStore';

const TranslationDemo: React.FC = () => {
  const { t, currentLanguage, tmdbLanguageCode, region, isRTL } = useTranslation();
  const { getSupportedLanguages } = useLanguageStore();
  
  const supportedLanguages = getSupportedLanguages();
  const languageCount = Object.keys(supportedLanguages).length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🌐 Enhanced Translation System Demo
        </h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Current Language:</strong> {supportedLanguages[currentLanguage]?.nativeName} ({supportedLanguages[currentLanguage]?.name})
          </p>
          <p className="text-blue-700 text-sm mt-1">
            <strong>TMDb API Code:</strong> {tmdbLanguageCode} | <strong>Region:</strong> {region} | <strong>RTL:</strong> {isRTL ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Translation Examples */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Navigation Translations</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Movies:</strong> {t('movies')}</li>
            <li><strong>TV Shows:</strong> {t('tvShows')}</li>
            <li><strong>People:</strong> {t('people')}</li>
            <li><strong>Search:</strong> {t('search')}</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Content Translations</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Popular:</strong> {t('popular')}</li>
            <li><strong>Top Rated:</strong> {t('topRated')}</li>
            <li><strong>Upcoming:</strong> {t('upcoming')}</li>
            <li><strong>Loading:</strong> {t('loading')}</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Movie Details</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Watch Now:</strong> {t('watchNow')}</li>
            <li><strong>Release Date:</strong> {t('releaseDate')}</li>
            <li><strong>Runtime:</strong> {t('runtime')}</li>
            <li><strong>Rating:</strong> {t('rating')}</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">System Messages</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Language:</strong> {t('language')}</li>
            <li><strong>Settings:</strong> {t('settings')}</li>
            <li><strong>Try Again:</strong> {t('tryAgain')}</li>
            <li><strong>No Results:</strong> {t('noResults')}</li>
          </ul>
        </div>
      </div>

      {/* Supported Languages Grid */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Supported Languages ({languageCount} total)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(supportedLanguages).map(([code, config]) => (
            <div 
              key={code}
              className={`p-3 rounded-lg border-2 transition-colors ${
                currentLanguage === code 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{config.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {config.nativeName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {config.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {config.tmdbCode} | {config.region}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          ✨ New Features
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-800">🏪 Zustand Store</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Persistent language preferences</li>
              <li>• Reactive state management</li>
              <li>• Auto-detection on first visit</li>
              <li>• RTL language support</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-800">🌍 API Integration</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• TMDb language codes</li>
              <li>• Regional preferences</li>
              <li>• Automatic API calls with selected language</li>
              <li>• Content localization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🎯 Try It Out
        </h3>
        <p className="text-sm text-yellow-700">
          Use the language selector in the header to switch between {languageCount} supported languages. 
          Your selection will be remembered and all API calls will use the appropriate language and region codes.
        </p>
      </div>
    </div>
  );
};

export default TranslationDemo;
