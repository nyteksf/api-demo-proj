const movie_id = localStorage.getItem("movie_id");
const videoUnderlay = document.querySelector(".video-underlay");
const xmarkCloseTrailer = document.querySelector(".xmark--close-trailer");
const watchMovie = document.querySelector(".xmark--close-trailer");
const youtubeVideoLink = document.querySelector(".youtubeVideoLink");
const youtubeVidWrapper = document.querySelector(".youTubeVideo--wrapper");
const videoLoadingState = document.querySelector(".video__loading-state");
const watchMovieCast = document.querySelector(".cast-info--wrapper");
const streamingPlayer = document.querySelector(".streaming-player");
const playButton = document.querySelector(".btn__play-movie");
let imdbId = "";
const tmdbApiKey = "f2da3975fcda82487cc3a97fcbce2479";

function getMovieData(movieId) {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmRhMzk3NWZjZGE4MjQ4N2NjM2E5N2ZjYmNlMjQ3OSIsIm5iZiI6MTcyMjU1NjA2Ny43Nzk0NTEsInN1YiI6IjY2YWIzZGQ0YTJlMTRiYWMxNDVhMDUwMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.TUKSEzd1vTgUVk25RJqZdTbg7spv97zQ6ERRhzbqCrk",
        },
    };

    return fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`,
        options
    )
        .then((response) => response.json())
        .then((data) => {
            renderWebpage(data);
            imdbId = data.imdb_id;
            //console.log("IMDb ID:", imdbId);
            const imdbPageLink = document.querySelector(".imdb-page-link");
            imdbPageLink.setAttribute(
                "href",
                `https://www.imdb.com/title/${imdbId}`
            );
            return imdbId;
        })
        .catch((err) => console.error(err));
}

function searchYts(imdbId) {
    fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${imdbId}`)
        .then((response) => response.json())
        .then((results) => {
            results = results.data;
            console.log("YTS Data:", results);
            if (results.movie_count >= 1) {
                // SEARCH FOR TORRENT DATA
                const torrentHash = results.movies[0].torrents[0].hash;

                // FORM OUR MAGNET LINK
                let magnetLink = formMagnetLink(torrentHash);
                console.log(magnetLink)
                const videoPlayer = document.querySelector(
                    ".streamingVideoPlayer"
                );
                localStorage.setItem("magnetLink", magnetLink);

                // SET PLAY BUTTON TO OPEN TORRENT DYNAMICALLY
                playButton.setAttribute("onclick",`showMovie(event); window.webtor = window.webtor || []; window.webtor.push({ id: 'streaming-player', magnet: '${magnetLink}&tr=udp://explodie.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.empire-js.us:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.opentrackr.org:1337', height: '100%', width:  '100%', lang: 'en',});`)
            } else {
                console.log("NO TORRENT FOUND ON YTS")
                // NO TORRENT ON YTS, SO FETCH FROM ANOTHER API
                // AND AFTER ALL IMDB QUERIES, TRY SEARCH BY WORDS: YTS has shown
            }
            // Handle the data from YTS API

            // SET MOVIE RATINGsettimeout
            getReleaseRating();
        })
        .catch((err) => console.error(err));
}

function formMagnetLink(torrentHash) {
    let magnetBaseUrl = "magnet:?xt=urn:btih:";

    return `magnet:?xt=urn:btih:${torrentHash}`
}

// EXAMPLE USING MOVIE_ID 615: PASSION OF THE CHRIST
// NOTE: OBTAIN MOVIE_ID onclick: STORED IN localStorage.setItem("movie_id", movieId);
getMovieData(movie_id).then((imdbId) => {
    if (imdbId) {
        searchYts(imdbId);
    }
});

function getReleaseRating() {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmRhMzk3NWZjZGE4MjQ4N2NjM2E5N2ZjYmNlMjQ3OSIsIm5iZiI6MTcyMjU1NjA2Ny43Nzk0NTEsInN1YiI6IjY2YWIzZGQ0YTJlMTRiYWMxNDVhMDUwMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.TUKSEzd1vTgUVk25RJqZdTbg7spv97zQ6ERRhzbqCrk",
        },
    };

    const response = fetch(
        `https://api.themoviedb.org/3/movie/${movie_id}/release_dates?api_key=${tmdbApiKey}`
    )
        .then((response) => response.json())
        .then((data) => {
            return data.results.filter(
                (release) => release.iso_3166_1 === "US"
            );
        })
        .then((releaseUsa) => {
            const allUsaReleases = releaseUsa[0].release_dates;
            const ratedRelease = allUsaReleases.filter(
                (release) => release.certification !== ""
            );
            const movieRating =
                ratedRelease[0].certification !== ""
                    ? ratedRelease[0].certification
                    : "?";
            //console.log(movieRating)
            renderReleaseRating(movieRating);
        })
        .catch((err) => console.error(err));
}

