import React from "react";
import { createHashRouter } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/movie-detail";
import MoviesPage from "./pages/movies";
import TVShowDetail from "./pages/tv-detail";
import TVShowsPage from "./pages/tv-shows";
import SeasonDetail from "./pages/season-detail";
import PeoplePage from "./pages/people";
import SearchResults from "./pages/search";

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
    path: "/search",
    element: <SearchResults />,
  },
]);