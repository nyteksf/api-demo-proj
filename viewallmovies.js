// const pageType =   //document.querySelector(".page-type");
let pageNum = 1;
const nav = document.querySelector("nav");
let searchIsOpen = false;
const tmdbApiKey = "f2da3975fcda82487cc3a97fcbce2479";
let searchExecuted = false;
let queryValue = "";
let totalResultsPages = "";
const dropdownGenre = document.querySelector(".dropdown--genre");
let genreOption = "";
let genreSelected = false;

// SET DATA BREADCRUMB
localStorage.setItem("lastPage", window.location.href);

document.addEventListener("DOMContentLoaded", function () {
    (function checkForPageType() {
        const dropdown = document.querySelector(".dropdown");
        const url = new URL(window.location.href);
        let queryString = url.search.substring(1); // SANITIZE LEADING '?' FROM URL
        const pageType = queryString;

        searchAll = pageType === "all" ? true : false;

        // ATTEMPT TO EXTRACT VALUE OF "QUERY" URL PARAM
        const searchParam = new URLSearchParams(url.search);
        queryValue = searchParam.get("query");

        console.log("queryValue " + queryValue);
        if (queryValue) {
            searchExecuted = true;
            dropdownGenre.classList.remove("view-dropdown--genre");
            searchByQueryValue(queryValue);
        } else if (pageType !== "null") {
            // SET RESPECTIVE SELECTED OPTION IN DROPDOWN
            dropdown.value = pageType;
            if (pageType === "all") {
                // MAKE GENRE SELECT VISIBLE
                dropdownGenre.classList += " view-dropdown--genre";
            }

            pullMovieList(pageType, 1, searchAll);
        }
    })();
});

function filterResultsByGenre(e) {
    genreOption = e.target.value;
    const dropdownValue = document.querySelector(".dropdown").value;
    let searchByAll = dropdownValue === "all" ? true : false;
    genreSelected = true;
    filterResults(null, dropdownValue, searchByAll, genreOption);
}

function filterResults(e, categoryOption, searchByAll, genreOption) {
    let searchAll = "";
    let filterType = "";

    console.log(categoryOption, genreOption);

    // ARE WE FILTERING BY GENRE OR GENERAL CATEGORY?
    if (genreOption) {
        console.log(genreOption);
        pullMovieList(categoryOption, pageNum, searchByAll, genreOption);
    } else {
        pageNum = 1;
        clearGenreOptions();
        const option = e.target.value;

        if (option === "latest") {
            filterType = "Latest";
        } else if (option === "all") {
            filterType = "All";
            searchAll = true;
        } else if (option === "popular") {
            filterType = "Most Popular";
        } else if (option === "rated") {
            filterType = "Highest Rated";
        } else {
            filterType = "View";
        }

        changeUrl(option);

        // MAKE GENRE SELECT VISIBLE ONLY WHEN "ALL"/"DISCOVER" CATEGORY CHOSEN
        searchAll
            ? (dropdownGenre.classList += " view-dropdown--genre")
            : dropdownGenre.classList.remove("view-dropdown--genre");

        document.querySelector(".page-type").innerHTML = filterType;
        pullMovieList(filterType, pageNum, searchAll);
    }
}

function changeUrl(newCategory) {
    const currentURL = window.location.href;
            const baseURL = currentURL.split('?')[0]; // Get the URL before the query parameters
            const newURL = `${baseURL}?${newCategory}`; // Create the new URL with the new category
            history.pushState({}, '', newURL);
}

