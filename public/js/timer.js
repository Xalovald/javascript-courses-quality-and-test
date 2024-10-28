document.addEventListener('DOMContentLoaded', function() {
    const scoreElement = document.getElementById('score');
    let score = 0;
    let gameWon = false;
    let scoreInterval = null;
    let isFetching = true;

    // Fonction de mise à jour de l'affichage du score
    function updatescoreDisplay(score) {
        scoreElement.textContent = ` Score : ${score}`;
    }

    // Fonction qui récupère le score du serveur
    function fetchscore() {
        return fetch('/score')
            .then(response => response.json())
            .then(data => {
                const serverscore = data.score;
                const localscore = localStorage.getItem('gamescore');

                if (localscore === null || parseInt(localscore, 10) > serverscore) {
                    score = serverscore;
                    localStorage.setItem('gamescore', score);
                } else {
                    score = parseInt(localscore, 10);
                }

                updatescoreDisplay(score);
                isFetching = false;

                if (!scoreInterval) {
                    scoreInterval = setInterval(updatescore, 1000); // Décrémente chaque seconde
                }
            })
            .catch(error => {
                console.error('Error fetching score:', error);
                isFetching = false; 
            });
    }

    // Fonction de mise à jour du score
    function updatescore() {
        if (isFetching || gameWon) return;

        if (score > 0) {
            score--;
            updatescoreDisplay(score);
            localStorage.setItem('gamescore', score);
            updateServerscore(score);
        } else {
            scoreElement.textContent = " | Temps écoulé ! Vous ne pouvez plus jouer aujourd'hui.";
            disableInputs();
            clearInterval(scoreInterval);
        }
    }

    // Fonction pour sauvegarder le score côté serveur
    function updateServerscore(score) {
        fetch('/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ score })
        })
        .catch(error => console.error('Error updating score:', error));
    }

    // Fonction pour désactiver les entrées lorsque le temps est écoulé
    function disableInputs() {
        const letterInput = document.getElementById('letterInput');
        const submitButton = document.querySelector('button[type="submit"]');
        letterInput.disabled = true;
        submitButton.disabled = true;
    }

    // Sauvegarder le score dans localStorage avant chaque rechargement ou fermeture de page
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('gamescore', score); // Toujours sauvegarder la valeur locale du score
    });

    // Charger le score depuis le serveur et synchroniser
    fetchscore();

    setInterval(fetchscore, 10000);
});
