import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { multiSearch } from '../../services/tmdbApi';
import MovieCard from '../../components/movie-card';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // Handle scroll restoration
  useScrollToTop();

  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['search-results', query],
    queryFn: ({ pageParam = 1 }) => multiSearch(query, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!query,
  });

  // Flatten all pages into a single array
  const allResults = data?.pages.flatMap(page => page.results) || [];
  const totalResults = data?.pages[0]?.total_results || 0;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
            <p className="text-gray-600">Enter a search term to find movies, TV shows, and people.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          {totalResults > 0 && (
            <p className="text-gray-600">
              {totalResults.toLocaleString()} results found
            </p>
          )}
        </div>

        {isLoading && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Searching...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-red-600">Error searching. Please try again.</div>
          </div>
        )}

        {data && allResults.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-xl text-gray-600 mb-2">No results found</div>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          </div>
        )}

        {allResults.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {allResults.map((item: any) => {
                // Determine item type
                const itemType = 'title' in item ? 'movie' : 'name' in item && 'first_air_date' in item ? 'tv' : 'person';
                
                if (itemType === 'person') {
                  // Handle person results differently
                  return (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <img
                        src={`https://image.tmdb.org/t/p/w342${(item as any).profile_path || ''}`}
                        alt={(item as any).name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = './placeholder-image.jpg';
                        }}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {(item as any).name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {(item as any).known_for_department}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <MovieCard 
                    key={item.id} 
                    item={item as any} 
                    type={itemType as 'movie' | 'tv'} 
                  />
                );
              })}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
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

export default SearchResults;
