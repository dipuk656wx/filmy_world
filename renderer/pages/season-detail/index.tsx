import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTVShowSeason, getImageUrl, getTVShowDetails } from '../../services/tmdbApi';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const SeasonDetail: React.FC = () => {
  const { tvId, seasonNumber } = useParams<{ tvId: string; seasonNumber: string }>();
  
  // Handle scroll restoration
  useScrollToTop();
  
  const { data: tvShow } = useQuery({
    queryKey: ['tv-details', tvId],
    queryFn: () => getTVShowDetails(Number(tvId)),
    enabled: !!tvId,
  });

  const { data: seasonData, isLoading, error } = useQuery({
    queryKey: ['tv-season', tvId, seasonNumber],
    queryFn: () => getTVShowSeason(Number(tvId), Number(seasonNumber)),
    enabled: !!tvId && !!seasonNumber,
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (runtime: number) => {
    if (!runtime) return 'N/A';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-96 mt-20">
          <div className="text-xl">Loading season details...</div>
        </div>
      </div>
    );
  }

  if (error || !seasonData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-96 mt-20">
          <div className="text-xl text-red-600">Error loading season details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to="/tv-shows" className="hover:text-blue-600">TV Shows</Link>
            <span>/</span>
            {tvShow && (
              <>
          <Link to={`/tv/${tvId}`} className="hover:text-blue-600">{tvShow.name}</Link>
          <span>/</span>
              </>
            )}
            <span className="text-gray-900">{seasonData.name}</span>
          </div>
        </nav>

        {/* Season Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {seasonData.poster_path && (
              <img
                src={getImageUrl(seasonData.poster_path, 'w342')}
                alt={seasonData.name}
                className="w-48 h-72 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {seasonData.name}
              </h1>
              {tvShow && (
                <h2 className="text-xl text-gray-600 mb-4">
                  from {tvShow.name}
                </h2>
              )}
              <p className="text-gray-700 mb-4 leading-relaxed">
                {seasonData.overview || 'No description available for this season.'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Episodes:</span>
                  <div className="text-gray-600">{seasonData.episode_count}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Air Date:</span>
                  <div className="text-gray-600">{formatDate(seasonData.air_date)}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Season:</span>
                  <div className="text-gray-600">{seasonData.season_number}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Rating:</span>
                  <div className="text-gray-600">⭐ {seasonData.vote_average.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Episodes</h2>
          {seasonData.episodes.map((episode) => (
            <div key={episode.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex gap-6">
                  {episode.still_path && (
                    <img
                      src={getImageUrl(episode.still_path, 'w300')}
                      alt={episode.name}
                      className="w-40 h-24 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      <div className="text-right text-sm text-gray-500 ml-4">
                        {episode.air_date && (
                          <div>{formatDate(episode.air_date)}</div>
                        )}
                        <div>{formatRuntime(episode.runtime)}</div>
                        <div>⭐ {episode.vote_average.toFixed(1)}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {episode.overview || 'No description available for this episode.'}
                    </p>
                    
                    {/* Guest Stars */}
                    {episode.guest_stars && episode.guest_stars.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Guest Stars:</h4>
                        <div className="flex flex-wrap gap-2">
                          {episode.guest_stars.slice(0, 8).map((star) => (
                            <span
                              key={star.id}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                            >
                              {star.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crew */}
                    {episode.crew && episode.crew.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Crew:</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {episode.crew
                            .filter((member) => ['Director', 'Writer'].includes(member.job))
                            .slice(0, 4)
                            .map((member) => (
                              <span key={member.credit_id}>
                                <strong>{member.job}:</strong> {member.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Watch Now Button */}
                    <button
                      onClick={() => {
                        // TODO: Add watch functionality for episode
                        console.log(`Watch episode ${episode.episode_number}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>Watch Episode</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SeasonDetail;
