import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { 
  getPopularTVShows, 
  getTopRatedTVShows, 
  getTrendingTVShows 
} from '../../services/tmdbApi';
import MovieCard from '../../components/movie-card';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const TVShowsPage: React.FC = () => {
  const { category = 'popular' } = useParams<{ category: string }>();
  
  // Handle scroll restoration
  useScrollToTop();

  const getTVShowsFunction = () => {
    switch (category) {
      case 'top-rated':
        return getTopRatedTVShows;
      case 'trending':
        return () => getTrendingTVShows('week');
      default:
        return getPopularTVShows;
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
    queryKey: ['tv-shows', category],
    queryFn: ({ pageParam = 1 }) => {
      const func = getTVShowsFunction();
      return category === 'trending' ? func() : func(pageParam);
    },
    getNextPageParam: (lastPage) => {
      if (category === 'trending') return undefined; // Trending doesn't support pagination
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const allTVShows = data?.pages.flatMap(page => page.results) || [];
  const totalResults = data?.pages[0]?.total_results || 0;

  const getCategoryTitle = () => {
    switch (category) {
      case 'top-rated':
        return 'Top Rated TV Shows';
      case 'trending':
        return 'Trending TV Shows';
      default:
        return 'Popular TV Shows';
    }
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage && category !== 'trending') {
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
              {totalResults.toLocaleString()} TV shows
            </p>
          )}
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'popular', label: 'Popular' },
              { key: 'top-rated', label: 'Top Rated' },
              { key: 'trending', label: 'Trending' },
            ].map((cat) => (
              <Link
                key={cat.key}
                to={`/tv-shows/${cat.key}`}
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
            <div className="text-xl">Loading TV shows...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-red-600">Error loading TV shows. Please try again.</div>
          </div>
        )}

        {allTVShows.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {allTVShows.map((tvShow: any) => (
                <MovieCard key={tvShow.id} item={tvShow} type="tv" />
              ))}
            </div>

            {/* Load More Button - only show if not trending and has more pages */}
            {category !== 'trending' && hasNextPage && (
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isFetchingNextPage}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TVShowsPage;
