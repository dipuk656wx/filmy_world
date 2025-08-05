import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails, getTVShowDetails, getTVShowSeason, MovieDetails, TVShowDetails } from '../../services/tmdbApi';
import VideoPlayer from '../../components/video-player';

const PlayerPage: React.FC = () => {
  const { type, id, season, episode } = useParams<{
    type: 'movie' | 'tv';
    id: string;
    season?: string;
    episode?: string;
  }>();

  const movieId = parseInt(id || '0');
  const seasonNumber = season ? parseInt(season) : undefined;
  const episodeNumber = episode ? parseInt(episode) : undefined;

  // Fetch movie details
  const { data: movieDetails } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: type === 'movie' && !!movieId,
  });

  // Fetch TV show details
  const { data: tvDetails } = useQuery({
    queryKey: ['tv', movieId],
    queryFn: () => getTVShowDetails(movieId),
    enabled: type === 'tv' && !!movieId,
  });

  // Fetch season data if it's a TV show (for episode navigation)
  const { data: seasonData } = useQuery({
    queryKey: ['tv-season', movieId, seasonNumber],
    queryFn: () => getTVShowSeason(movieId, seasonNumber!),
    enabled: type === 'tv' && !!movieId && !!seasonNumber,
  });

  if (!movieId || !type) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Invalid content ID</div>
      </div>
    );
  }

  const title = type === 'movie' 
    ? movieDetails?.title 
    : tvDetails?.name;

  return (
    <VideoPlayer
      movieId={movieId}
      season={seasonNumber}
      episode={episodeNumber}
      title={title || 'Loading...'}
      type={type}
      tvSeasonData={seasonData}
    />
  );
};

export default PlayerPage;