function goBack() {
    window.location.href = localStorage.getItem("lastPage");
}

function renderReleaseRating(rating) {
    const movieReleaseRating = document.querySelector(".movie-release-rating");

    setTimeout(() => {
        movieReleaseRating.innerHTML = rating;
    });
}

// CONVERT RATINGS TO STARS
function convertRatingToStars(ratingOutOf10) {
    let starCount = 0;
    let ratingOutOf5 = ratingOutOf10 / 2;
    ratingOutOf5 = Math.round(ratingOutOf5 * 2) / 2;
    let ratingInStars = "";

    for (let i = 0; i < Math.floor(ratingOutOf5); i++) {
        // ADD SOLID STAR
        ratingInStars += '<i class="fa-solid fa-star"></i>';
        starCount++;
    }

    if (ratingOutOf5 % 1 !== 0) {
        // ADD HALF STAR
        ratingInStars += '<i class="fa-solid fa-star-half-stroke"></i>';
        starCount++;
    }

    if (starCount < 5) {
        for (let x = 0; x < 5 - starCount; x++) {
            // PAD RATING WITH HOLLOW STAR
            ratingInStars += '<i class="fa-regular fa-star"></i>';
        }
    }

    return ratingInStars;
}

function renderWebpage(data) {
    const baseImgUrl = "https://image.tmdb.org/t/p/";
    const standardBackdropWidth = "w1280";
    const standardPosterWidth = "w342";

    renderPageBg(standardBackdropWidth, data.backdrop_path);
    renderMoviePoster(`${baseImgUrl}${standardPosterWidth}${data.poster_path}`);
    renderMovieTitle(data.title);
    renderMovieSpecs(data);
    renderMovieDescription(data.overview);
}

function renderMovieSpecs(data) {
    const movieSpecContainer = document.querySelector(
        ".watch-movie__data--info"
    );

    movieSpecContainer.innerHTML = `
                        <ul class="movie-info__list">
                            <li class="movie-info__list-item">${renderReleaseYear(
                                data.release_date
                            )}</li>
                            <li class="movie-info__list-item">${renderRunTime(
                                data.runtime
                            )}</li>
                            <li class="movie-info__list-item">${renderGenres(
                                data.genres
                            )}</li>
                            <li class="movie-info__list-item movie-release-rating"></li> 
                            <li class="movie-info__list-item" title="Show cast">
                                <a href="" class="link__show-movie-cast" onclick="displayCast(event)"></a>
                                <i class="fa-solid fa-users" onclick="renderMovieCast()"></i>
                            </li>
                            <li class="movie-info__list-item imdb-list-item">
                                <a href="https://www.imdb.com/title/" class="imdb-page-link" target="_blank">
                                    <img src="./assets/imdb_icon.png" class="imdb_icon" title="Open IMDB Page">
                                </a>
                            </li>
                            <li class="movie-info__list-item">${convertRatingToStars(
                                data.vote_average
                            )}</li>
                        </ul>
                        `;
    let iframeVid = document.querySelector("iframe");

    iframeVid.onload = function () {
        videoLoadingState.classList.remove("show_trailer");
    };
}

