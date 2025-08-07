import React from "react";
import { createHashRouter } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/movie-detail";
import MoviesPage from "./pages/movies";
import TVShowDetail from "./pages/tv-detail";
import TVShowsPage from "./pages/tv-shows";
import SeasonDetail from "./pages/season-detail";
import PeoplePage from "./pages/people";
import PersonDetail from "./pages/person-detail";
import SearchResults from "./pages/search";
import PlayerPage from "./pages/Player";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/movie/:id",
    element: <MovieDetail />,
  },
  {
    path: "/tv/:id",
    element: <TVShowDetail />,
  },
  {
    path: "/tv/:tvId/season/:seasonNumber",
    element: <SeasonDetail />,
  },
  {
    path: "/movies",
    element: <MoviesPage />,
  },
  {
    path: "/movies/:category",
    element: <MoviesPage />,
  },
  {
    path: "/tv-shows",
    element: <TVShowsPage />,
  },
  {
    path: "/tv-shows/:category",
    element: <TVShowsPage />,
  },
  {
    path: "/people",
    element: <PeoplePage />,
  },
  {
    path: "/person/:id",
    element: <PersonDetail />,
  },
  {
    path: "/search",
    element: <SearchResults />,
  },
  {
    path: "/player/:type/:id",
    element: <PlayerPage />,
  },
  {
    path: "/player/:type/:id/:season/:episode",
    element: <PlayerPage />,
  },
]);