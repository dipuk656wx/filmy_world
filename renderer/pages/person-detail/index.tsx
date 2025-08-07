import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  getPersonDetails, 
  getPersonCombinedCredits, 
  getImageUrl,
  PersonDetails as PersonDetailsType,
  PersonCombinedCredits,
  PersonMovieCredit,
  PersonTVCredit
} from '../../services/tmdbApi';
import Header from '../../components/header';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const PersonDetail: React.FC = () => {
  useScrollToTop();
  const { id } = useParams<{ id: string }>();
  const personId = parseInt(id || '0', 10);

  const { 
    data: person, 
    isLoading: personLoading, 
    error: personError 
  } = useQuery<PersonDetailsType>({
    queryKey: ['person', personId],
    queryFn: () => getPersonDetails(personId),
    enabled: !!personId,
  });

  const { 
    data: credits, 
    isLoading: creditsLoading, 
    error: creditsError 
  } = useQuery<PersonCombinedCredits>({
    queryKey: ['person-credits', personId],
    queryFn: () => getPersonCombinedCredits(personId),
    enabled: !!personId,
  });

  const isLoading = personLoading || creditsLoading;
  const hasError = personError || creditsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Loading person details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (hasError || !person) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-red-600">Error loading person details. Please try again.</div>
          </div>
        </main>
      </div>
    );
  }

  // Helper function to check if an item is a movie
  const isMovieCredit = (item: PersonMovieCredit | PersonTVCredit): item is PersonMovieCredit => 'title' in item;

  // Combine and sort all credits by date (newest first)
  const allCredits = [
    ...(credits?.cast || []),
    ...(credits?.crew || [])
  ]
    .filter((item, index, self) => 
      // Remove duplicates based on id and media type
      index === self.findIndex(t => t.id === item.id && 
        (isMovieCredit(t) === isMovieCredit(item)))
    )
    .sort((a, b) => {
      const dateA = isMovieCredit(a) ? a.release_date : (a as PersonTVCredit).first_air_date || '0000';
      const dateB = isMovieCredit(b) ? b.release_date : (b as PersonTVCredit).first_air_date || '0000';
      return dateB.localeCompare(dateA);
    });

  // Get main cast credits (as actor/actress)
  const mainCastCredits = credits?.cast || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Person Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(person.profile_path, 'w300')}
                alt={person.name}
                className="w-64 h-80 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = './placeholder-image.jpg';
                }}
              />
            </div>

            {/* Person Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {person.name}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Known For</h3>
                  <p className="text-gray-600">{person.known_for_department}</p>
                </div>
                
                {person.birthday && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Birthday</h3>
                    <p className="text-gray-600">
                      {new Date(person.birthday).toLocaleDateString()}
                      {person.deathday && ` - ${new Date(person.deathday).toLocaleDateString()}`}
                    </p>
                  </div>
                )}
                
                {person.place_of_birth && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Place of Birth</h3>
                    <p className="text-gray-600">{person.place_of_birth}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-gray-700">Popularity</h3>
                  <p className="text-gray-600">{person.popularity.toFixed(1)}</p>
                </div>
              </div>

              {person.biography && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Biography</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {person.biography.length > 500 
                      ? `${person.biography.substring(0, 500)}...` 
                      : person.biography
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Known For (Main Acting Credits) */}
        {mainCastCredits.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Known For</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mainCastCredits.slice(0, 12).map((item: any) => {
                const isMovie = 'title' in item;
                const title = isMovie ? item.title : item.name;
                const date = isMovie ? item.release_date : item.first_air_date;
                const linkPath = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;

                return (
                  <Link key={`${item.id}-${isMovie ? 'movie' : 'tv'}`} to={linkPath}>
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden h-72 flex flex-col">
                      <img
                        src={getImageUrl(item.poster_path)}
                        alt={title}
                        className="w-full h-48 object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = './placeholder-image.jpg';
                        }}
                      />
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                            {title}
                          </h4>
                          {item.character && (
                            <p className="text-xs text-gray-600 mb-1 line-clamp-1">as {item.character}</p>
                          )}
                        </div>
                        {date && (
                          <p className="text-xs text-gray-500 mt-auto">
                            {new Date(date).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* All Credits */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Credits ({allCredits.length})</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              {allCredits.map((item: any, index) => {
                const isMovie = 'title' in item;
                const title = isMovie ? item.title : item.name;
                const date = isMovie ? item.release_date : item.first_air_date;
                const year = date ? new Date(date).getFullYear() : 'TBA';
                const linkPath = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
                
                return (
                  <div key={`${item.id}-${isMovie ? 'movie' : 'tv'}-${index}`} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
                    <Link to={linkPath} className="flex-shrink-0">
                      <img
                        src={getImageUrl(item.poster_path, 'w92')}
                        alt={title}
                        className="w-12 h-16 object-cover rounded shadow"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = './placeholder-image.jpg';
                        }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={linkPath}
                        className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {title}
                      </Link>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{year}</span>
                        {item.character && (
                          <span> • as <em>{item.character}</em></span>
                        )}
                        {item.job && !item.character && (
                          <span> • {item.job}</span>
                        )}
                        {item.episode_count && (
                          <span> • {item.episode_count} episodes</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isMovie ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isMovie ? 'Movie' : 'TV Show'}
                        </span>
                        {item.vote_average > 0 && (
                          <span className="text-xs text-yellow-600">
                            ⭐ {item.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TMDb Credit */}
        <div className="mt-8 text-center">
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
      </main>
    </div>
  );
};

export default PersonDetail;
