document.getElementById('showTopPlayers').addEventListener('click', () => {
    fetch('/top-players')
        .then(response => response.json())
        .then(data => {
            console.log('Top players data:', data); // Log des données reçues
            const playersBody = document.getElementById('playersBody');
            playersBody.innerHTML = ''; // Clear previous entries
            const closeModalButton = document.getElementById('closeModal');

            data.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.score}</td> 
                    <td>${player.game_date}</td>
                `;
                playersBody.appendChild(row);
            });

            // Show the modal
            document.getElementById('topPlayersModal').style.display = 'block';

            closeModalButton.addEventListener('click', () => {
                topPlayersModal.style.display = 'none'; // Ferme le modal
            });
    
            // Ferme le modal si on clique en dehors
            window.addEventListener('click', (event) => {
                if (event.target === topPlayersModal) {
                    topPlayersModal.style.display = 'none'; // Ferme le modal si on clique à l'extérieur
                }
            });
        })
        .catch(err => console.error('Error fetching top players:', err));
});
