import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaChevronDown, FaPlay, FaStar } from 'react-icons/fa';
import { getTVShowSeason, getImageUrl, Season, Episode } from '../../services/tmdbApi';
import { Link, useNavigate } from 'react-router-dom';

interface SeasonsEpisodesProps {
  tvId: number;
  totalSeasons: number;
}

const SeasonsEpisodes: React.FC<SeasonsEpisodesProps> = ({ tvId, totalSeasons }) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const navigate = useNavigate();

  const { data: seasonData, isLoading, error } = useQuery({
    queryKey: ['tv-season', tvId, selectedSeason],
    queryFn: () => getTVShowSeason(tvId, selectedSeason),
    enabled: !!tvId && selectedSeason > 0,
  });

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(selectedEpisode?.id === episode.id ? null : episode);
  };

  const formatRuntime = (runtime: number) => {
    if (!runtime) return 'N/A';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Seasons & Episodes</h2>
      
      {/* Season Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((seasonNum) => (
            <button
              key={seasonNum}
              onClick={() => {
                setSelectedSeason(seasonNum);
                setSelectedEpisode(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedSeason === seasonNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Season {seasonNum}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-lg">Loading season {selectedSeason}...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-32">
          <div className="text-lg text-red-600">Error loading season data</div>
        </div>
      )}

      {/* Season Info */}
      {seasonData && (
        <div className="space-y-6">
          {/* Season Header */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              {seasonData.poster_path && (
                <img
                  src={getImageUrl(seasonData.poster_path, 'w342')}
                  alt={seasonData.name}
                  className="w-32 h-48 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {seasonData.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {seasonData.overview || 'No description available.'}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <span><strong>Episodes:</strong> {seasonData.episode_count}</span>
                  {seasonData.air_date && (
                    <span><strong>Air Date:</strong> {formatDate(seasonData.air_date)}</span>
                  )}
                  <span><strong>Rating:</strong> ⭐ {seasonData.vote_average.toFixed(1)}</span>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/tv/${tvId}/season/${selectedSeason}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    View Full Season
                    <FaChevronDown className="ml-2 w-4 h-4 rotate-90" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Episodes List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Episodes</h4>
            {seasonData.episodes.map((episode) => (
              <div key={episode.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleEpisodeClick(episode)}
                >
                  <div className="flex items-start gap-4">
                    {episode.still_path && (
                      <img
                        src={getImageUrl(episode.still_path, 'w300')}
                        alt={episode.name}
                        className="w-24 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {episode.episode_number}. {episode.name}
                          </h5>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {episode.overview || 'No description available.'}
                          </p>
                        </div>
                        <div className="ml-4 text-right text-sm text-gray-500 flex-shrink-0">
                          {episode.air_date && (
                            <div>{formatDate(episode.air_date)}</div>
                          )}
                          <div>{formatRuntime(episode.runtime)}</div>
                          <div>⭐ {episode.vote_average.toFixed(1)}</div>
                          
                          {/* Watch Now Button for Episode */}
                            <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/player/tv/${tvId}/${selectedSeason}/${episode.episode_number}`);
                            }}
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-md font-semibold flex items-center justify-center space-x-1 transition-colors"
                            >
                            <FaPlay className="w-3 h-3" />
                            <span>Watch</span>
                            </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <FaChevronDown
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          selectedEpisode?.id === episode.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Episode Details (Expanded) */}
                {selectedEpisode?.id === episode.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="space-y-4">
                      {/* Full Overview */}
                      {episode.overview && (
                        <div>
                          <h6 className="font-semibold text-gray-900 mb-2">Synopsis</h6>
                          <p className="text-gray-700">{episode.overview}</p>
                        </div>
                      )}

                      {/* Guest Stars */}
                      {episode.guest_stars && episode.guest_stars.length > 0 && (
                        <div>
                          <h6 className="font-semibold text-gray-900 mb-2">Guest Stars</h6>
                          <div className="flex flex-wrap gap-2">
                            {episode.guest_stars.slice(0, 10).map((star) => (
                              <span
                                key={star.id}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                              >
                                {star.name} ({star.character})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Crew */}
                      {episode.crew && episode.crew.length > 0 && (
                        <div>
                          <h6 className="font-semibold text-gray-900 mb-2">Crew</h6>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {episode.crew
                              .filter((member) => ['Director', 'Writer'].includes(member.job))
                              .slice(0, 6)
                              .map((member) => (
                                <div key={member.credit_id} className="text-gray-700">
                                  <span className="font-medium">{member.job}:</span> {member.name}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Episode Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Episode:</span>
                          <div className="text-gray-600">{episode.episode_number}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Runtime:</span>
                          <div className="text-gray-600">{formatRuntime(episode.runtime)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Rating:</span>
                          <div className="text-gray-600">⭐ {episode.vote_average.toFixed(1)}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Votes:</span>
                          <div className="text-gray-600">{episode.vote_count.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      {/* Watch Now Button for Expanded Episode */}
                      <div className="pt-4 border-t border-gray-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/player/tv/${tvId}/${selectedSeason}/${episode.episode_number}`);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                        >
                          <FaPlay className="w-4 h-4" />
                          <span>Watch Episode {episode.episode_number}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonsEpisodes;
