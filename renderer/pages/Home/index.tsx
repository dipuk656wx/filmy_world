import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrendingMovies, getPopularMovies, getTrendingTVShows, Movie, TVShow, getBackdropUrl } from '../../services/tmdbApi';
import MovieCard from '../../components/movie-card';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const Home: React.FC = () => {
  const [heroIndex, setHeroIndex] = useState(0);
  
  // Handle scroll restoration
  useScrollToTop();

  const { data: trendingMovies } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => getTrendingMovies('week'),
  });

  const { data: popularMovies } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: () => getPopularMovies(),
  });

  const { data: trendingTVShows } = useQuery({
    queryKey: ['trending-tv'],
    queryFn: () => getTrendingTVShows('week'),
  });

  // Auto-rotate hero section
  useEffect(() => {
    if (trendingMovies?.results.length) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % Math.min(5, trendingMovies.results.length));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [trendingMovies]);

  const heroMovie = trendingMovies?.results[heroIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-96 md:h-[500px] overflow-hidden mt-20">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getBackdropUrl(heroMovie.backdrop_path, 'w1280')})`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {heroMovie.title}
              </h1>
              <p className="text-lg md:text-xl mb-6 line-clamp-3">
                {heroMovie.overview}
              </p>
              <div className="flex items-center space-x-4">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {heroMovie.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-300">
                  {new Date(heroMovie.release_date).getFullYear()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Hero Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {trendingMovies?.results.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setHeroIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === heroIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Trending Movies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingMovies?.results.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} item={movie} type="movie" />
            ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularMovies?.results.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} item={movie} type="movie" />
            ))}
          </div>
        </section>

        {/* Trending TV Shows */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending TV Shows</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingTVShows?.results.slice(0, 10).map((show) => (
              <MovieCard key={show.id} item={show} type="tv" />
            ))}
          </div>
        </section>

        {/* TMDb Credit */}
        <section className="text-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 inline-block">
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
        </section>
      </main>
    </div>
  );
};

export default Home;