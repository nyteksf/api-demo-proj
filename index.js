const tmdbApiKey = "f2da3975fcda82487cc3a97fcbce2479";
let searchIsOpen = false;
const searchTitle = document.getElementsByClassName("search__title");
let isModalOpen   = false;
const nav = document.querySelector("nav");

// SET DATA BREADCRUMB
localStorage.setItem("lastPage", "./index.html");

// ENSURE LOADING STAGE SEEN ON RETURN FROM MOVIE PAGES, ETC
document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", function () {
    const images = [
        "./assets/slider1.jpg",
        "./assets/slider2.jpg",
        "./assets/slider3.jpg",
    ];

    let currentIndex = 0;

    function changeBackground() {
        const landingPage = document.getElementById("landing-page");
        let targetRadioBtn = "";

        // REMOVE ALL ACTIVE STATES FROM FAUX RADIO BTNS
        document
            .querySelectorAll(".radio__btn")
            .forEach((btn) => btn.classList.remove("radio__btn--selected"));

        // RESET LOOP ON 3
        if (currentIndex === 3) {
            currentIndex = 0;
        }
        targetRadioBtn = `.radio__btn--${currentIndex + 1}`;

        document.querySelector(`${targetRadioBtn}`).classList +=
            " radio__btn--selected";
        searchTitle[0].classList.remove("search__title--show");

        // CHANGE SEARCH TITLE AND SELECT CORRESPONDING FAUX RADIO BTN
        switch (currentIndex) {
            case 0:
                searchTitle[0].innerHTML = "START STREAMING NOW";
                break;
            case 1:
                searchTitle[0].innerHTML = "ULTRA HD QUALITY";
                break;
            case 2:
                searchTitle[0].innerHTML = "THE LATEST MOVIES";
                break;
        }
        // REANIMATE SEARCH TITLE ON innerHTML REFRESH
        setTimeout(() => {
            searchTitle[0].classList.add("search__title--show");
        }, 2000);
        landingPage.style.backgroundImage = `url(${images[currentIndex]})`;
        currentIndex += 1;
    }

    // CHANGE LANDING PAGE BACKGROUND EVERY 30 SECS
    setInterval(changeBackground, 30000);

    // INITIAL CALL
    changeBackground();
});

/* FAUX RADIO BUTTON FUNCTIONALITY */
function radioBtnSelected(t) {
    const landingPage = document.getElementById("landing-page");
    const images = [
        "./assets/slider1.jpg",
        "./assets/slider2.jpg",
        "./assets/slider3.jpg",
    ];

    // DESELECT ALL FAUX RADIO BTNS
    document
        .querySelectorAll(".radio__btn")
        .forEach((btn) => btn.classList.remove("radio__btn--selected"));
    t.classList += " radio__btn--selected";

    searchTitle[0].classList.remove("search__title--show");

    setTimeout(() => {
        switch (t.classList[1]) {
            case "radio__btn--1":
                landingPage.style.backgroundImage = `url(${images[0]})`;
                searchTitle[0].innerHTML = "START STREAMING NOW";
                break;
            case "radio__btn--2":
                landingPage.style.backgroundImage = `url(${images[1]})`;
                searchTitle[0].innerHTML = "ULTRA HD RESOLUTION";
                break;
            case "radio__btn--3":
                landingPage.style.backgroundImage = `url(${images[2]})`;
                searchTitle[0].innerHTML = "THE LATEST MOVIES";
                break;
        }
    }, 1000);
    setTimeout(() => {
        searchTitle[0].classList.add("search__title--show");
    }, 1000);
}

/* RENDER MOVIE CONTENT */
(function pullMovieLists() {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmRhMzk3NWZjZGE4MjQ4N2NjM2E5N2ZjYmNlMjQ3OSIsIm5iZiI6MTcyMjU1NjA2Ny43Nzk0NTEsInN1YiI6IjY2YWIzZGQ0YTJlMTRiYWMxNDVhMDUwMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.TUKSEzd1vTgUVk25RJqZdTbg7spv97zQ6ERRhzbqCrk",
        },
    };

    document.body.classList.add("no-scroll");

    fetch(
        "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
        options
    )
        .then((response) => response.json())
        .then((data) => {
            renderMovies(data.results, "latest");

            return fetch(
                "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
                options
            );
        })
        .then((response) => response.json())
        .then((data) => {
            renderMovies(data.results, "popular");

            return fetch(
                "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
                options
            );
        })
        .then((response) => response.json())
        .then((data) => {
            renderMovies(data.results, "rated");

            setTimeout(() => {
                document.querySelector(".loading-overlay").classList +=
                    " hide-loading-overlay";
                document.body.classList.remove("no-scroll");
            }, 1500);

            setTimeout(() => {
                document.querySelector(".search__title").classList +=
                    " search__title--show";
            }, 1800);
        })
        .catch((err) => console.error(err));
})();

