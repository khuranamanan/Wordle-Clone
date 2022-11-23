//Importing Dictionary and Target Words from a separate JavaScript File
import {
    dictionary
} from "./dictionary.js";
import {
    targetWords
} from "./targetwords.js"

// To Change Target Word Daily
const startDate = new Date(2022, 10, 18); // in milliSecond
const currentDate = Date.now();
const daysFromStart = Math.floor((currentDate - startDate) / 1000 / 60 / 60 / 24); // Converting Millisecond to number of Days
const todaysTargetWord = targetWords[daysFromStart];

const allButtons = document.querySelectorAll(".key");
const wordLength = 5;
const flipAnimationDuration = 500;
const jumpAnimationDuration = 500;
const guessGrid = document.querySelector("[data-guess-grid]");
const alertContainer = document.querySelector("[data-alert-container]");
const keyboard = document.querySelector("[data-keyboard]");

//Function to add event listeners to Keyboard buttons on the document and the actual keyboard
function startInteraction() {
    // document.addEventListener("click", mouseInteraction);
    allButtons.forEach((e) => {
        e.addEventListener("click", mouseInteraction);
    })
    document.addEventListener("keydown", keyboardInteraction);
}

//Function to remove Event listeners from Keyboard buttons on the document and the actual keyboard
function stopInteraction() {
    // document.removeEventListener("click", mouseInteraction);
    allButtons.forEach((e) => {
        e.removeEventListener("click", mouseInteraction);
    })
    document.removeEventListener("keydown", keyboardInteraction);
}

//Callback function to Keyboard buttons click event
function mouseInteraction(e) {
    if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key);
        return
    }

    if (e.target.matches("[data-enter]")) {
        submitGuess();
        return
    }

    if (e.target.matches("[data-delete]")) {
        deleteCharacter();
        return
    }
}

//Callback function to actual Keyboard buttons click event
function keyboardInteraction(e) {
    if (e.key === "Enter") {
        submitGuess();
        return
    }

    if (e.key === "Backspace") {
        deleteCharacter();
        return
    }

    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key)
        return
    }
}

//Function to be executed when the user clicks any letter key
function pressKey(key) {
    const numberOfActiveTiles = activeTiles();

    if (numberOfActiveTiles.length === wordLength) return;

    const firstEmptyTile = guessGrid.querySelector(":not([data-letter])");
    firstEmptyTile.innerText = key;
    firstEmptyTile.dataset.letter = key;
    firstEmptyTile.dataset.status = "active";
    zoomInOut(firstEmptyTile);
}

//Function that adds animation when a user types
function zoomInOut(tile) {
    tile.classList.add("zoom-in-out")

    tile.addEventListener("animationend", () => {
        tile.classList.remove("zoom-in-out")
    });
}

//Function to be executed when the user wants to delete an already typed letter
function deleteCharacter() {
    const tilesWithText = activeTiles()

    if (tilesWithText.length === 0) return;

    const lastActiveTile = tilesWithText[tilesWithText.length - 1];

    lastActiveTile.innerText = "";
    delete lastActiveTile.dataset.status;
    delete lastActiveTile.dataset.letter;
}

//Function that returns the tiles which has letters inside them
function activeTiles() {
    const activeTiles = guessGrid.querySelectorAll("[data-status='active']");
    return activeTiles;
}

//Function that submits the user's guess by pressing enter key and runs appropriate function's according to the user's guess
function submitGuess() {
    const activeT = [...activeTiles()];
    // console.log(activeT, activeT.length);
    if (activeT.length < wordLength) {
        showAlert("Not enough Characters!");
        shakeTiles(activeT);
        return
    }

    const guess = activeT.reduce((word, tile) => {
        const letter = tile.dataset.letter;
        word += letter;
        return word
    }, "");

    if (dictionary.includes(guess) === false) {
        showAlert("Not a Word!")
        shakeTiles(activeT);
        return
    }

    stopInteraction();
    activeT.forEach((...params) => {
        flipTiles(...params, guess);
    })
}

