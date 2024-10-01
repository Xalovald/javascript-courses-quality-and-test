document.addEventListener('DOMContentLoaded', function() {
    const scoreElement = document.getElementById('score');
    let score = 0;
    let gameWon = false;
    let scoreInterval = null;
    let isFetching = true; // Verrouillage pour empêcher les actions avant synchronisation

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

                // Priorité à la valeur serveur, réinitialiser localStorage si nécessaire
                if (localscore === null || parseInt(localscore, 10) > serverscore) {
                    score = serverscore;
                    localStorage.setItem('gamescore', score); // Sauvegarde locale avec la valeur serveur
                } else {
                    score = parseInt(localscore, 10); // Utiliser la valeur du localStorage
                }

                updatescoreDisplay(score);
                isFetching = false; // Lever le verrou après synchronisation

                // Lancer le score si ce n'est pas déjà fait
                if (!scoreInterval) {
                    scoreInterval = setInterval(updatescore, 1000); // Décrémente chaque seconde
                }
            })
            .catch(error => {
                console.error('Error fetching score:', error);
                isFetching = false; // Même en cas d'erreur, lever le verrou
            });
    }

    // Fonction de mise à jour du score
    function updatescore() {
        if (isFetching || gameWon) return; // Bloquer si en synchronisation ou si jeu gagné

        if (score > 0) {
            score--; // Décrémenter le score
            updatescoreDisplay(score);
            localStorage.setItem('gamescore', score); // Sauvegarder dans localStorage
            updateServerscore(score); // Sauvegarder immédiatement côté serveur
        } else {
            scoreElement.textContent = " | Temps écoulé ! Vous ne pouvez plus jouer aujourd'hui.";
            disableInputs();
            clearInterval(scoreInterval); // Arrêter le score quand il atteint 0
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

    // Re-synchroniser toutes les 10 secondes, mais priorité à la valeur serveur au chargement
    setInterval(fetchscore, 10000);
});
