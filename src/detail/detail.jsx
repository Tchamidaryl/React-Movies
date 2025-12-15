import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import "./detail.css";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    },
};

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [credits, setCredits] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Scroll to top when component mounts or id changes
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setIsLoading(true);
                setError("");

                // Fetch movie details
                const movieResponse = await fetch(
                    `${API_BASE_URL}/movie/${id}`,
                    API_OPTIONS
                );

                if (!movieResponse.ok) {
                    throw new Error("Failed to fetch movie details");
                }

                const movieData = await movieResponse.json();
                setMovie(movieData);

                // Fetch credits (cast)
                const creditsResponse = await fetch(
                    `${API_BASE_URL}/movie/${id}/credits`,
                    API_OPTIONS
                );

                if (creditsResponse.ok) {
                    const creditsData = await creditsResponse.json();
                    setCredits(creditsData);
                }
            } catch (err) {
                console.error("Error fetching movie details:", err);
                setError("Failed to load movie details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (isLoading) {
        return (
            <main className="detail-page">
                <Spinner />
            </main>
        );
    }

    if (error || !movie) {
        return (
            <main className="detail-page">
                <div className="detail-container">
                    <Link to="/" className="back-button">
                        ← Back to Movies
                    </Link>
                    <p className="text-red-500 my-5">
                        {error || "Movie not found"}
                    </p>
                </div>
            </main>
        );
    }

    const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    const backdropUrl = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
    const releaseYear = movie.release_date?.split("-")[0] || "N/A";

    return (
        <main className="detail-page">
            <div className="pattern" />

            <div className="detail-container">
                <Link to="/" className="back-button">
                    ← Back to Movies
                </Link>

                <div className="detail-header">
                    <div
                        className="backdrop"
                        style={{
                            backgroundImage: `url(${backdropUrl})`,
                        }}
                    >
                        <div className="backdrop-overlay" />
                    </div>
                </div>

                <div className="detail-content">
                    <div className="detail-poster">
                        <img
                            src={
                                movie.poster_path ? posterUrl : "./no-movie.png"
                            }
                            alt={ movie.title }
                            loading="lazy"
                        />
                    </div>

                    <div className="detail-info">
                        <h1>{movie.title}</h1>

                        <div className="detail-meta">
                            <div className="rating">
                                <img src=".././star.svg" alt="Star Icon" loading="lazy" />
                                <p>
                                    {movie.vote_average?.toFixed(1) || "N/A"}/10
                                </p>
                            </div>
                            <span>•</span>
                            <p>{releaseYear}</p>
                            <span>•</span>
                            <p>{movie.original_language?.toUpperCase()}</p>
                            {movie.runtime && (
                                <>
                                    <span>•</span>
                                    <p>{movie.runtime} min</p>
                                </>
                            )}
                        </div>

                        {movie.genres && movie.genres.length > 0 && (
                            <div className="genres">
                                {movie.genres.map((genre) => (
                                    <span key={genre.id} className="genre-tag">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {movie.overview && (
                            <div className="overview">
                                <h2>Overview</h2>
                                <p>{movie.overview}</p>
                            </div>
                        )}

                        {movie.tagline && (
                            <div className="tagline">
                                <p>"{movie.tagline}"</p>
                            </div>
                        )}

                        <div className="detail-stats">
                            {movie.budget > 0 && (
                                <div className="stat">
                                    <h3>Budget</h3>
                                    <p>
                                        ${(movie.budget / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                            )}
                            {movie.revenue > 0 && (
                                <div className="stat">
                                    <h3>Revenue</h3>
                                    <p>
                                        ${(movie.revenue / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                            )}
                            <div className="stat">
                                <h3>Vote Count</h3>
                                <p>{movie.vote_count}</p>
                            </div>
                            <div className="stat">
                                <h3>Popularity</h3>
                                <p>{movie.popularity?.toFixed(1)}</p>
                            </div>
                        </div>

                        {movie.production_companies &&
                            movie.production_companies.length > 0 && (
                                <div className="production">
                                    <h3>Production Companies</h3>
                                    <div className="companies-list">
                                        {movie.production_companies.map(
                                            (company) => (
                                                <p key={company.id}>
                                                    {company.name}
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                {credits && credits.cast && credits.cast.length > 0 && (
                    <div className="cast-section">
                        <h2>Cast</h2>
                        <div className="cast-list">
                            {credits.cast.slice(0, 12).map((actor) => (
                                <div key={actor.id} className="cast-member">
                                        <img
                                            src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : ".././no-movie.png"}
                                            alt={ actor.name }
                                            loading="lazy"
                                        />
                                    <div className="cast-info">
                                        <p className="actor-name">
                                            {actor.name}
                                        </p>
                                        <p className="character-name">
                                            as {actor.character}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MovieDetail;
