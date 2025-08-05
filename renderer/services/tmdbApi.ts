// TMDb API Configuration
// You'll need to get an API key from https://www.themoviedb.org/settings/api

import { extractM3u8Link } from "../services/backgroundScraper";

const TMDB_BASE_URL = 'http://172.233.155.175:5000/api/filmy/moviedb';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// API key for authentication
const API_KEY = 'e7ef4ea1f205b13f34cac8be3fdc51fd';

interface TMDbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  homepage: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  original_name: string;
  popularity: number;
}

export interface TVShowDetails extends TVShow {
  last_air_date: string;
  genres: Genre[];
  number_of_episodes: number;
  number_of_seasons: number;
  episode_run_time: number[];
  status: string;
  tagline: string;
  homepage: string;
  in_production: boolean;
  languages: string[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  networks: Array<{
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }>;
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    profile_path: string | null;
  }>;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  adult: boolean;
  known_for_department: string;
  popularity: number;
}

// API Helper function
const apiRequest = async <T>(endpoint: string): Promise<T> => {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${endpoint}${separator}language=en-US`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('TMDb API Error:', error);
    throw error;
  }
};

// Image URL helpers
export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return 'placeholder-image.jpg'; // Relative to static folder where index.html is served
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: string = 'w1280'): string => {
  if (!path) return 'placeholder-image.jpg'; // Relative to static folder where index.html is served
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Movie API functions
export const getPopularMovies = async (page: number = 1): Promise<TMDbResponse<Movie>> => {
  return apiRequest<TMDbResponse<Movie>>(`/movie/popular?page=${page}`);
};

export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDbResponse<Movie>> => {
  return apiRequest<TMDbResponse<Movie>>(`/trending/movie/${timeWindow}`);
};

export const getTopRatedMovies = async (page: number = 1): Promise<TMDbResponse<Movie>> => {
  return apiRequest<TMDbResponse<Movie>>(`/movie/top_rated?page=${page}`);
};

export const getUpcomingMovies = async (page: number = 1): Promise<TMDbResponse<Movie>> => {
  return apiRequest<TMDbResponse<Movie>>(`/movie/upcoming?page=${page}`);
};

export const getNowPlayingMovies = async (page: number = 1): Promise<TMDbResponse<Movie>> => {
  return apiRequest<TMDbResponse<Movie>>(`/movie/now_playing?page=${page}`);
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  return apiRequest<MovieDetails>(`/movie/${movieId}`);
};

export const searchMovies = async (query: string, page: number = 1): Promise<TMDbResponse<Movie>> => {
  return apiRequest<TMDbResponse<Movie>>(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
};

// TV Show API functions
export const getPopularTVShows = async (page: number = 1): Promise<TMDbResponse<TVShow>> => {
  return apiRequest<TMDbResponse<TVShow>>(`/tv/popular?page=${page}`);
};

export const getTrendingTVShows = async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDbResponse<TVShow>> => {
  return apiRequest<TMDbResponse<TVShow>>(`/trending/tv/${timeWindow}`);
};

export const getTopRatedTVShows = async (page: number = 1): Promise<TMDbResponse<TVShow>> => {
  return apiRequest<TMDbResponse<TVShow>>(`/tv/top_rated?page=${page}`);
};

export const getTVShowDetails = async (tvId: number): Promise<TVShowDetails> => {
  return apiRequest<TVShowDetails>(`/tv/${tvId}`);
};

export const searchTVShows = async (query: string, page: number = 1): Promise<TMDbResponse<TVShow>> => {
  return apiRequest<TMDbResponse<TVShow>>(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
};

// People API functions
export const getPopularPeople = async (page: number = 1): Promise<TMDbResponse<Person>> => {
  return apiRequest<TMDbResponse<Person>>(`/person/popular?page=${page}`);
};

export const searchPeople = async (query: string, page: number = 1): Promise<TMDbResponse<Person>> => {
  return apiRequest<TMDbResponse<Person>>(`/search/person?query=${encodeURIComponent(query)}&page=${page}`);
};

// Genre API functions
export const getMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  return apiRequest<{ genres: Genre[] }>('/genre/movie/list');
};

export const getTVGenres = async (): Promise<{ genres: Genre[] }> => {
  return apiRequest<{ genres: Genre[] }>('/genre/tv/list');
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<TMDbResponse<Movie>> => {
  return apiRequest<TMDbResponse<Movie>>(`/discover/movie?with_genres=${genreId}&page=${page}`);
};

// Multi search (search across movies, TV shows, and people)
export const multiSearch = async (query: string, page: number = 1): Promise<TMDbResponse<Movie | TVShow | Person>> => {
  return apiRequest<TMDbResponse<Movie | TVShow | Person>>(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
};

// Season and Episode interfaces
export interface Episode {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  episode_number: number;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: Array<{
    id: number;
    credit_id: string;
    name: string;
    department: string;
    job: string;
    profile_path: string | null;
  }>;
  guest_stars: Array<{
    id: number;
    name: string;
    credit_id: string;
    character: string;
    order: number;
    profile_path: string | null;
  }>;
}

export interface Season {
  id: number;
  air_date: string;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
  episodes: Episode[];
}

// Season and Episode API functions
export const getTVShowSeason = async (tvId: number, seasonNumber: number): Promise<Season> => {
  return apiRequest<Season>(`/tv/${tvId}/season/${seasonNumber}`);
};

export const getTVShowEpisode = async (tvId: number, seasonNumber: number, episodeNumber: number): Promise<Episode> => {
  return apiRequest<Episode>(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
};

// Play Link API
export interface PlayLinkResponse {
  success: boolean;
  data: {
    imdb_id: string;
    movieId: number;
    play_link: string | null;
  };
  message?: string;
  error?: string;
}

const PLAY_API_BASE_URL = 'http://172.233.155.175:5000/api/filmy';

export const getPlayLink = async (
  movieId: number, 
  season?: number, 
  episode?: number
): Promise<PlayLinkResponse> => {
  let url = `${PLAY_API_BASE_URL}/imdb/${movieId}`;
  const params = new URLSearchParams();
  
  if (season !== undefined) {
    params.append('season', season.toString());
  }
  if (episode !== undefined) {
    params.append('episode', episode.toString());
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch play link: ${response.statusText}`);
  }
  
  return response.json();
};

