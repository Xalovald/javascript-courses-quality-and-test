document.getElementById('postLinkedInBtn').addEventListener('click', function () {
    const username = '<%= username %>'; // Replace with your username variable
    const score = '<%= score %>'; // Replace with your score variable

    // Make a POST request to your LinkedIn posting endpoint
    fetch('/post-linkedin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, score }),
    })
    .then(response => {
        if (response.ok) {
            alert('Posted to LinkedIn successfully!');
            document.getElementById('intermediateModal').style.display = 'none'; // Hide the modal
        } else {
            alert('Failed to post to LinkedIn.');
        }
    })
    .catch(err => {
        console.error('Error posting to LinkedIn:', err);
        alert('Error posting to LinkedIn.');
    });
});