function renderMovies(data, section) {
    let moviesContainer = "";
    let remainingMovieArr = [];
    const takeSixMovies = data.slice(0, 6);

    const displayFirstSix = takeSixMovies
        .map((movie) => {
            return `
                    <div class="movie--wrapper">
                            <div class="movie">
                                <img
                                    class="movie__img"
                                    src="https://image.tmdb.org/t/p/w342/${
                                        movie.poster_path
                                    }"
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

    if (section === "latest") {
        moviesContainer = document.querySelector(".movies-container--latest");
    } else if (section === "popular") {
        moviesContainer = document.querySelector(".movies-container--popular");
    } else if (section === "rated") {
        moviesContainer = document.querySelector(".movies-container--rated");
    }
    moviesContainer.innerHTML = displayFirstSix;
}

function setMovieCode(t) {
    const movieCode = t.getAttribute("movie-id");
    localStorage.setItem("movie_id", movieCode);
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

// EXPAND/DARKEN BACKGROUND OF NAV ON SCROLL DOWN
// UNDO ON RETURN TO `TOP: 0;`
function handleScroll() {
    if (window.scrollY > 0) {
        nav.classList.add("nav--scroll");
    } else {
        nav.classList.remove("nav--scroll");
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

// MAKE TO-TOP BTN VISIBLE AT #LATEST VIA SCROLL
window.addEventListener("scroll", () => {
    const button = document.querySelector(".btn--ToTop");
    const latestSection = document.querySelector("#latest");
    const sectionTop = latestSection.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;

    if (sectionTop < viewportHeight * 0.8) {
        // Adjust the threshold as needed
        button.classList += " btn--toTop-opaque";
    } else {
        button.classList.remove("btn--toTop-opaque");
    }
});

function renderDate() {
    const footerSmallText = document.querySelectorAll(".footer__small-text");
    footerSmallText.forEach((dateSlot, index) => {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - index);
        const formattedDate = currentDate.toLocaleDateString("en-us", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
        dateSlot.innerHTML = formattedDate;
    });
}

renderDate();

function setNavDiscover(e) {
    e.preventDefault();
    
    setTimeout(() => {
        window.location.href = "./viewallmovies.html?all";
    }, 250);
}

function setNavPopular(e) {
    e.preventDefault();
    
    setTimeout(() => {
        window.location.href = "./viewallmovies.html?popular";
    }, 250);
}

function setNavLatest(e) {
    e.preventDefault();
    
    setTimeout(() => {
        window.location.href = "./viewallmovies.html?latest";
    }, 250);
}

function setNavRated(e) {
    e.preventDefault();
    
    setTimeout(() => {
        window.location.href = `./viewallmovies.html?rated`;
    }, 250);
}

/*

 EMAIL CONTACT FORM

*/

/* MAIL CONTACT FORM FUNCTIONALITY */
function contact(e) {
  try {
      e.preventDefault();
      const loading = document.querySelector(".modal__overlay--loading");
      const success = document.querySelector(".modal__overlay--success");
      loading.classList += " modal__overlay--visible";
      emailjs.sendForm(
        "service_2zh7gkh",
        "template_athyrzu",
        e.target,
        "M5JGTBwzcn6wIf6a7"
      ).then(() => {
        loading.classList.remove("modal__overlay--visible");
        success.classList += " modal__overlay--visible";
      }).catch(() => {
        
        loading.classList.remove("modal__overlay--visible");
        alert("Error: The email service is temporarily unavailable. Please contact me directly on email.nytek@gmail.com.")
      });
  } catch (error) {
      console.error("Error in contact function:", error);
  }
}

/* OPEN AND CLOSE THE MAIL CONTACT FORM */
function toggleModal() {
  if (isModalOpen) {
    isModalOpen = false;
    document.querySelector("nav").classList.remove("hide-element");
    document.querySelector(".radio-panel--wrapper").classList.remove("hide-element");
    document.querySelector(".search").classList.remove("hide-element");
    return document.body.classList.remove("modal--open");
  }
  isModalOpen = true;
  document.querySelector("nav").classList += " hide-element";
  document.querySelector(".radio-panel--wrapper").classList += " hide-element";
  document.querySelector(".search").classList += " hide-element";
  document.body.classList += " modal--open";
}

/*
    // RETRIEVE TRENDING TV SHOWS (TOO COMPLICATED FOR QUICK PROJECT -- MAYBE LATER)
    fetch(
        "https://api.themoviedb.org/3/trending/tv/day?language=en-US",
        options
    )
        .then((response) => response.json())
        .then((response) => console.log("LATEST TV SHOW LIST"))
        .catch((err) => console.error(err));
    */