// Enhanced play link function with fallback
export interface EnhancedPlayLinkResponse {
  success: boolean;
  data: {
    imdb_id: string;
    movieId: number;
    play_link: string | null;
    source: 'api' | 'extracted';
  };
  message?: string;
  error?: string;
}

export const getPlayLinkWithFallback = async (
  movieId: number,
  season?: number,
  episode?: number
): Promise<EnhancedPlayLinkResponse> => {
  try {
    // First try to get play link from API
    const apiResponse = await getPlayLink(movieId, season, episode);
    
    if (apiResponse.success && apiResponse.data.play_link) {
      // Check if the play_link is actually accessible
      try {
        const response = await fetch(apiResponse.data.play_link, { 
          method: 'HEAD',
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (response.ok) {
          // play_link is accessible, return it
          return {
            ...apiResponse,
            data: {
              ...apiResponse.data,
              source: 'api'
            }
          };
        } else {
          console.log(`play_link returned ${response.status}, proceeding to extraction`);
          // fall through to extraction
        }
      } catch (error) {
        console.log('play_link check failed, proceeding to extraction:', error);
        // fall through to extraction
      }
    }
    
    // If no play_link or play_link is not accessible, try to extract using background scraper
    if (apiResponse.success && apiResponse.data.imdb_id) {
      const extractedLink = await extractM3u8Link(
        apiResponse.data.imdb_id,
        movieId.toString(),
        season?.toString(),
        episode?.toString()
      );
      
      if (extractedLink) {
        return {
          success: true,
          data: {
            imdb_id: apiResponse.data.imdb_id,
            movieId: movieId,
            play_link: extractedLink,
            source: 'extracted'
          }
        };
      }
    }
    
    // Return original response if extraction failed
    return {
      ...apiResponse,
      data: {
        ...apiResponse.data,
        source: 'api'
      }
    };
    
  } catch (error) {
    console.error('Error in getPlayLinkWithFallback:', error);
    throw error;
  }
};
export async function updateVidsrcLinkBackground(
  movieId: string,
  playLink: string,
  season?: string,
  episode?: string,
  imdbId?: string
): Promise<void> {
  try {
    // Don't update if we don't have the required fields
    if (!imdbId || !playLink) {
      console.log('Skipping update - missing imdb_id or play_link');
      return;
    }

    const body: any = {
      imdb_id: imdbId,
      play_link: playLink
    };
    
    // Only add season and episode if they exist
    if (season) {
      body.season = season;
    }
    if (episode) {
      body.episode = episode;
    }

    console.log('Updating vidsrc link:', body);
    
    const response = await fetch(`${PLAY_API_BASE_URL}/imdb/${movieId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error('Failed to update vidsrc link:', response.status, response.statusText);
    } else {
      console.log('Successfully updated vidsrc link');
    }
  } catch (error) {
    console.error("Failed to update vidsrc link:", error);
  }
}