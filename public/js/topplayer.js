document.getElementById('showTopPlayers').addEventListener('click', () => {
    fetch('/top-players')
        .then(response => response.json())
        .then(data => {
            const playersBody = document.getElementById('playersBody');
            playersBody.innerHTML = ''; // Clear previous entries

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
        })
        .catch(err => console.error('Error fetching top players:', err));
});

// Close the modal
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('topPlayersModal').style.display = 'none';
});