/* RENDER MOVIE CONTENT */
function pullMovieList(filterType, pageNum, optAll, genreOption) {
    searchExecuted = false;
    console.log("-=-=-=-=-");
    console.log(filterType);
    console.log(pageNum);
    console.log(optAll);
    console.log("-=-=-=-=-");

    searchCategory = optAll ? "discover" : "movie";

    // ALWAYS START AT PAGE 1 ON NEW DROPDOWN OPTION SELECT
    if (!pageNum) {
        pageNum = "1";
    }

    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmRhMzk3NWZjZGE4MjQ4N2NjM2E5N2ZjYmNlMjQ3OSIsIm5iZiI6MTcyMjU1NjA2Ny43Nzk0NTEsInN1YiI6IjY2YWIzZGQ0YTJlMTRiYWMxNDVhMDUwMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.TUKSEzd1vTgUVk25RJqZdTbg7spv97zQ6ERRhzbqCrk",
        },
    };

    // ARE WE FILTERING BY GENRE OR GENERAL CATEGORY?
    if (genreOption) {
        console.log(
            `https://api.themoviedb.org/3/${searchCategory}/${searchType}?with_genres=${genreOption}&language=en-US&page=${pageNum}`
        );

        fetch(
            `https://api.themoviedb.org/3/${searchCategory}/${searchType}?with_genres=${genreOption}&language=en-US&page=${pageNum}`,
            options
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                renderMovies(data.results, filterType);
            });
    } else {
        if (
            filterType === "Highest Rated" ||
            filterType === "top_rated" ||
            filterType === "rated"
        ) {
            searchType = "top_rated";
        } else if (filterType === "Most Popular" || filterType === "popular") {
            searchType = "popular";
        } else if (
            filterType === "Latest" ||
            filterType === "now_playing" ||
            filterType === "latest"
        ) {
            searchType = "now_playing";
        } else {
            searchType = "movie";
        }

        console.log(
            `https://api.themoviedb.org/3/${searchCategory}/${searchType}?language=en-US&page=${pageNum}`
        );

        fetch(
            `https://api.themoviedb.org/3/${searchCategory}/${searchType}?language=en-US&page=${pageNum}`,
            options
        )
            .then((response) => response.json())
            .then((data) => {
                renderMovies(data.results, filterType);
            });
    }
}

