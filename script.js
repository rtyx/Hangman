
var startBotton = document.getElementById('start'); //this selects the div that will start the game
var hiddenWord = document.getElementById('hiddenWord'); //this selects the div that will contain the word to guess
var incorrectChars = document.getElementById('incorrect'); //here we select the div with the incorrect letters
var gameOver = document.getElementById('gameover'); //this is the game over screen. it works as a botton.
var win = document.getElementById('win');//as well as the win screen
var cxt = document.getElementById('gcanvas').getContext('2d');//this is the canvas that contains the hangman
var mutebotton = document.getElementById('mute');
var messages = document.getElementById('messages');


var mute = false;
var backgroundMusic = new Audio('orpheus.mp3');
var hanged = new Audio('hanged.mp3');
var hit = new Audio('thump.mp3');
var finalhit = new Audio('finalhit.wav');

var drawHead = function() {
    cxt.strokeStyle = 'white';
    cxt.lineWidth = 3;
    cxt.lineCap = "round";
    cxt.lineJoin = "round";
    cxt.beginPath();
    cxt.arc(200,120,20, 0, 2*Math.PI, false);
    cxt.stroke();
};

var drawTorso = function() {
    cxt.strokeStyle = 'white';
    cxt.lineWidth = 3;
    cxt.lineCap = "round";
    cxt.lineJoin = "round";
    cxt.beginPath();
    cxt.moveTo(200,140);
    cxt.lineTo(200,200);
    cxt.stroke();
};

var drawRightArm = function() {
    cxt.strokeStyle = 'white';
    cxt.lineWidth = 3;
    cxt.lineCap = "round";
    cxt.lineJoin = "round";
    cxt.beginPath();
    cxt.moveTo(200,140);
    cxt.lineTo(210,185);
    cxt.stroke();
};

var drawLeftArm = function() {
    cxt.strokeStyle = 'white';
    cxt.lineWidth = 3;
    cxt.lineCap = "round";
    cxt.lineJoin = "round";
    cxt.beginPath();
    cxt.moveTo(200,140);
    cxt.lineTo(190,185);
    cxt.stroke();
};

var drawRightLeg = function() {
    cxt.strokeStyle = 'white';
    cxt.lineWidth = 3;
    cxt.lineCap = "round";
    cxt.lineJoin = "round";
    cxt.beginPath();
    cxt.moveTo(200,200);
    cxt.lineTo(210,245);
    cxt.stroke();
};

var drawLeftLeg = function() {
    cxt.strokeStyle = 'white';
    cxt.lineWidth = 3;
    cxt.lineCap = "round";
    cxt.lineJoin = "round";
    cxt.beginPath();
    cxt.moveTo(200,200);
    cxt.lineTo(190,245);
    cxt.stroke();
};


