(function() { //We put everything into a function

    //DOM ELEMENTS

    var startButton = document.getElementById('start'); //this selects the div that will start the game
    var hiddenWord = document.getElementById('hiddenWord'); //this selects the div that will contain the word to guess
    var incorrectChars = document.getElementById('incorrect'); //here we select the div with the incorrect letters
    var start = document.getElementById('start'); //this is the start screen
    var gameOver = document.getElementById('gameover'); //this is the game over screen
    var win = document.getElementById('win');//as well as the win screen
    var cxt = document.getElementById('gcanvas').getContext('2d');//this is the canvas that contains the hangman
    var muteButton = document.getElementById('mute'); //this is the button to mute the sound
    var messages = document.getElementById('messages'); //this is the box for occasional messages
    var risk = document.getElementById('risk'); //this is the container of the option to get risky (guess the whole word)
    var riskButton = document.getElementById('riskButton');//this is the button to get risky (guess the whole word)
    var submit = document.getElementById('submit'); //the button to submit the word guessed
    var fadeToBlack = document.getElementById('blackfade'); //this is a div to fade to black the screen
    var yourGuess = document.getElementById('yourGuess'); //this element is the word guessed in the risky option
    var riskWindow = document.getElementById('feelingRiskyWindow'); //and this is the risk window
    var wordLength = (Math.floor(Math.random()*6) + 6); //this will give a random length to the random word
    var randomWord; //this is the word we have to guess

    //FIRST WE NEED A RANDOM WORD. WE MAKE A REQUEST TO SETGETGO.COM

    function requestRandomWord() { //we create a function to request the word
        var xhr = new XMLHttpRequest; //we create the XMLHttpRequest
        xhr.open('GET', 'http://www.setgetgo.com/randomword/get.php?len=' + wordLength); //we ask setgetgo for a word with a wordLength (random) we determined before
        xhr.send(); //we send the request
        xhr.addEventListener('readystatechange', function() { //and listen to it
            if (xhr.readyState != XMLHttpRequest.DONE) {
                return;
            }
            var status;
            try {
                status = xhr.status; //we check the status and console.log it
                console.log(status); //it should be 200
            } catch(e) {
                console.log(e);
                return;
            }
            if (status != 200) { //if it's not 200, we create our own random word from a local array
                var words = ["Donald", "Melania", "Ivanka", "Ivana", "Marla", "Barron", "Tiffany", "Eric"]; // this array is a list of words to play with
                var localWordRaw = words[Math.floor(Math.random() * words.length)]; //this selects a random word from the array
                var localWord = localWordRaw.toUpperCase(); //and this capitalizes the word
                randomWord = localWord;
            }
            var responseText = xhr.responseText.toUpperCase(); //we save the response in a variable
            randomWord = responseText; //and give the random word the name of that variable
        }); //randomWord is already in the global scope, so the rest of fucntions have access to it
    }

    requestRandomWord();

    //SOUND EFFECTS

    var mute = true; //we start assuming that the user doesn't want sound. Therefore the mute is true
    var backgroundMusic = new Audio('orpheus.mp3'); //these are the audio files
    var hanged = new Audio('hanged.mp3');
    var hit = new Audio('thump.mp3');
    var finalhit = new Audio('finalhit.wav');
    var winbell = new Audio('winbell.wav');

    //SOUND CONTROL

    muteButton.addEventListener('click', function() { //this controls the mute variable
        if (!mute) { //if the mute variable is false, but we don't want sound
            mute = true; //we make it true, so we won't have sound
            muteButton.innerHTML = "playing without sound";
        } else {
            mute = false; //otherwise it remains false
            muteButton.innerHTML = "playing with sound";
            hit.play();
        }
    });

//CANVAS FUNCTIONS
//This functions are activated whenever there's an error

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

    //START GAME FUNCTION

    function startGame() { //this is the function that starts the game
        fadeToBlack.style.display = "inline-block";

        if (!randomWord) {
            requestRandomWord();
        } else {
            console.log(randomWord); //this is supposed to be secret, but we console.log the answer
            console.log(wordLength); //and its length

            if (!mute) { //if the mute is not activated
                backgroundMusic.currentTime = 0; //we set the music to 0
                backgroundMusic.play(); //and start playing
                hanged.pause(); //we stop the hanged sound from previous games
            }

            muteButton.style.display="none"; //we remove the display from all the auxiliary divs
            startButton.style.display = "none";
            risk.style.display = "block";



            var wrongChars = []; //this array keeps track of all the wrong characters introduced
            var rightChars = []; //this array keeps track of the right characters introduced
            var errors = wrongChars.length; // this variable counts the errors we've made (in the game, not in life)

            var wordSoFar = randomWord.replace(/[A-Z]/g, "_"); //replaces each character with a "_"
            hiddenWord.innerHTML = wordSoFar; //This inserts the random word (hidden) in the field.

            function drawGallows() { //These are the canvas functions. We draw the Gallow
                cxt.strokeStyle = 'white';
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
            }

            drawGallows();

            // WIN SCREEN

            function showWinScreen() { //we are gonna define what happens when you win the game
                fadeToBlack.style.opacity = 1; //we fade to black (drama purpose only)
                if (!mute) { //if the sound is active,
                    winbell.play(); //and play the win bell
                    backgroundMusic.pause(); //we stop the music
                }
                setTimeout(function() {
                    win.style.display = "inline-block";
                    fadeToBlack.style.display = "none";
                    risk.style.display = "none";
                    hiddenWord.style.color = "#007f00"; //add some more drama
                    hiddenWord.innerHTML = randomWord; //show the correct answer
                    incorrectChars.innerHTML = ""; //we will just show them on the screen
                }, 2000);
                window.addEventListener('keypress', function handler(event) { //This event listens to the keys pressed
                    var keypressed = event.keyCode; //and checks the code of the key
                    if (keypressed === 32) { //if the key is the space bar
                        window.location.reload(false); //we reload the page
                    }
                });
            }

            // GAME OVER SCREEN

            function showGameOverScreen() { //we also define what happens when you loose
                if (!mute) { //play the final hit if the mute is not activated
                    finalhit.play();
                }
                fadeToBlack.style.opacity = 1; //fade to black
                setTimeout(function() {//and prepare the game over screen
                    if (!mute) { //if the sound is active
                        backgroundMusic.pause(); //stop the music
                        hanged.play(); //and play a creepy hanging sound
                    }
                    gameOver.style.display = "inline-block";//show the game over div
                    fadeToBlack.style.display = "none";
                    risk.style.display = "none";
                    incorrectChars.innerHTML = "You lost"; //and add some drama
                    hiddenWord.innerHTML = randomWord; //show the correct answer
                    hiddenWord.style.color = "#940000"; //add some more drama
                    risk.style.display = "none";
                }, 2000);//but all of that, waiting a lil bit
                incorrectChars.innerHTML = "";
                window.addEventListener('keypress', function handler(event) { //This event listens to the keys pressed
                    var keypressed = event.keyCode; //and checks the code of the key
                    if (keypressed === 32) { //if the key is the space bar
                        window.location.reload(false); //we reload the page
                    }
                });
            }

            //GAME PLAY OPTION 2: BEING RISKY AND GUESSING THE WHOLE WORD

            function feelingRisky() { //we listen to the "feeling risky" button
                riskButton.style.display = "none"; //the moment is clicked, whe hide it
                riskWindow.style.display = "block"; //and show the new game interface (a text area)
                submit.style.display = "inline-block"; //including a submit button
                document.removeEventListener("keypress", normalPlay); //from this moment, the keys introduced will not be listened as in the normal game
                yourGuess.focus(); //we focus the selector in the text field
                function resolveRisk() { //we define how the game is gonna be solved
                    var firstGuess = document.getElementById("yourGuess").value; //first guess is the word you introduce
                    var yourGuess = firstGuess.toUpperCase(); //but we capitalize it to make things easier
                    if (yourGuess == randomWord) { // if you introduce the right word
                        showWinScreen(); //you win
                    } else { //if not
                        showGameOverScreen(); //you loose
                    }
                }
                submit.addEventListener("click", resolveRisk);//the moment we click submit, we execute the resolve funciton
                window.addEventListener('keypress', function(event) { //we can also just press enter
                    var keypressed = event.keyCode;
                    if (keypressed === 13) {
                        resolveRisk();
                    }
                });
            }

            riskButton.addEventListener("click", feelingRisky);

        //GAME PLAY OPTION 1: GUESSING LETTER BY LETTER

            function normalPlay(event) { //we listen for the keys pressed
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
                        if (wordSoFar === randomWord) { //if the word so far is the random word, you win
                            document.removeEventListener("keypress", normalPlay); //we stop listening
                            showWinScreen(); //and we execute the win screen function
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
                                showGameOverScreen(); //and execute the function to show the game over screen
                                break;
                            default:
                                console.log("Wut?"); //it's never supposed to get here, but who knows
                                break;
                            }
                        }
                    }
                } else { //that was if the introduced character was not a number.
                    messages.innerHTML = "Numbers will not save you"; //numbers are not valid, so we show a message
                    setTimeout(function() { //and then make it disappear after some time
                        messages.innerHTML = ""; //so it won't be annoying
                    }, 3000);
                }
                window.addEventListener('keypress', function handler(event) { //This event listens to the keys pressed
                    var keypressed = event.keyCode; //and checks the code of the key
                    if (keypressed === 32) { //if the key is the space bar
                        feelingRisky(); //we start the game option II
                    }
                    window.removeEventListener("keypress", handler); //and remove the event listener (so that space bar won't restart the game)
                });
            }
            document.addEventListener("keypress", normalPlay);
        }
    }

    //AFTER THE GAME IS OVER

    gameOver.addEventListener('click', function() { //if you loose, you can restart the game
        window.location.reload(false); //by reloading the page
    }); //or the game over botton
    win.addEventListener('click', function() { //the same if you win
        window.location.reload(false);
    }); //or the win botton

    //WHEN THE PAGE LOADS

    window.addEventListener('keypress', function handler() { //This event listens to the keys pressed
        startGame(); //we start the game
        window.removeEventListener("keypress", handler); //and remove the event listener (so that space bar won't restart the game)
    });

    start.addEventListener('click', function handler() { //This event listens to the keys pressed
        startGame(); //we start the game
        window.removeEventListener("click", handler); //and remove the event listener (so that space bar won't restart the game)
    });
})();
