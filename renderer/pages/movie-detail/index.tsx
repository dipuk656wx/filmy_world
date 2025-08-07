import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaPlay, FaStar, FaCalendar, FaClock } from 'react-icons/fa';
import { getMovieDetails, getImageUrl, getBackdropUrl } from '../../services/tmdbApi';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Handle scroll restoration
  useScrollToTop();
  
  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie-details', id],
    queryFn: () => getMovieDetails(Number(id)),
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

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex items-center justify-center h-96 mt-20">
          <div className="text-xl text-red-600">Error loading movie details</div>
        </div>
      </div>
    );
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden mt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, 'w1280')})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(movie.poster_path, 'w342')}
                alt={movie.title}
                className="w-48 md:w-64 rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Details */}
            <div className="text-white flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-lg md:text-xl text-gray-300 mb-4 italic">
                  {movie.tagline}
                </p>
              )}
              
              <div className="flex flex-wrap items-center space-x-4 mb-4 text-sm md:text-base">
                <span className="bg-blue-600 px-3 py-1 rounded-full font-semibold">
                  ⭐ {movie.vote_average.toFixed(1)}
                </span>
                <span>{new Date(movie.release_date).getFullYear()}</span>
                <span>{formatRuntime(movie.runtime)}</span>
                <span className="capitalize">{movie.status}</span>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
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
                {movie.overview}
              </p>
              
              {/* Watch Now Button */}
              <button
                onClick={() => {
                  navigate(`/player/movie/${movie.id}`);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center space-x-2 transition-colors"
              >
                <FaPlay className="w-5 h-5" />
                <span>Watch Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Production Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Production Details</h3>
            <div className="space-y-3">
              {movie.budget > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Budget:</span>
                  <span className="ml-2 text-gray-600">{formatCurrency(movie.budget)}</span>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Revenue:</span>
                  <span className="ml-2 text-gray-600">{formatCurrency(movie.revenue)}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Original Language:</span>
                <span className="ml-2 text-gray-600 uppercase">{movie.original_language}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Popularity:</span>
                <span className="ml-2 text-gray-600">{movie.popularity.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Production Companies */}
          {movie.production_companies.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Production Companies</h3>
              <div className="space-y-2">
                {movie.production_companies.map((company) => (
                  <div key={company.id} className="text-gray-600">
                    {company.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countries & Languages */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Release Info</h3>
            <div className="space-y-3">
              {movie.production_countries.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Countries:</span>
                  <div className="mt-1">
                    {movie.production_countries.map((country, index) => (
                      <span key={country.iso_3166_1} className="text-gray-600">
                        {country.name}
                        {index < movie.production_countries.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {movie.spoken_languages.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Languages:</span>
                  <div className="mt-1">
                    {movie.spoken_languages.map((language, index) => (
                      <span key={language.iso_639_1} className="text-gray-600">
                        {language.english_name}
                        {index < movie.spoken_languages.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default MovieDetail;
