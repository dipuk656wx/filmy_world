import React from 'react';
import { Movie, TVShow, getImageUrl } from '../../services/tmdbApi';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tv';
}

const MovieCard: React.FC<MovieCardProps> = ({ item, type }) => {
  const navigate = useNavigate();
  
  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;
  
  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          className="w-full h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = './placeholder-image.jpg';
          }}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-sm">
          ⭐ {item.vote_average?.toFixed(1)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-2">
          {releaseDate ? new Date(releaseDate).getFullYear() : 'TBA'}
        </p>
        
        <p className="text-gray-700 text-sm line-clamp-3">
          {item.overview || 'No description available.'}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
