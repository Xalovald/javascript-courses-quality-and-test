document.addEventListener('DOMContentLoaded', () => {
    const scoreElement = document.getElementById('score');
    const triesElement = document.getElementById('tries');
    const currentWordElement = document.getElementById('currentWord');
    const gameStatusElement = document.getElementById('gameStatus');
    const guessForm = document.getElementById('guessForm');

    let score = parseInt(scoreElement.dataset.score, 10);

    function updatescore() {
        if (score > 0) {
            score--;
            scoreElement.textContent = ` Score : ${score}`;
        } else {
            disableGame();
            scoreElement.textContent = " | Temps écoulé ! Vous ne pouvez plus jouer aujourd'hui.";
        }
    }

    function disableGame() {
        document.getElementById('letterInput').disabled = true;
        document.getElementById('submitButton').disabled = true;
    }

    function updateGameStatus(status, word) {
        if (status === 'win') {
            gameStatusElement.innerHTML = `<h2>Félicitations ! Vous avez trouvé le mot : ${word} 🎉</h2>`;
        } else if (status === 'lose') {
            gameStatusElement.innerHTML = `<h2>Désolé, vous avez perdu. Le mot était : ${word} 😢</h2>`;
        }
    }

    // Update the score every second
    setInterval(updatescore, 1000);

    // Handle form submission using AJAX to avoid full-page reload
    guessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(guessForm);
        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/');
        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);

                currentWordElement.textContent = `Votre mot : ${response.game}`;
                triesElement.textContent = response.numberOfTries;

                if (response.status !== 'continue') {
                    updateGameStatus(response.status, response.word);
                    disableGame();
                }
            }
        };

        xhr.send(formData);
    });
});
