import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute, FaRedo } from 'react-icons/fa';
import BackgroundScraper, { PlaylistData, ExtractedData } from '../../services/backgroundScraper';

interface VideoSource {
  file: string;
  label: string;
  type: string;
  default?: boolean;
}

interface PlayerProps {
  sourceUrl?: string; // URL to scrape playlist from
  onClose?: () => void;
}

const Player2: React.FC<PlayerProps> = ({ 
  sourceUrl = 'https://mat6tube.com/watch/-180267691_456240651',
  onClose 
}) => {
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [currentSource, setCurrentSource] = useState<VideoSource | null>(null);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch playlist using background scraper
  const fetchPlaylist = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching playlist from:', url);
      
      const scraper = BackgroundScraper.getInstance();
      const extractedData: ExtractedData = await scraper.fetchAndExtractPlaylist(url);
      
      if (extractedData.playlist && extractedData.playlist.sources.length > 0) {
        setPlaylistData(extractedData.playlist);
        
        // Set the best quality source as current
        const bestSource = scraper.getBestQualitySource(extractedData.playlist);
        const defaultSource = extractedData.playlist.sources.find(s => s.default) || extractedData.playlist.sources[0];
        
        setCurrentSource(defaultSource);
        setCurrentSourceIndex(0);
        
        console.log('✅ Playlist loaded successfully');
        console.log('📋 Available sources:', extractedData.playlist.sources.map(s => `${s.label}p (${s.type})`));
      } else {
        throw new Error('No video sources found in playlist');
      }
    } catch (error) {
      console.error('❌ Failed to fetch playlist:', error);
      setError(error instanceof Error ? error.message : 'Failed to load playlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize playlist on mount
  useEffect(() => {
    if (sourceUrl) {
      fetchPlaylist(sourceUrl);
    }
  }, [sourceUrl]);

  // Update video source when current source changes
  useEffect(() => {
    if (currentSource && videoRef.current) {
      const video = videoRef.current;
      const wasPlaying = !video.paused;
      const currentTimeBackup = video.currentTime;
      
      console.log('🔄 Loading source:', currentSource.label, currentSource.file);
      
      video.src = currentSource.file;
      video.load();
      
      video.addEventListener('loadedmetadata', () => {
        if (currentTimeBackup > 0) {
          video.currentTime = currentTimeBackup;
        }
        if (wasPlaying) {
          video.play().catch(console.error);
        }
      }, { once: true });
    }
  }, [currentSource]);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleVideoError = useCallback(() => {
    console.error('❌ Video playback error');
    setError('Failed to play video source');
  }, []);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Player controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const playNext = () => {
    if (playlistData && currentSourceIndex < playlistData.sources.length - 1) {
      const nextIndex = currentSourceIndex + 1;
      setCurrentSourceIndex(nextIndex);
      setCurrentSource(playlistData.sources[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (playlistData && currentSourceIndex > 0) {
      const prevIndex = currentSourceIndex - 1;
      setCurrentSourceIndex(prevIndex);
      setCurrentSource(playlistData.sources[prevIndex]);
    }
  };

  const handleSourceSelect = (index: number) => {
    if (playlistData && index >= 0 && index < playlistData.sources.length) {
      setCurrentSourceIndex(index);
      setCurrentSource(playlistData.sources[index]);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const retryLoad = () => {
    if (sourceUrl) {
      fetchPlaylist(sourceUrl);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <div className="text-xl mb-2">Loading Playlist...</div>
          <div className="text-sm text-gray-400">Extracting video sources</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-xl mb-4 text-red-400">❌ Error</div>
          <div className="text-sm text-gray-400 mb-6">{error}</div>
          <div className="space-x-4">
            <button 
              onClick={retryLoad}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FaRedo className="inline mr-2" />
              Retry
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleVideoError}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onClick={togglePlayPause}
          poster={playlistData?.image}
        />

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full flex items-center justify-center text-white transition-all"
          >
            ✕
          </button>
        )}

        {/* Player Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={playPrevious}
                disabled={currentSourceIndex === 0}
                className="p-2 text-white hover:text-blue-400 disabled:text-gray-500 transition-colors"
              >
                <FaStepBackward className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
              >
                {isPlaying ? (
                  <FaPause className="w-6 h-6" />
                ) : (
                  <FaPlay className="w-6 h-6 ml-1" />
                )}
              </button>
              
              <button
                onClick={playNext}
                disabled={!playlistData || currentSourceIndex >= playlistData.sources.length - 1}
                className="p-2 text-white hover:text-blue-400 disabled:text-gray-500 transition-colors"
              >
                <FaStepForward className="w-5 h-5" />
              </button>

              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                  {isMuted || volume === 0 ? (
                    <FaVolumeMute className="w-5 h-5" />
                  ) : (
                    <FaVolumeUp className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Current Source Info */}
            {currentSource && (
              <div className="text-white text-center">
                <div className="text-sm font-medium">
                  {currentSource.label}p ({currentSource.type.toUpperCase()})
                </div>
                <div className="text-xs text-gray-400">
                  {currentSourceIndex + 1} of {playlistData?.sources.length || 0}
                </div>
              </div>
            )}

            {/* Quality Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">Quality:</span>
              <select
                value={currentSourceIndex}
                onChange={(e) => handleSourceSelect(parseInt(e.target.value))}
                className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
              >
                {playlistData?.sources.map((source, index) => (
                  <option key={index} value={index}>
                    {source.label}p ({source.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Playlist Info Overlay */}
        {playlistData && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 rounded-lg p-4 text-white max-w-sm">
            <div className="text-lg font-bold mb-2">Video Sources</div>
            <div className="space-y-1">
              {playlistData.sources.map((source, index) => (
                <div
                  key={index}
                  className={`text-sm cursor-pointer p-2 rounded ${
                    index === currentSourceIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handleSourceSelect(index)}
                >
                  📺 {source.label}p ({source.type.toUpperCase()})
                  {source.default && <span className="ml-2 text-xs bg-green-600 px-1 rounded">DEFAULT</span>}
                </div>
              ))}
            </div>
            {playlistData.image && (
              <div className="mt-3">
                <img 
                  src={playlistData.image} 
                  alt="Video thumbnail" 
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Player2;