function startGame() { //this is the function that starts the game

    if (!mute) { //if the mute is not activated
        backgroundMusic.currentTime = 0; //we set the music to 0
        backgroundMusic.play(); //and start playing
        hanged.pause(); //we stop the hanged sound from previous games
    }

    mutebotton.style.display="none"; //we remove the display from all the auxiliary divs
    startBotton.style.display = "none";
    gameOver.style.display = "none";
    win.style.display = "none";

    incorrectChars.innerHTML = ""; //clear the incorrect characters box (from previous games)
    hiddenWord.style.color = "white"; //and turn the color to white (in case it was red from a previous game)

    var words = ["Donald", "Melania", "Ivanka", "Ivana", "Marla", "Barron", "Tiffany", "Eric"]; // this array is a list of words to play with
    var randomWordRaw = words[Math.floor(Math.random() * words.length)]; //this selects a random word from the array
    var randomWord = randomWordRaw.toUpperCase(); //and this capitalizes the word

    var wrongChars = []; //this array keeps track of all the wrong characters introduced
    var rightChars = []; //this array keeps track of the right characters introduced
    var errors = wrongChars.length; // this variable counts the errors we've made (in the game, not in life)

    var wordSoFar = randomWord.replace(/[A-Z]/g, "_"); //replaces each character with a "_"
    hiddenWord.innerHTML = wordSoFar; //This inserts the random word (hidden) in the field.

    cxt.strokeStyle = 'white'; //This is the canvas functions. We draw the Gallow
    cxt.lineWidth = 10;
    cxt.lineCap = "square";
    cxt.lineJoin = "miter";
    cxt.beginPath();
    cxt.moveTo(40,280);
    cxt.lineTo(100,280);
    cxt.moveTo(70,280);
    cxt.lineTo(70,40);
    cxt.lineTo(200,40);
    cxt.moveTo(75,90);
    cxt.lineTo(115,45);
    cxt.stroke();

    cxt.strokeStyle = 'white'; //including the string
    cxt.lineWidth = 1;
    cxt.lineCap = "square";
    cxt.lineJoin = "miter";
    cxt.beginPath();
    cxt.moveTo(200,40);
    cxt.lineTo(200,100);
    cxt.stroke();

    console.log(randomWord); //this is supposed to be secret, but we console.log the answer

    document.addEventListener("keypress", function(event) { //we listen for the keys pressed

        var key_press = String.fromCharCode(event.keyCode); //and turn them into strings
        var newGuess = key_press.toUpperCase(); //and make them uppercase
        if (isNaN(newGuess)) {
            incorrectChars.innerHTML = wrongChars; //we will just show them on the screen
            if (randomWord.includes(newGuess)) { //we check if the random word contains the letter we guessed
                if (!rightChars.includes(newGuess)) { //if the new guess is not in the list of right characters yet
                    rightChars.push(newGuess); //we push it inside
                    String.prototype.replaceAt=function(index, character) { //this is a function to introduce the right character in the string
                        return this.substr(0, index) + character + this.substr(index+character.length);
                    };
                    for(var i=0; i<randomWord.length;i++) { //we check the hidden word, to find where the right character should be
                        if (randomWord[i] === newGuess) { //if we find
                            wordSoFar = wordSoFar.replaceAt(i, newGuess); //we replace it at that index
                            hiddenWord.innerHTML = wordSoFar; //and we show the result on the page
                        }
                    }
                } else {
                    messages.innerHTML = "You already tried that letter"; //if we had used that letter before we show a message
                    setTimeout(function() { //and then make it disappear
                        messages.innerHTML = "";
                    }, 3000);    //after 1 second
                }
                if (wordSoFar === randomWord) {
                    win.style.display = "inline-block";
                    incorrectChars.innerHTML = ""; //we will just show them on the screen
                }
            } else { //if the random word doesn't contain the letter we guessed, we have two scenarios
                if (wrongChars.includes(newGuess)) { //we had tried that letter before, in that case
                    messages.innerHTML = "You already tried that letter"; //we show a message
                    setTimeout(function() {
                        messages.innerHTML = "";
                    }, 3000);                   } else { //or is the first time we try that letter, in that case
                    wrongChars.push(newGuess); //we push it to the array of wrong characters
                    errors = wrongChars.length; //we update the error counter
                    if (!mute) { //if a wrong character is introduced
                        hit.play(); //we play the hit sound
                    }
                    switch (errors) { //depending on how many errors we have made, something will happen
                    case 1: //the case is the amount of errors
                        drawHead(); //with each case, comes a canvas drawing
                        incorrectChars.innerHTML = wrongChars; //and we show the new array of wrong characters
                        break;
                    case 2:
                        drawTorso();
                        incorrectChars.innerHTML = wrongChars;
                        break;
                    case 3:
                        drawRightArm();
                        incorrectChars.innerHTML = wrongChars;
                        break;
                    case 4:
                        drawLeftArm();
                        incorrectChars.innerHTML = wrongChars;
                        break;
                    case 5:
                        drawRightLeg();
                        incorrectChars.innerHTML = wrongChars;
                        break;
                    case 6: //after six errors, the game is over
                        drawLeftLeg(); //we draw the last limb
                        if (!mute) { //play the final hit if the mute is not activated
                            finalhit.play();
                        }
                        setTimeout(function() { //and prepare the game over screen
                            if (!mute) { //if the sound is active, we play the hanged sound
                                backgroundMusic.pause(); //and stop the music
                                hanged.play();
                            }
                            cxt.clearRect(0, 0, 300, 300); //we clear the canvas
                            hiddenWord.innerHTML = randomWord; //show the correct answer
                            hiddenWord.style.color = "red"; //add some drama
                            gameOver.style.display = "inline-block"; //show the game over div
                            incorrectChars.innerHTML = "You fucked it up"; //and add more drama
                        }, 1000); //but all of that, waiting a lil bit
                        incorrectChars.innerHTML = "";
                        break;
                    default:
                        console.log("Wut?");
                        break;
                    }
                }
            }
        } else {
            messages.innerHTML = "Numbers will not save you"; //numbers are not valid, so we show a message
            setTimeout(function() { //and then make it disappear
                messages.innerHTML = "";
            }, 3000);
        }
    });
}

startBotton.addEventListener('click', startGame); //the game can start if we click the start botton
gameOver.addEventListener('click', startGame); //or the game over botton
win.addEventListener('click', startGame); //or the win botton

mutebotton.addEventListener('click', function() { //this controls the mute variable
    if (!mute) { //if the mute variable is false, but we don't want sound
        mute = true; //we make it true, so we won't have sound
        mutebotton.innerHTML = "without sound";
    } else {
        mute = false; //otherwise it remains false
        mutebotton.innerHTML = "with sound";
    }
});

window.addEventListener('keypress', function(event) { //This event listens to the keys pressed
    var keypressed = event.keyCode; //and checks the code of the key
    if (keypressed === 32) { //if the key is the space bar
        startGame(); //we start the game
    }
});
