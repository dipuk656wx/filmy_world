import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';
import Hls from 'hls.js'; 
import { FaCog, FaFastForward, FaFastBackward, FaQuestionCircle, FaTv } from 'react-icons/fa';
import clsx from 'clsx';

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
  playerLink: string;
  onClose: () => void;
}

const VidSrcPlayer: React.FC<VideoPlayerProps> = ({
  playerLink,
  onClose
}) => {
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
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('[data-quality-selector]')) {
        setShowQualitySelector(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      clearTimeout(timeout);
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
      if (playerLink && videoElement) {
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
  }, [playerLink]);

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
        } else if (e.key === 'Escape') {
          if (showQualitySelector) {
            setShowQualitySelector(false);
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
  }, [toggleFullscreen, toggleMute, showQualitySelector, showSettings, showShortcuts, qualityLevels, togglePlay]);

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
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
    if (isFullscreen) {
      document.exitFullscreen();
    }
    onClose();
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

        {/* Controls */}
        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300",
            "bg-black bg-opacity-40",
            showControls ? 'opacity-100' : 'opacity-0'
          )}
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
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

export default VidSrcPlayer;