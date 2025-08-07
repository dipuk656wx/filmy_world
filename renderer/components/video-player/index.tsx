import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress, FaArrowRight } from 'react-icons/fa';
import Hls from 'hls.js'; 
import { FaCog, FaFastForward, FaFastBackward, FaQuestionCircle, FaTv, FaArrowLeft, FaStepBackward, FaStepForward, FaClosedCaptioning } from 'react-icons/fa';
import clsx from 'clsx';
import { getPlayLinkWithFallback, getTVShowSeason, Episode, EnhancedPlayLinkResponse } from '../../services/tmdbApi';
import { getSubtitlesFromOpenSubtitles, getVttLink, SubtitleInfo } from '../../services/openSubAPI';
import { languageOptions } from '../../common/languageOptions';
import { extractM3U8WithUserAgent } from '../../services/extractM3u8';

// components/VideoPlayer/Timeline.tsx
interface TimelineProps {
  duration: number;
  currentTime: number;
  buffered: number;
  onSeek: (time: number) => void;
  onPreview: (time: number | null) => void;
}

const Timeline: React.FC<TimelineProps> = ({ duration, currentTime, buffered, onSeek, onPreview }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const time = position * duration;
      setHoverTime(time);
      onPreview(time);
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    onPreview(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(position * duration);
    }
  };

  return (
    <div
      ref={timelineRef}
      className="relative h-2 bg-gray-700 rounded cursor-pointer group select-none mx-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      aria-label="Seek bar"
    >
      {/* Buffered bar */}
      <div
        className="absolute h-full bg-gray-400/60 rounded"
        style={{ width: `${(buffered / duration) * 100}%` }}
      />
      {/* Played bar */}
      <div
        className="absolute h-full bg-blue-500 rounded"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />
      {/* Thumb */}
      <div
        className="absolute w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg transition-transform duration-100"
        style={{
          left: `${(currentTime / duration) * 100}%`,
          transform: 'translate(-50%, -50%)',
          top: '50%',
        }}
      />
      {/* Preview tooltip */}
      {hoverTime !== null && (
        <div
          className="absolute -top-8 left-0 pointer-events-none"
          style={{
            left: `calc(${(hoverTime / duration) * 100}% - 32px)`,
            width: 64,
          }}
        >
          <div className="bg-black/80 text-xs text-white px-2 py-1 rounded shadow-lg text-center">
            {new Date(hoverTime * 1000).toISOString().substr(11, 8)}
          </div>
        </div>
      )}
    </div>
  );
};

