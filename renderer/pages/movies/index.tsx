import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getUpcomingMovies, 
  getNowPlayingMovies 
} from '../../services/tmdbApi';
import MovieCard from '../../components/movie-card';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { useTranslation } from '../../store/languageStore';

const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category = 'popular' } = useParams<{ category: string }>();
  const { t, currentLanguage } = useTranslation();
  
  // Handle scroll restoration
  useScrollToTop();
  
  const getMoviesFunction = () => {
    switch (category) {
      case 'top-rated':
        return getTopRatedMovies;
      case 'upcoming':
        return getUpcomingMovies;
      case 'now-playing':
        return getNowPlayingMovies;
      default:
        return getPopularMovies;
    }
  };

  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['movies', category, currentLanguage],
    queryFn: ({ pageParam = 1 }) => getMoviesFunction()(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const allMovies = data?.pages.flatMap(page => page.results) || [];
  const totalResults = data?.pages[0]?.total_results || 0;

  const getCategoryTitle = () => {
    switch (category) {
      case 'top-rated':
        return t('topRatedMovies');
      case 'upcoming':
        return t('upcomingMovies');
      case 'now-playing':
        return t('nowPlaying');
      default:
        return t('popularMovies');
    }
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getCategoryTitle()}
          </h1>
          {totalResults > 0 && (
            <p className="text-gray-600">
              {totalResults.toLocaleString()} {t('movies').toLowerCase()}
            </p>
          )}
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'popular', label: t('popular') },
              { key: 'top-rated', label: t('topRated') },
              { key: 'upcoming', label: t('upcoming') },
              { key: 'now-playing', label: t('nowPlaying') },
            ].map((cat) => (
              <Link
                key={cat.key}
                to={`/movies/${cat.key}`}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  category === cat.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {isLoading && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">{t('loading')}</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-red-600">{t('error')}</div>
          </div>
        )}

        {allMovies.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {allMovies.map((movie: any) => (
                <MovieCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isFetchingNextPage}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isFetchingNextPage ? t('loading') : t('loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MoviesPage;
