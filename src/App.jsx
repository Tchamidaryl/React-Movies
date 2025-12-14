import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import MovieDetail from "./detail/detail";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    },
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [trendingErrorMessage, setTrendingErrorMessage] = useState("");
    const [isTrendingLoading, setIsTrendingLoading] = useState(false);
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [trendingMovies, setTrendingMovies] = useState([]);

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

    const fetchMovies = async (query = "") => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
                      query
                  )}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error("Failed to fetch movies");
            }

            const data = await response.json();

            if (data.Response === "False") {
                setErrorMessage(data.Error || "Failed to fetch movies");
                setMovieList([]);
                return;
            }

            if (data.results.length === 0) {
                setErrorMessage("No movies found.");
                setMovieList([]);
                return;
            }

            setMovieList(data.results);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage("Failed to fetch movies. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        setIsTrendingLoading(true);
        setTrendingErrorMessage("");
        try {
            const movies = await getTrendingMovies();

            if (movies.length === 0) {
                setTrendingErrorMessage("No trending movies found.");
                return;
            }

            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies:, ${error}`);
            setTrendingErrorMessage(
                "Failed to fetch trending movies. Please try again later."
            );
        } finally {
            setIsTrendingLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <main className="">
                            <div className="pattern" />

                            <div className="wrapper">
                                <header>
                                    <img src="./hero.png" alt="Hero Banner" />
                                    <h1 className="">
                                        Find{" "}
                                        <span className="text-gradient">
                                            Movies
                                        </span>{" "}
                                        You'll Enjoy Without the Hassle
                                    </h1>
                                    <Search
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                    />
                                </header>

                                <section className="trending">
                                    <h2>Trending Movies</h2>

                                    {isTrendingLoading ? (
                                        <Spinner />
                                    ) : trendingErrorMessage ? (
                                        <p className="text-red-500 my-5">
                                            {trendingErrorMessage}
                                        </p>
                                    ) : (
                                        <ul>
                                            {trendingMovies.map(
                                                (movie, index) => (
                                                    <li key={movie.$id}>
                                                        <p>{index + 1}</p>
                                                        <img
                                                            src={
                                                                movie.poster_url
                                                            }
                                                            alt={movie.title}
                                                        />
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                </section>

                                <section className="all-movies">
                                    <h2 className="">All Movies</h2>

                                    {isLoading ? (
                                        <Spinner />
                                    ) : errorMessage ? (
                                        <p className="text-red-500">
                                            {errorMessage}
                                        </p>
                                    ) : (
                                        <ul>
                                            {movieList.map((movie) => (
                                                <MovieCard
                                                    key={movie.id}
                                                    movie={movie}
                                                />
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            </div>
                        </main>
                    }
                />
                <Route path="/movie/:id" element={<MovieDetail />} />
            </Routes>
        </Router>
    );
};

export default App;