// components/VideoPlayer/index.tsx
interface VideoPlayerProps {
  movieId: number;
  season?: number;
  episode?: number;
  title: string;
  type: 'movie' | 'tv';
  tvSeasonData?: any;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  movieId,
  season,
  episode,
  title,
  type,
  tvSeasonData
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [qualityLevels, setQualityLevels] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 for auto
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [hasError, setHasError] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState('');
  const [showSubtitleSelector, setShowSubtitleSelector] = useState(false);
  const [subtitleSearch, setSubtitleSearch] = useState('');
  const [availableSubtitles, setAvailableSubtitles] = useState<SubtitleInfo[]>([]);
  const [showSubtitleFiles, setShowSubtitleFiles] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loadingSubtitles, setLoadingSubtitles] = useState(false);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState('');
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch play link with 30-minute cache
  const { data: playData, isLoading: isLoadingLink, error: linkError } = useQuery<EnhancedPlayLinkResponse>({
    queryKey: ['play-link', movieId, season, episode],
    queryFn: () => getPlayLinkWithFallback(movieId, season, episode),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    enabled: !!movieId,
  });

  // Episode navigation for TV shows
  const currentEpisodeIndex = episode ? episode - 1 : 0;
  const prevEpisode = tvSeasonData?.episodes?.[currentEpisodeIndex - 1];
  const nextEpisode = tvSeasonData?.episodes?.[currentEpisodeIndex + 1];

  const goBack = () => {
    navigate(-1);
  };

  const playEpisode = (episodeNumber: number) => {
    if (type === 'tv' && season) {
      // Replace current history entry instead of pushing new one
      navigate(`/player/tv/${movieId}/${season}/${episodeNumber}`, { replace: true });
    }
  };

  // Handle language selection and fetch subtitles
  const handleLanguageSelect = async (languageCode: string, languageLabel: string) => {
    if (!playData?.data?.imdb_id) {
      console.error('No IMDB ID available for subtitle search');
      return;
    }

    setLoadingSubtitles(true);
    setSelectedLanguage(languageLabel);
    
    try {
      const subtitles = await getSubtitlesFromOpenSubtitles(
        playData.data.imdb_id,
        languageCode,
        season?.toString(),
        episode?.toString()
      );
      
      setAvailableSubtitles(subtitles);
      setShowSubtitleFiles(true);
      setSubtitleSearch(''); // Clear search when showing files
    } catch (error) {
      console.error('Failed to fetch subtitles:', error);
      setAvailableSubtitles([]);
    } finally {
      setLoadingSubtitles(false);
    }
  };

  // Subtitle conversion utilities
  const convertSrtToVtt = async (subtitleUrl: string, isLink: boolean = true) => {
    try {
      let subtitleContent: string;

      if (isLink) {
        const response = await fetch(subtitleUrl);
        if (!response.ok) throw new Error('Failed to fetch subtitle file');
        subtitleContent = await response.text();
      } else {
        subtitleContent = subtitleUrl; // Direct content
      }

      const fileExt = isLink ? subtitleUrl.split('.').pop()?.toLowerCase() : 'vtt';
      let vttContent: string;
      const styleBlock = '\nSTYLE\n::cue { font-size: 85%; color: #fff; background-color: rgba(0, 0, 0, 0); text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), -2px -2px 4px rgba(0, 0, 0, 0.8), 2px -2px 4px rgba(0, 0, 0, 0.8), -2px 2px 4px rgba(0, 0, 0, 0.8);}';

      if (fileExt === 'srt') {
        vttContent = 'WEBVTT' + styleBlock + '\n\n' + subtitleContent.replace(/,/g, '.').replace(/(\d+)\r\n/g, '$1.0000\r\n');
      } else if (fileExt === 'vtt') {
        vttContent = 'WEBVTT' + styleBlock + '\n\n' + subtitleContent.replace(/,/g, '.').replace(/(\d+)\n/g, '$1.0000\n');
      } else {
        vttContent = 'WEBVTT' + styleBlock + '\n\n' + subtitleContent;
      }

      // Create blob URL
      const blob = new Blob([vttContent], { type: 'text/vtt' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Add subtitle track to video element
      if (videoRef.current) {
        // Remove existing subtitle tracks
        const existingTracks = videoRef.current.querySelectorAll('track[kind="subtitles"]');
        existingTracks.forEach(track => track.remove());
        
        // Add new subtitle track
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = selectedLanguage || 'Subtitles';
        track.srclang = selectedSubtitle || 'en';
        track.src = blobUrl;
        track.default = true;
        
        videoRef.current.appendChild(track);
        
        // Enable the track
        track.addEventListener('load', () => {
          if (videoRef.current?.textTracks[0]) {
            videoRef.current.textTracks[0].mode = 'showing';
          }
        });
        
        setCurrentSubtitleTrack(blobUrl);
      }

      return vttContent;
    } catch (error) {
      console.error('Subtitle conversion error:', error);
      throw error;
    }
  };

  // Handle subtitle file selection and load VTT
  const handleSubtitleFileSelect = async (subtitleInfo: SubtitleInfo) => {
    setLoadingSubtitles(true);
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        const m3u8Url = await extractM3U8WithUserAgent('https://surrit.store/e/870Q0NM2', userAgent);
    try {
      // Get VTT link using the vidsrc.net format
      const getvttLinkFunctionCall = await getVttLink(subtitleInfo);
      const vttLink = `https://vidsrc.net/sub/ops-${subtitleInfo.IDSubtitleFile}.vtt`;
      
      // Load subtitle
      convertSrtToVtt(vttLink, true);
      
      // Close subtitle selector
      setShowSubtitleSelector(false);
      setShowSubtitleFiles(false);
      setSubtitleSearch('');
      
    } catch (error) {
      console.error('Failed to load subtitle:', error);
      // Fallback: try using the original download link
    } finally {
      setLoadingSubtitles(false);
    }
  };

  // Handle back button in subtitle files view
  const handleSubtitleBack = () => {
    setShowSubtitleFiles(false);
    setAvailableSubtitles([]);
    setSelectedLanguage('');
  };

  const handleWaiting = () => {
    setIsBuffering(true);
  };

  const handlePlaying = () => {
    setIsBuffering(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsBuffering(false);
    setHasError(true);
  };

  useEffect(() => {
    const showControlsWithTimeout = () => {
      setShowControls(true);
      
      // Clear any existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Set new timeout only if no dropdowns are open
      if (!showQualitySelector && !showSubtitleSelector && !showSettings && !showShortcuts) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Prevent hiding controls if mouse is over control elements
      const target = e.target as Element;
      const isOverControls = target.closest('[data-controls]') || 
                           target.closest('[data-quality-selector]') || 
                           target.closest('[data-subtitle-selector]') ||
                           target.closest('.absolute.bottom-0');
      
      if (isOverControls) {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = null;
        }
      } else {
        showControlsWithTimeout();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-quality-selector]')) {
        setShowQualitySelector(false);
      }
      if (!target.closest('[data-subtitle-selector]')) {
        setShowSubtitleSelector(false);
        setShowSubtitleFiles(false);
        setSubtitleSearch("");
        setAvailableSubtitles([]);
        setSelectedLanguage("");
      }
    };

    const handleFullscreenChange = () => {
      // Reset controls when entering/exiting fullscreen
      setShowControls(true);
      showControlsWithTimeout();
    };

    const handleVisibilityChange = () => {
      // Reset controls when tab becomes visible/hidden
      if (!document.hidden) {
        setShowControls(true);
        showControlsWithTimeout();
      }
    };

    // Add all event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Show controls initially
    showControlsWithTimeout();
    
    return () => {
      // Clean up all event listeners and timeouts
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, [showQualitySelector, showSubtitleSelector, showSettings, showShortcuts]);

  // Cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      // Clean up any blob URLs when component unmounts
      if (videoRef.current) {
        const tracks = videoRef.current.querySelectorAll('track[kind="subtitles"]');
        tracks.forEach(track => {
          const trackElement = track as HTMLTrackElement;
          if (trackElement.src.startsWith('blob:')) {
            URL.revokeObjectURL(trackElement.src);
          }
        });
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (volume <= 1) {
        videoRef.current.volume = volume;
        if (gainNode) {
          gainNode.gain.value = 1;
        }
      } else {
        videoRef.current.volume = 1;
        if (gainNode) {
          gainNode.gain.value = volume;
        }
      }
      setIsMuted(volume === 0);
    }
  }, [volume, gainNode]);

  useEffect(() => {
    const videoElement = videoRef.current;
    let hlsPlayer: Hls | null = null;

    const initializeHls = () => {
      if (playData?.data?.play_link && videoElement) {
        const playerLink = playData.data.play_link;
        setHasError(false);

        // Initialize Web Audio API for volume amplification
        if (!audioContext && videoElement) {
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = context.createMediaElementSource(videoElement);
            const gain = context.createGain();
            
            source.connect(gain);
            gain.connect(context.destination);
            
            setAudioContext(context);
            setGainNode(gain);
            setAudioSource(source);
          } catch (error) {
            console.warn('Web Audio API not supported, volume limited to 100%');
          }
        }

        if (playerLink.endsWith('.m3u8') && Hls.isSupported()) {
          if (hlsPlayer) {
            hlsPlayer.destroy();
          }

          hlsPlayer = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });

          hlsPlayer.loadSource(playerLink);
          hlsPlayer.attachMedia(videoElement);
          setHlsInstance(hlsPlayer);

          hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
            if (hlsPlayer && hlsPlayer.levels) {
              const levels = hlsPlayer.levels.map((level, index) => ({
                index,
                height: level.height,
                width: level.width,
                bitrate: level.bitrate,
                name: level.name || `${level.height}p`
              }));
              setQualityLevels(levels);
              setCurrentQuality(-1);
            }

            if (videoElement) {
              videoElement.play().catch(handleError);
            }
          });

          hlsPlayer.on(Hls.Events.ERROR, (_, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              handleError();
            }
          });

          hlsPlayer.on(Hls.Events.LEVEL_LOADED, () => {
            setIsBuffering(false);
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl') || !playerLink.endsWith('.m3u8')) {
          videoElement.src = playerLink;
          videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(handleError);
            setIsBuffering(false);
          });
          videoElement.addEventListener('error', handleError);
        } else {
          handleError();
        }
      }
    };

    initializeHls();

    return () => {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
      setHlsInstance(null);
      setQualityLevels([]);
      setCurrentQuality(-1);
      setAudioContext(null);
      setGainNode(null);
      setAudioSource(null);
    };
  }, [playData?.data?.play_link]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && volume === 0) {
        setVolume(1.0);
      }
    }
  }, [isMuted, volume]);