//Function that animates and changes the color of tiles and keys after user's each guess
function flipTiles(tile, index, array, guess) {
    const letter = tile.dataset.letter;
    const key = keyboard.querySelector(`[data-key="${letter}"i]`);

    setTimeout(() => {
        tile.classList.add("flip")
    }, index * flipAnimationDuration / 2)

    tile.addEventListener("transitionend", () => {
        tile.classList.remove("flip");

        if (todaysTargetWord[index] === letter) {
            tile.dataset.status = "correct";
            key.classList.add('correct');
            key.style.color = "var(--tile-font-color)";
        } else if (todaysTargetWord.includes(letter)) {
            tile.dataset.status = "wrong-location";
            key.classList.add('wrong-location');
            key.style.color = "var(--tile-font-color)"
        } else {
            tile.dataset.status = "wrong";
            key.classList.add('wrong');
            key.style.color = "var(--tile-font-color)";
        }

        if (index === (array.length - 1)) {
            tile.addEventListener("transitionend", () => {
                startInteraction();
                checkWinOrLoose(guess, array);
            }, {
                once: true
            })
        }
    }, {
        once: true
    })
}

//Function that show's appropriate message to user like: Not enough Characters, Not a Word, Correct guess, Wrong Guess
function showAlert(message, duration = 1000) {
    const alert = document.createElement("div");
    alert.classList.add("alert");
    alert.innerText = message;
    alertContainer.prepend(alert);

    setTimeout(() => {
        alert.classList.add("alert-hide");
        alert.addEventListener("transitionend", () => {
            alert.remove();
        })
    }, duration)
}

//Function that shakes tiles if the user types less than 5 characters or the guess in not an actual word
function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake")

        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake")
        }, {
            once: true
        })
    });
}

//Function that checks if the user Won the game or lost
function checkWinOrLoose(guess, tiles) {
    if (todaysTargetWord === guess) {
        showAlert("You Won!!", 10000)
        jump(tiles);
        stopInteraction();
        return
    }

    const remaininingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remaininingTiles.length === 0) {
        showAlert(`Today's Wordle is "${todaysTargetWord.toUpperCase()}".`, 10000)
        stopInteraction();
        return
    }
}

//Function to animate tiles when the user's guess is right
function jump(correctTiles) {
    correctTiles.forEach((e, index) => {
        setTimeout(() => {
            e.classList.add("jump")
            e.addEventListener("animationend", () => {
                e.classList.remove("jump")
            }, {
                once: true
            })
        }, index * jumpAnimationDuration / 5)
    })
}

//Calling the startInteraction Function so as soon as it loads user can start interacting
startInteraction();


//Hamburger Menu

const hamburger = document.querySelector("[data-hamburger]");

//Adding click event listener to the hamburger menu (Open/Close)
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
})


// Theme picker

const themeRadioBtns = document.querySelectorAll('[name="theme"]');

//Function to store the selected theme in local Storage
function storeTheme(theme) {
    localStorage.setItem("theme", theme);
    return;
}

//Adding click Event Listener on each Theme Option to store the user selected theme to the local storage
themeRadioBtns.forEach((themeOption) => {
    themeOption.addEventListener("click", () => {
        storeTheme(themeOption.id);
    })
})

//Function that Retrieve's user's previously selected theme option and set's that option for the current session of the user
function retrieveTheme() {
    const themeStored = localStorage.getItem("theme");

    themeRadioBtns.forEach((themeOption) => {
        if (themeOption.id === themeStored) {
            themeOption.checked = true;
        }
    })

    //Fallback if browser doesn't support :has() pseudo-class
    document.documentElement.className = themestored;
}

// Calling the retrieve Function to set the current theme to user's previously selected theme option
retrieveTheme();