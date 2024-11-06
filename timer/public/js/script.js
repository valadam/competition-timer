document.getElementById('event-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get form values
    const data = {
        eventTitle: document.getElementById('event-title').value,
        presenter: document.getElementById('presenter').value,
        title: document.getElementById('title').value,
        schedule: parseInt(document.getElementById('schedule').value) * 60,  // Convert minutes to seconds
    };

    // Handle logo upload
    const logoFile = document.getElementById('logo-upload').files[0];
    if (logoFile) {
        // Assuming the server will save the uploaded file with a specific path
        // For demonstration, save only a predefined path
        data.logo = 'img/uploads/' + logoFile.name;

        // Send data to server
        saveConfigData(data);
    } else {
        // No logo selected, use the default path
        data.logo = "img/default-logo.png";  // Default logo path or URL
        saveConfigData(data);
    }
});

function saveConfigData(data) {
    fetch('http://localhost:3000/config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.text())
        .then(result => {
            console.log(result); // Log success message
            window.location.href = 'timer.html'; // Redirect if needed
        })
        .catch(error => console.error('Error:', error));
}