const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (videoRef.current) {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault(); // Prevent page scroll
          togglePlay();
        } else if (e.key === 'ArrowRight') {
          videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
        } else if (e.key === 'ArrowLeft') {
          videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
        } else if (e.key === 'ArrowUp') {
          setVolume((prev) => Math.min(2, prev + 0.05));
        } else if (e.key === 'ArrowDown') {
          setVolume((prev) => Math.max(0, prev - 0.05));
        } else if (e.key === 'F' || e.key === 'f') {
          toggleFullscreen();
        } else if (e.key === 'M' || e.key === 'm') {
          toggleMute();
        } else if (e.key === 'Q' || e.key === 'q') {
          if (qualityLevels.length > 0) {
            setShowQualitySelector(!showQualitySelector);
          }
        } else if (e.key === 'C' || e.key === 'c') {
          setShowSubtitleSelector(!showSubtitleSelector);
        } else if (e.key === 'Escape') {
          if (showQualitySelector) {
            setShowQualitySelector(false);
          } else if (showSubtitleSelector) {
            if (showSubtitleFiles) {
              handleSubtitleBack();
            } else {
              setShowSubtitleSelector(false);
            }
          } else if (showSettings) {
            setShowSettings(false);
          } else if (showShortcuts) {
            setShowShortcuts(false);
          } else {
            handleClosePlayer();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen, toggleMute, showQualitySelector, showSubtitleSelector, showSubtitleFiles, showSettings, showShortcuts, qualityLevels, togglePlay]);

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
  
  

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleClosePlayer = () => {
    const currTime = videoRef.current?.currentTime || 0;
    const totalTime = videoRef.current?.duration || 1;
    
    // Clean up subtitle blob URLs
    if (videoRef.current) {
      const tracks = videoRef.current.querySelectorAll('track[kind="subtitles"]');
      tracks.forEach(track => {
        const trackElement = track as HTMLTrackElement;
        if (trackElement.src.startsWith('blob:')) {
          URL.revokeObjectURL(trackElement.src);
        }
      });
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
    if (isFullscreen) {
      document.exitFullscreen();
    }
    goBack();
  }

  const handleQualityChange = (qualityIndex: number) => {
    if (hlsInstance) {
      if (qualityIndex === -1) {
        hlsInstance.currentLevel = -1;
        setCurrentQuality(-1);
      } else {
        hlsInstance.currentLevel = qualityIndex;
        setCurrentQuality(qualityIndex);
      }
      setShowQualitySelector(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Show loading if data is not available yet
  if (isLoadingLink) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <div className="text-xl mb-2">Loading Video...</div>
          <div className="text-sm text-gray-400">
            {type === 'movie' ? 'Preparing movie stream...' : `Loading ${title} S${season}E${episode}...`}
          </div>
        </div>
      </div>
    );
  }

  // Show error if no play link available
  if (linkError || !playData?.data?.play_link) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-xl mb-4 text-red-400">❌ Unable to Load Video</div>
          <div className="text-sm text-gray-400 mb-6">
            {linkError ? 'Failed to fetch video stream' : 'No video stream available'}
          </div>
          <button 
            onClick={goBack}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full"
          autoPlay
          muted={isMuted}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onError={handleError}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          style={{ background: "#000000" }}
          aria-label="Video player"
        >
        </video>

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10">
            <div className="text-white text-center">
              <div className="text-xl mb-4">Playback Failed</div>
              <div className="text-sm text-gray-400">Unable to load the video stream</div>
            </div>
          </div>
        )}

        {isBuffering && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10" style={{ pointerEvents: 'none' }}>
            <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}

        {/* Header with title and navigation */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="text-white hover:text-gray-300 p-2"
              >
                <FaArrowLeft className="w-6 h-6" />
              </button>
              <div className="text-white">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">{title}</span>
                  <div className="flex items-center space-x-1">
                    {playData?.data?.source === 'extracted' && (
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Stream
                      </span>
                    )}
                    {type === 'tv' && season && episode && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        S{season}E{episode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episode Navigation - Left Side (Previous) */}
        {type === 'tv' && prevEpisode && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={() => playEpisode(prevEpisode.episode_number)}
              className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors shadow-lg"
              title={`Previous Episode: ${prevEpisode.name}`}
            >
              <FaArrowLeft className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Episode Navigation - Right Side (Next) */}
        {type === 'tv' && nextEpisode && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={() => playEpisode(nextEpisode.episode_number)}
              className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors shadow-lg"
              title={`Next Episode: ${nextEpisode.name}`}
            >
              <FaArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300",
            "bg-black bg-opacity-40",
            showControls ? 'opacity-100' : 'opacity-0'
          )}
          data-controls
          onMouseEnter={() => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
              controlsTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (!showQualitySelector && !showSubtitleSelector && !showSettings && !showShortcuts) {
              if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
              }
              controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 1500);
            }
          }}
        >
          <Timeline
            duration={duration}
            currentTime={currentTime}
            buffered={buffered}
            onSeek={handleSeek}
            onPreview={setPreviewTime}
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => handleSeek(Math.max(0, currentTime - 10))} aria-label="Rewind 10s">
                <FaFastBackward className="w-6 h-6 text-white" />
              </button>
              <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? (
                  <FaPause className="w-7 h-7 text-white" />
                ) : (
                  <FaPlay className="w-7 h-7 text-white" />
                )}
              </button>
              <button onClick={() => handleSeek(Math.min(duration, currentTime + 10))} aria-label="Forward 10s">
                <FaFastForward className="w-6 h-6 text-white" />
              </button>
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}>
                  {isMuted || volume === 0 ? (
                    <FaVolumeMute className="w-6 h-6 text-white" />
                  ) : (
                    <FaVolumeUp className="w-6 h-6 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-blue-500"
                  aria-label="Volume"
                />
                <span className="text-white text-xs min-w-[32px]">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <div className="text-white font-mono text-xs">
                {new Date(currentTime * 1000).toISOString().substr(11, 8)} / {new Date(duration * 1000).toISOString().substr(11, 8)}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Subtitle Selector */}
              <div className="relative" data-subtitle-selector>
                <button
                  onClick={() => setShowSubtitleSelector(!showSubtitleSelector)}
                  aria-label="Subtitle selector"
                  className="flex items-center space-x-1"
                >
                  <FaClosedCaptioning className="w-6 h-6 text-white" />
                </button>
                {showSubtitleSelector && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-black/90 text-white rounded-lg shadow-lg z-10 h-80 flex flex-col">
                    {!showSubtitleFiles ? (
                      // Language Selection View
                      <>
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-600 flex-shrink-0">
                          <input
                            type="text"
                            placeholder="Search languages..."
                            value={subtitleSearch}
                            onChange={(e) => setSubtitleSearch(e.target.value)}
                            onMouseEnter={() => setShowControls(true)}
                            onFocus={() => setShowControls(true)}
                            className="w-full bg-gray-800 text-white px-3 py-2 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                            autoFocus
                          />
                        </div>
                        {/* Language Options */}
                        <div 
                          className="flex-1 overflow-y-auto scrollbar-thin"
                          onMouseEnter={() => setShowControls(true)}
                        >
                          <div
                            className={clsx(
                              "px-3 py-2 text-sm hover:cursor-pointer hover:bg-gray-700 hover:text-blue-400",
                              selectedSubtitle === "" && "bg-blue-700 text-blue-300"
                            )}
                            onClick={() => {
                              setSelectedSubtitle("");
                              setCurrentSubtitleTrack("");
                              setShowSubtitleSelector(false);
                              setSubtitleSearch("");
                              // Remove subtitle tracks
                              if (videoRef.current) {
                                const tracks = videoRef.current.querySelectorAll('track[kind="subtitles"]');
                                tracks.forEach(track => {
                                  // Clean up blob URL if it exists
                                  const trackElement = track as HTMLTrackElement;
                                  if (trackElement.src.startsWith('blob:')) {
                                    URL.revokeObjectURL(trackElement.src);
                                  }
                                  trackElement.remove();
                                });
                              }
                            }}
                          >
                            No Subtitles
                          </div>
                          {languageOptions
                            .filter(lang => 
                              lang.label.toLowerCase().includes(subtitleSearch.toLowerCase()) ||
                              lang.value.toLowerCase().includes(subtitleSearch.toLowerCase())
                            )
                            .map((lang) => (
                              <div
                                key={lang.value}
                                className="px-3 py-2 text-sm hover:cursor-pointer hover:bg-gray-700 hover:text-blue-400 flex items-center justify-between"
                                onClick={() => handleLanguageSelect(lang.value, lang.label)}
                              >
                                <span>{lang.label}</span>
                                {loadingSubtitles && selectedLanguage === lang.label && (
                                  <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                                )}
                              </div>
                            ))}
                        </div>
                      </>
                    ) : (
                      // Subtitle Files View
                      <>
                        {/* Header with back button */}
                        <div className="p-3 border-b border-gray-600 flex-shrink-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <button
                              onClick={handleSubtitleBack}
                              className="text-white hover:text-blue-400"
                            >
                              <FaArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium">{selectedLanguage}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {availableSubtitles.length} subtitle{availableSubtitles.length !== 1 ? 's' : ''} found
                          </div>
                        </div>
                        {/* Subtitle Files */}
                        <div 
                          className="flex-1 overflow-y-auto scrollbar-thin"
                          onMouseEnter={() => setShowControls(true)}
                        >
                          {loadingSubtitles ? (
                            <div className="flex items-center justify-center h-20">
                              <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                          ) : availableSubtitles.length > 0 ? (
                            availableSubtitles.map((subtitle, index) => (
                              <div
                                key={subtitle.IDSubtitleFile}
                                className="px-3 py-3 text-sm hover:cursor-pointer hover:bg-gray-700 hover:text-blue-400 border-b border-gray-700 last:border-b-0"
                                onClick={() => handleSubtitleFileSelect(subtitle)}
                              >
                                <div className="font-medium truncate">{subtitle.SubFileName}</div>
                                <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                                  <span>{subtitle.SubFormat?.toUpperCase()}</span>
                                  {subtitle.MovieYear && <span>• {subtitle.MovieYear}</span>}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                              No subtitles found
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setShowSettings((s) => !s)} aria-label="Settings">
                <FaCog className="w-6 h-6 text-white" />
              </button>
              {qualityLevels.length > 0 && (
                <div className="relative" data-quality-selector>
                  <button
                    onClick={() => setShowQualitySelector(!showQualitySelector)}
                    aria-label="Quality selector"
                    className="flex items-center space-x-1"
                  >
                    <FaTv className="w-6 h-6 text-white" />
                    <span className="text-white text-xs">
                      {currentQuality === -1 ? 'AUTO' : `${qualityLevels[currentQuality]?.name || 'AUTO'}`}
                    </span>
                  </button>
                  {showQualitySelector && (
                    <div className="absolute right-0 bottom-full mb-2 w-32 bg-black text-white rounded-lg shadow-lg z-10 overflow-y-auto max-h-64">
                      <div
                        className={clsx(
                          "px-3 py-2 text-sm hover:cursor-pointer hover:bg-gray-700 hover:text-blue-400",
                          currentQuality === -1 && "bg-blue-700 text-blue-300"
                        )}
                        onClick={() => handleQualityChange(-1)}
                      >
                        Auto
                      </div>
                      {qualityLevels.map((level) => (
                        <div
                          key={level.index}
                          className={clsx(
                            "px-3 py-2 text-sm hover:cursor-pointer hover:bg-gray-700 hover:text-blue-400",
                            currentQuality === level.index && "bg-blue-700 text-blue-300"
                          )}
                          onClick={() => handleQualityChange(level.index)}
                        >
                          {level.name} ({Math.round(level.bitrate / 1000)}k)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                {isFullscreen ? (
                  <FaCompress className="w-6 h-6 text-white" />
                ) : (
                  <FaExpand className="w-6 h-6 text-white" />
                )}
              </button>
              <button onClick={() => setShowShortcuts((s) => !s)} aria-label="Show shortcuts">
                <FaQuestionCircle className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings menu */}
        {showSettings && (
          <div className="absolute bottom-24 right-8 w-56 bg-black/90 text-white rounded-lg shadow-lg z-20 p-4">
            <div className="mb-2 font-bold">Playback Speed</div>
            {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                className={clsx(
                  "block w-full text-left px-2 py-1 rounded hover:bg-blue-600",
                  playbackRate === rate && "bg-blue-700"
                )}
                onClick={() => setPlaybackRate(rate)}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}

        {/* Keyboard shortcuts overlay */}
        {showShortcuts && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-black/90 text-white rounded-lg shadow-lg p-8 w-96">
              <div className="text-lg font-bold mb-4">Keyboard Shortcuts</div>
              <ul className="space-y-2 text-sm">
                <li><b>Space</b>: Play/Pause</li>
                <li><b>← / →</b>: Seek -10s / +10s</li>
                <li><b>↑ / ↓</b>: Volume Up/Down</li>
                <li><b>F</b>: Fullscreen</li>
                <li><b>M</b>: Mute</li>
                <li><b>Q</b>: Quality Selector</li>
                <li><b>C</b>: Subtitle Selector</li>
                <li><b>?</b>: Show/Hide Shortcuts</li>
                <li><b>Esc</b>: Close Player / Close Menus</li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-blue-600 rounded" onClick={() => setShowShortcuts(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          className={clsx(
            "absolute w-8 h-8 top-4 right-4 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-800 transition-opacity duration-300 z-20",
            showControls ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handleClosePlayer}
          aria-label="Close player"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;