function renderMovies(data) {
    let moviesContainer = "";
    let pathToPoster = "";
    let movieArr = data
        .map((movie) => {
            // SET FALLBACK IMG FOR WHEN NO POSTER AVAILABLE
            if (movie.poster_path === null) {
                pathToPoster = "./assets/image-unavailable.jpg"
            } else {
                pathToPoster = `https://image.tmdb.org/t/p/w342/${movie.poster_path}`;
            }

            return `
                    <div class="movie-wrapper">
                            <div class="movie">
                                <img
                                    class="movie__img"
                                    src="${pathToPoster}"
                                />
                                <div class="movie--wrapper-bg"></div>
                                <div class="movie__description">
                                    <div class="movie__rating--wrapper">
                                        <div class="movie__rating--stars">
                                            ${convertRatingToStars(
                                                movie.vote_average
                                            )}
                                        </div>
                                        <p class="movie__rating--score">
                                            ${convertAndRoundRating(
                                                movie.vote_average
                                            )}
                                        </p>
                                    </div>
                                    <div class="movie__play-btn--wrapper">
                                        <a class="movie-link" href="./watchmoviepage.html" movie-id="${
                                            movie.id
                                        }" onclick="setMovieCode(this)">
                                            <div class="movie__play-btn">
                                                <i class="fa-solid fa-play"></i>
                                            </div>
                                        </a>
                                    </div>
                                    <div class="movie__title-and-date">
                                        <h5 class="movie-title">
                                            ${movie.title}
                                        </h5>
                                        <p class="movie__release-date">${prettyPrintDate(
                                            movie.release_date
                                        )}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
        })
        .join("");

    moviesContainer = document.querySelector(".movies-container");
    moviesContainer.innerHTML = movieArr;
}

// HANDLE RATINGS: CONVERT 1/10 TO 1/5 SCALE, THEN ROUND TO NEAREST .5
function convertAndRoundRating(ratingOutOf10) {
    // CONVERT FROM RATING OUT OF 10 TO OUT OF 5
    let ratingOutOf5 = ratingOutOf10 / 2;

    // ROUND RATING TO NEAREST HALF
    ratingOutOf5 = Math.round(ratingOutOf5 * 2) / 2;

    return ratingOutOf5 + "/5";
}

function prettyPrintDate(date) {
    const splitDate = date.split("-");
    let sortedDate = "";

    switch (splitDate[1]) {
        case "01":
            splitDate[1] = "Jan.";
            break;
        case "02":
            splitDate[1] = "Feb.";
            break;
        case "03":
            splitDate[1] = "Mar.";
            break;
        case "04":
            splitDate[1] = "Apr.";
            break;
        case "05":
            splitDate[1] = "May";
            break;
        case "06":
            splitDate[1] = "June";
            break;
        case "07":
            splitDate[1] = "July";
            break;
        case "08":
            splitDate[1] = "Aug.";
            break;
        case "09":
            splitDate[1] = "Sept.";
            break;
        case "10":
            splitDate[1] = "Oct.";
            break;
        case "11":
            splitDate[1] = "Nov.";
            break;
        case "12":
            splitDate[1] = "Dec.";
            break;
    }

    sortedDate += splitDate[1] + " ";
    sortedDate += splitDate[2] + ", ";
    sortedDate += splitDate[0];

    return sortedDate;
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
            // PAD RATING WITH HOLLOW STAR(S)
            ratingInStars += '<i class="fa-regular fa-star"></i>';
        }
    }

    return ratingInStars;
}

function navPrev(e) {
    e.preventDefault();
    pageNum--;

    if (pageNum <= 0) {
        return;
    }
    checkFilterCategory();
}

function navNext(e) {
    e.preventDefault();
    pageNum++;
    checkFilterCategory();
}

function clearGenreOptions() {
    const selectElement = document.querySelector(".dropdown--genre");
    const options = selectElement.options;
    genreSelected = false;

    for (let i = 0; i < options.length; i++) {
        options[i].selected = false;
    }
    options.selectedIndex = 0;
}

function checkFilterCategory(filterAll) {
    let filterCategory = document.querySelector(".dropdown").value;

    // PAGENUM COUNTER CANNOT GO NEGATIVE
    if (pageNum <= 0) {
        pageNum = 1;
        return;
    }

    // EITHER EXECUTING SEARCH OR FILTER BY CATEGORY/GENRE
    if (searchExecuted && pageNum <= totalResultsPages) {
        console.log("pageNum " + pageNum)
        console.log("totalResultsPages " + totalResultsPages)
        
        clearGenreOptions();
        searchByQueryValue(queryValue, pageNum);
    } 
    else if (searchExecuted && pageNum >= totalResultsPages) {
        // TOTAL SEARCH PAGE RESULT COUNT MET/EXCEEDED
        return;
    } else {
        if (!filterAll) {
            filterAll = false;
        }
        if (filterCategory === "rated") {
            searchType = "top_rated";
        } else if (filterCategory === "popular") {
            searchType = "popular";
        } else if (filterCategory === "latest") {
            searchType = "now_playing";
        } else {
            searchType = "movie";
            filterAll = true;
            if (genreSelected) {
                console.log("GENRESELECTED");
                filterResults(null, filterCategory, true, genreOption);
                return;
            }
        }

        // RENDER NEXT PAGE
        pullMovieList(searchType, pageNum, filterAll);
    }
}

function setMovieCode(t) {
    const movieCode = t.getAttribute("movie-id");
    localStorage.setItem("movie_id", movieCode);
}

function searchByQueryValue(queryValue, pageNumber) {
    console.log("queryValue " + queryValue);
    console.log("pageNumber " + pageNumber);
    if (!pageNumber) {
        pageNumber = 1;
    }

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${queryValue}&page=${pageNumber}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            document.querySelector(".page-type").innerHTML = "Search";
            totalResultsPages = data.total_pages;
            renderMovies(data.results);
        })
        .catch((error) => console.error("Error:", error));
}

// EXPAND/DARKEN BACKGROUND OF NAV ON SCROLL DOWN
// UNDO ACTION ON RETURN TO `TOP: 0;`
let hasScrolledDown = false;
function handleScroll() {
    // AVOID ADDING MULTIPLE CLASSES TO .nav__logo
    if (hasScrolledDown === false) {
        if (window.scrollY > 0) {
            nav.classList.add("nav--scroll");
            document.querySelector(".fa-magnifying-glass").classList.remove("magnifying-glass--dark");
            document.querySelector(".nav__logo").classList +=
                " nav__logo--light";
            hasScrolledDown = true;
        }
    }
    if (window.scrollY <= 0) {
        nav.classList.remove("nav--scroll");
        document.querySelector(".fa-magnifying-glass").classList += " magnifying-glass--dark";
        document
            .querySelector(".nav__logo")
            .classList.remove("nav__logo--light");
        hasScrolledDown = false;
    }
}
window.addEventListener("scroll", handleScroll);

function toggleNavSearch() {
    searchIsOpen = !searchIsOpen;

    if (searchIsOpen) {
        document.body.classList += " nav__search--open";
        document.querySelector(".fa-magnifying-glass").classList +=
            " vanish-magnifying-glass";

        document.querySelector(".xmark--close-nav-search").classList +=
            " nav__search--show-xmark";
    } else {
        document.body.classList.remove("nav__search--open");
        document
            .querySelector(".fa-magnifying-glass")
            .classList.remove("vanish-magnifying-glass");

        document
            .querySelector(".xmark--close-nav-search")
            .classList.remove("nav__search--show-xmark");
    }
}

/*
setTimeout(() => {
    const url = new URL(window.location.href);

    // RETRIEVE PARAM FROM URL
    const params = new URLSearchParams(url.search);

    // EXTRACT VALUE FROM URL PARAM
    const queryString = url.search.substring(1); // REMOVE LEADING '?'
}); 
*/
