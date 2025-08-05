# MovieDB - TMDb Clone

A simple movie database application built with React, TypeScript, and Electron, using The Movie Database (TMDb) API.

## Features

- 🎬 Browse popular, top-rated, upcoming, and now-playing movies
- 📺 Discover trending TV shows
- 🔍 Search movies, TV shows, and people
- 📱 Responsive design
- ⚡ Fast and smooth user experience
- 🖥️ Desktop application with Electron

## Screenshots

The application includes:
- Hero section with trending movies
- Movie/TV show cards with ratings and descriptions
- Detailed movie pages with full information
- Search functionality across all content types
- Clean, modern UI similar to TMDb

## Setup Instructions

### 1. Get TMDb API Key

1. Go to [The Movie Database](https://www.themoviedb.org/)
2. Create an account or sign in
3. Go to Settings > API
4. Request an API key (choose "Developer" option)
5. Fill out the form and get your API key

### 2. Configure API Key

1. Copy `.env.example` to `.env`
2. Replace `your_api_key_here` with your actual TMDb API key

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
# Development mode
npm start

# Build for production
npm run build

# Create executable
npm run release
```

## Project Structure

```
renderer/
├── components/          # Reusable UI components
│   ├── header/         # Navigation header
│   ├── movie-card/     # Movie/TV show card component
│   └── search-bar/     # Search input component
├── pages/              # Page components
│   ├── Home/           # Homepage with trending content
│   ├── movie-detail/   # Movie detail page
│   ├── movies/         # Movies listing page
│   └── search/         # Search results page
├── services/           # API services
│   └── tmdbApi.ts      # TMDb API integration
└── store/              # State management
```

## API Integration

The application uses The Movie Database (TMDb) API v3. Key endpoints used:

- `/trending/movie/{time_window}` - Get trending movies
- `/movie/popular` - Get popular movies
- `/movie/top_rated` - Get top-rated movies
- `/movie/upcoming` - Get upcoming movies
- `/movie/now_playing` - Get now-playing movies
- `/movie/{movie_id}` - Get movie details
- `/search/multi` - Multi-search (movies, TV, people)
- `/tv/popular` - Get popular TV shows
- `/tv/top_rated` - Get top-rated TV shows

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Electron** - Desktop application
- **TanStack Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Webpack** - Module bundling

## Development

### Adding New Features

1. **New API Endpoints**: Add to `services/tmdbApi.ts`
2. **New Components**: Create in `components/` directory
3. **New Pages**: Create in `pages/` directory and add to router
4. **Styling**: Use Tailwind CSS classes

### Code Structure

- Use TypeScript interfaces for type safety
- Implement React Query for API calls
- Follow React best practices
- Use functional components with hooks

## Build and Distribution

```bash
# Build for development
npm start

# Build for production
npm run build

# Create distributable app
npm run release
```

The release command creates platform-specific installers in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please respect TMDb's API terms of service.

## Notes

- Images are served from TMDb's CDN
- API responses are cached for better performance
- The app works offline for previously loaded content
- Search supports movies, TV shows, and people
- Responsive design works on all screen sizes
