import React, { useState } from 'react';
import { extractM3U8Simple, ExtractM3U8Options } from '../../services/extractM3u8';

interface M3U8ExtractorDemoProps {
  // Optional props for customization
  className?: string;
}

export const M3U8ExtractorDemo: React.FC<M3U8ExtractorDemoProps> = ({ className }) => {
  const [url, setUrl] = useState('https://surrit.store/e/870Q0NM2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const extractedResult = await extractM3U8Simple(url);
      setResult(extractedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError(null);
  };

  return (
    <div className={`p-6 max-w-2xl mx-auto ${className || ''}`}>
      <h2 className="text-2xl font-bold mb-4">M3U8 Extractor Demo</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium mb-2">
            Enter URL to extract M3U8 from:
          </label>
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/streaming-page"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleExtract}
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Extracting...' : 'Extract M3U8'}
          </button>
          
          <button
            onClick={handleClear}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Extracting M3U8 links...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <strong>Success!</strong>
            <div className="mt-2">
              <p>Found M3U8 link:</p>
              <a 
                href={result} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {result}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default M3U8ExtractorDemo;
