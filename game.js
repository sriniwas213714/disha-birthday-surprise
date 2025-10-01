document.addEventListener('DOMContentLoaded', () => {
    // --- Get Emails from Local Storage ---
    const dishaEmail = localStorage.getItem('dishaEmail') || 'EMAIL_NOT_PROVIDED';
    const sriwiEmail = localStorage.getItem('sriwiEmail') || 'sriniwas2137@gmail.com';

    const gameContainer = document.getElementById('memory-game');
    const triviaForm = document.getElementById('trivia-form');
    const questionElement = document.getElementById('trivia-question');
    const questionNumberElement = document.getElementById('question-number');
    const questionHiddenInput = document.getElementById('question-hidden-input');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-answer');
    const feedbackElement = document.getElementById('feedback');
    const successMessage = document.getElementById('game-success-message');

    // --- Add Hidden Email Fields to Formspree Submission ---
    const hiddenDishaEmail = document.createElement('input');
    hiddenDishaEmail.type = 'hidden';
    hiddenDishaEmail.name = 'Disha_Email';
    hiddenDishaEmail.value = dishaEmail;
    triviaForm.appendChild(hiddenDishaEmail);

    const hiddenSriwiEmail = document.createElement('input');
    hiddenSriwiEmail.type = 'hidden';
    hiddenSriwiEmail.name = '_replyto'; 
    hiddenSriwiEmail.value = sriwiEmail;
    triviaForm.appendChild(hiddenSriwiEmail);


    // --- PERSONAL TRIVIA QUESTIONS ---
    const personalTrivia = [
        {
            question: "What was Sriwi's best and most overwhelming feeling when we decided to start this journey together?",
            answer: "HOPE" 
        },
        {
            question: "What is the destination that Sriwi first mentioned as the place we must visit together someday?",
            answer: "PARIS" 
        },
        {
            question: "What place or activity represents the single best moment or time we have spent together?",
            answer: "DELHI_DATE" 
        }
    ];

    let cardsMatched = 0; 
    let triviaAnswered = 0; 
    let isTriviaActive = false; 

    // --- GAME LOGIC VARIABLES ---
    const cardFaces = ['S', 'R', 'I', 'W', 'I', 'L', 'O', 'V', 'E', 'S', 'R', 'I', 'W', 'I', 'L', 'O', 'V', 'E']; 
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    
    // --- FINAL MESSAGE ARRAY (18 characters total) ---
    // The message is "i love you disha!!"
    const finalMessageCharacters = ['i', ' ', 'l', 'o', 'v', 'e', ' ', 'y', 'o', 'u', ' ', 'd', 'i', 's', 'h', 'a', '!', '!'];


    // 1. Shuffle the cards
    // Note: We shuffle only the cardFaces (the matching letters) to ensure a randomized game.
    (function shuffle() {
        cardFaces.sort(() => Math.random() - 0.5);
    })();

    // 2. Create Cards - MODIFIED
    function createCards() {
        gameContainer.innerHTML = '';
        
        // This array will hold card data including its unique position and its face.
        const cardData = [];
        for (let i = 0; i < cardFaces.length; i++) {
            cardData.push({
                face: cardFaces[i],
                position: i // Assign a fixed position from 0 to 17
            });
        }

        cardData.forEach(data => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            
            // data-name is for the matching logic ('S', 'R', etc.)
            card.dataset.name = data.face; 
            // data-position is for the final revealed message ('i', ' ', 'l', 'o', etc.)
            card.dataset.position = data.position; 
            
            card.innerHTML = `<div class="front-face"><span>${data.face}</span></div><div class="back-face">?</div>`;
            card.addEventListener('click', flipCard);
            gameContainer.appendChild(card);
        });
        
        // The original size styling
        document.querySelectorAll('.memory-card').forEach(card => {
             card.style.width = '16.66%';
             card.style.height = '33.33%';
        });
    }

    // 3. Handle Card Flip (no change needed here)
    function flipCard() {
        if (lockBoard || isTriviaActive) return; 
        if (this === firstCard) return;

        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    // 4. Check for Match (no change needed here)
    function checkForMatch() {
        let isMatch = firstCard.dataset.name === secondCard.dataset.name;
        
        if (isMatch) {
            disableCards(); 
            cardsMatched++; // Now officially count the match
            
            // Check for trivia unlock points
            if (cardsMatched === 2 || cardsMatched === 4 || cardsMatched === 6 || cardsMatched === cardFaces.length / 2) {
                if (triviaAnswered < personalTrivia.length) {
                    showTriviaQuestion();
                }
            }
            
            if (cardsMatched === cardFaces.length / 2 && triviaAnswered === personalTrivia.length) {
                gameWon();
            }
            
        } else {
            unflipCards();
        }
    }

    // 5. Disable Cards (Match found) - MODIFIED FOR POSITION-BASED CHARACTER ASSIGNMENT
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        // Get the fixed positions of the two matched cards
        const pos1 = parseInt(firstCard.dataset.position);
        const pos2 = parseInt(secondCard.dataset.position);

        // Get the correct character from the message based on the card's position
        const char1 = finalMessageCharacters[pos1];
        const char2 = finalMessageCharacters[pos2];

        // --- Assign Char 1 to firstCard's position ---
        const firstCardFrontFace = firstCard.querySelector('.front-face span');
        if (firstCardFrontFace && char1 !== undefined) {
            // Use non-breaking space (&nbsp; or \u00A0) for spaces to remain visible on the board layout
            firstCardFrontFace.textContent = char1 === ' ' ? '\u00A0' : char1; 
            firstCardFrontFace.style.fontSize = '1.2em'; 
            // Add a class for spaces if you want to style them differently (optional)
            if (char1 === ' ') firstCardFrontFace.parentElement.classList.add('is-space');
        }

        // --- Assign Char 2 to secondCard's position ---
        const secondCardFrontFace = secondCard.querySelector('.front-face span');
        if (secondCardFrontFace && char2 !== undefined) {
            secondCardFrontFace.textContent = char2 === ' ' ? '\u00A0' : char2; 
            secondCardFrontFace.style.fontSize = '1.2em'; 
            if (char2 === ' ') secondCardFrontFace.parentElement.classList.add('is-space');
        }

        // Add the 'matched' class
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        resetBoard();
    }

    // 6. Unflip Cards (Mismatch)
    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1200);
    }

    // 7. Reset Board
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // 8. Show Trivia Question (no change needed here)
    function showTriviaQuestion() {
        isTriviaActive = true; 
        
        const trivia = personalTrivia[triviaAnswered];
        questionNumberElement.textContent = triviaAnswered + 1;
        questionElement.textContent = trivia.question;
        
        questionHiddenInput.value = trivia.question; 
        
        feedbackElement.textContent = '';
        answerInput.value = '';
        submitButton.disabled = false;
        
        triviaForm.classList.remove('hidden'); 
        gameContainer.style.opacity = '0.3'; 
    }

    // 9. Handle Trivia Submission (no change needed here)
    triviaForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const userAnswer = answerInput.value.trim();

        if (userAnswer.length > 0) {
            // 1. Submit form data to Formspree
            this.submit(); 
            
            // 2. Accept answer and show success message
            feedbackElement.textContent = "That's a beautiful answer. Your response is safely noted in Sriwi's heart.";
            feedbackElement.classList.remove('feedback-incorrect');
            feedbackElement.classList.add('feedback-correct');
            submitButton.disabled = true; 
            
            // 3. Advance to next state
            setTimeout(() => {
                triviaAnswered++;
                triviaForm.classList.add('hidden'); 
                gameContainer.style.opacity = '1'; 
                isTriviaActive = false; 
                
                if (triviaAnswered === personalTrivia.length && cardsMatched === cardFaces.length / 2) {
                    gameWon();
                }
            }, 2000); 

        } else {
            feedbackElement.textContent = "Please type an answer from the heart before proceeding!";
            feedbackElement.classList.remove('feedback-correct');
            feedbackElement.classList.add('feedback-incorrect');
        }
    });

    // 10. Game Won (no change needed here)
    function gameWon() {
        triviaForm.classList.add('hidden');
        gameContainer.style.display = 'none'; 
        successMessage.classList.remove('hidden'); 
    }
    
    // Initial setup
    createCards();
});
