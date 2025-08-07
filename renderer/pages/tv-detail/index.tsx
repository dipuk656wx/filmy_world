import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getImageUrl, getBackdropUrl, getTVShowDetails, TVShowDetails } from '../../services/tmdbApi';
import Header from '../../components/header';
import SeasonsEpisodes from '../../components/seasons-episodes';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const TVShowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Handle scroll restoration
  useScrollToTop();
  
  const { data: tvShow, isLoading, error } = useQuery({
    queryKey: ['tv-details', id],
    queryFn: () => getTVShowDetails(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-96 mt-20">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-96 mt-20">
          <div className="text-xl text-red-600">Error loading TV show details</div>
        </div>
      </div>
    );
  }

  const formatRuntime = (runtimes: number[]) => {
    if (!runtimes || runtimes.length === 0) return 'N/A';
    const avgRuntime = Math.round(runtimes.reduce((a, b) => a + b, 0) / runtimes.length);
    return `${avgRuntime}m`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden mt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getBackdropUrl(tvShow.backdrop_path, 'w1280')})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(tvShow.poster_path, 'w342')}
                alt={tvShow.name}
                className="w-48 md:w-64 rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Details */}
            <div className="text-white flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {tvShow.name}
              </h1>
              
              {tvShow.tagline && (
                <p className="text-lg md:text-xl text-gray-300 mb-4 italic">
                  {tvShow.tagline}
                </p>
              )}
              
              <div className="flex flex-wrap items-center space-x-4 mb-4 text-sm md:text-base">
                <span className="bg-blue-600 px-3 py-1 rounded-full font-semibold">
                  ⭐ {tvShow.vote_average.toFixed(1)}
                </span>
                <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                <span>{formatRuntime(tvShow.episode_run_time)}</span>
                <span className="capitalize">{tvShow.status}</span>
                <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                <span>{tvShow.number_of_episodes} Episodes</span>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-gray-700 bg-opacity-70 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-lg leading-relaxed mb-6 max-w-3xl">
                {tvShow.overview}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Show Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Show Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700">First Air Date:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(tvShow.first_air_date).toLocaleDateString()}
                </span>
              </div>
              {tvShow.last_air_date && (
                <div>
                  <span className="font-semibold text-gray-700">Last Air Date:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(tvShow.last_air_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <span className="ml-2 text-gray-600">{tvShow.status}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">In Production:</span>
                <span className="ml-2 text-gray-600">{tvShow.in_production ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Original Language:</span>
                <span className="ml-2 text-gray-600 uppercase">{tvShow.original_language}</span>
              </div>
            </div>
          </div>

          {/* Networks & Production */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Networks & Production</h3>
            <div className="space-y-3">
              {tvShow.networks.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Networks:</span>
                  <div className="mt-1">
                    {tvShow.networks.map((network, index) => (
                      <span key={network.id} className="text-gray-600">
                        {network.name}
                        {index < tvShow.networks.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tvShow.production_companies.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Production Companies:</span>
                  <div className="mt-1">
                    {tvShow.production_companies.map((company, index) => (
                      <span key={company.id} className="text-gray-600">
                        {company.name}
                        {index < tvShow.production_companies.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Creators & Countries */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Additional Info</h3>
            <div className="space-y-3">
              {tvShow.created_by.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Created by:</span>
                  <div className="mt-1">
                    {tvShow.created_by.map((creator, index) => (
                      <span key={creator.id} className="text-gray-600">
                        {creator.name}
                        {index < tvShow.created_by.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tvShow.origin_country.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Origin Countries:</span>
                  <div className="mt-1">
                    {tvShow.origin_country.map((country, index) => (
                      <span key={country} className="text-gray-600">
                        {country}
                        {index < tvShow.origin_country.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Popularity:</span>
                <span className="ml-2 text-gray-600">{tvShow.popularity.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons and Episodes Section */}
        {tvShow.number_of_seasons > 0 && (
          <SeasonsEpisodes 
            tvId={tvShow.id} 
            totalSeasons={tvShow.number_of_seasons} 
          />
        )}
      </section>

      {/* TMDb Credit */}
      <section className="container mx-auto px-4 py-4">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">
              This product uses the{' '}
              <a 
                href="https://www.themoviedb.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                TMDb API
              </a>
              {' '}but is not endorsed or certified by{' '}
              <a 
                href="https://www.themoviedb.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                TMDb
              </a>
              .
            </p>
            <div className="mt-2">
              <a 
                href="https://www.themoviedb.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img 
                  src="./images/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg"
                  alt="The Movie Database (TMDb)"
                  className="h-6 mx-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TVShowDetail;
