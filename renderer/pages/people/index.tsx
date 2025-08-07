import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPopularPeople, getImageUrl } from '../../services/tmdbApi';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const PeoplePage: React.FC = () => {
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
    queryKey: ['popular-people'],
    queryFn: ({ pageParam = 1 }) => getPopularPeople(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const allPeople = data?.pages.flatMap(page => page.results) || [];
  const totalResults = data?.pages[0]?.total_results || 0;

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
            Popular People
          </h1>
          {totalResults > 0 && (
            <p className="text-gray-600">
              {totalResults.toLocaleString()} people
            </p>
          )}
        </div>

        {isLoading && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Loading people...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-red-600">Error loading people. Please try again.</div>
          </div>
        )}

        {allPeople.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {allPeople.map((person: any) => (
                <Link 
                  key={person.id} 
                  to={`/person/${person.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={getImageUrl(person.profile_path)}
                    alt={person.name}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = './placeholder-image.jpg';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {person.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {person.known_for_department}
                    </p>
                    <div className="text-xs text-gray-500">
                      Popularity: {person.popularity.toFixed(1)}
                    </div>
                  </div>
                </Link>
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

export default PeoplePage;