function renderMovieCast() {
    watchMovieCast.classList += " display-cast";
    let crewList = [
        `<i class="fa-solid fa-xmark cast-info--xmark-close" onclick="hideCastInfo()"></i>`,
    ];

    fetch(
        `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${tmdbApiKey}&language=en-US`
    )
        .then((response) => response.json())
        .then((data) => {
            crewList += data.cast
                .map(
                    (castMember) =>
                        `<span class="cast--name">${castMember.name}</span>: <span class="cast--character">${castMember.character}</span>`
                )
                .join(" - ");
            watchMovieCast.innerHTML = crewList;
        })
        .catch((error) => {
            console.error("Error fetching cast data:", error);
        });
}

function hideCastInfo() {
    watchMovieCast.innerHTML = "";
    watchMovieCast.classList.remove("display-cast");
}

function renderGenres(genreArr) {
    let genreList = [];
    genreList = genreArr
        .map((genre) => {
            return genre.name;
        })
        .join(" / ");

    if (genreList.length > 25) {
        genreList = genreList.slice(0, 23) + " ...";
    }

    return genreList;
}

function renderRunTime(runTime) {
    return runTime + " min";
}

function renderReleaseYear(fullDate) {
    return fullDate.split("-")[0];
}

function renderPageBg(backdropWidth, backdropPath) {
    let moviePageBg = document.querySelector(".watch-movie-page--bg");

    // SET & STYLE WATCH MOVIE PAGE BG
    moviePageBg.style.background = `url('https://image.tmdb.org/t/p/${backdropWidth}${backdropPath}) no-repeat center center/cover`;
    moviePageBg.style.filter = "blur(12px)";
}

function renderMoviePoster(url) {
    // SET & STYLE CURRENT MOVIE POSTER
    const moviePosterWrapper = document.querySelector(
        ".watch-movie__poster--wrapper"
    );

    moviePosterWrapper.innerHTML = `<img src="${url}" class="movie__poster" />`;
}

function renderMovieTitle(title) {
    const movieTitle = document.querySelector(".watch-movie__data-title");

    movieTitle.innerHTML = `<h1 class="watch-movie__title">${title}</h1>`;
}

function renderMovieDescription(para) {
    const movieDescPara = document.querySelector(
        ".watch-movie__data--para-wrapper"
    );

    movieDescPara.innerHTML = `<p class="watch-movie__data--para">${para}</p>`;
}

function blockTrailerBtn(e) {
    e.preventDefault();
}

function showMovie(e) {
    e.preventDefault();

    videoUnderlay.classList += " show_trailer";
    watchMovie.classList += " xmark-make-seen";
    youtubeVidWrapper.classList += " show_trailer";
    videoLoadingState.classList += " show_trailer";

    setTimeout(() => {
        videoLoadingState.classList.remove("show_trailer");
    }, 1500)
}

function showTrailer() {
    youtubeVideoLink.classList += " show_trailer";
    videoUnderlay.classList += " show_trailer";
    xmarkCloseTrailer.classList += " xmark--close-trailer--show";
    watchMovie.classList += " xmark-make-seen";
    youtubeVidWrapper.classList += " show_trailer";
    videoLoadingState.classList += " show_trailer";
}

function hideTrailer() {
    youtubeVideoLink.classList.remove("show_trailer");
    videoUnderlay.classList.remove("show_trailer");
    xmarkCloseTrailer.classList.remove("xmark--close-trailer--show");
    watchMovie.classList.remove("xmark-make-seen");
    youtubeVidWrapper.classList.remove("show_trailer");

    // DELETE OLD PLAYER ON CLOSE (INSTEAD OF TRACKING OPEN/CLOSE STATE)
    document.querySelector("#streaming-player").innerHTML = "";

    // STOP/CLEAR YOUTUBE TRAILER
    youtubeVideoLink.setAttribute("src", "#");
}

function fetchTrailer() {
    fetch(
        `https://api.themoviedb.org/3/movie/${movie_id}/videos?api_key=${tmdbApiKey}`
    )
        .then((response) => response.json())
        .then((data) => {
            const trailer = data.results.find(
                (video) => video.type === "Trailer" && video.site === "YouTube"
            );
            const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}`;

            youtubeVideoLink.setAttribute("src", youtubeUrl);
            //trailerVideoLink.setAttribute("src", youtubeUrl);
        })
        .catch((error) => console.error("Error:", error));
}

fetchTrailer();
