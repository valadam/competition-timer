
// Updated dashboard.js to save logo path as /img/uploads/logo_name.ext

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Capture form data
    const eventData = {
      eventTitle: document.getElementById('event-title').value,
      presenter: document.getElementById('presenter').value,
      title: document.getElementById('title').value,
      schedule: parseInt(document.getElementById('schedule').value) * 60, // Convert minutes to seconds
      logoPath: ''
    };

    // Handle logo upload
    const logoUpload = document.getElementById('logo-upload').files[0];
    if (logoUpload) {
      const logoPath = `/img/uploads/${logoUpload.name}`;
      eventData.logoPath = logoPath;

      // Save uploaded logo file to server (simulated path)
      const formData = new FormData();
      formData.append('file', logoUpload);

      try {
        await fetch('/upload-logo', { // Endpoint to handle file upload
          method: 'POST',
          body: formData
        });
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    }

    // Save form data to config.json
    try {
      await fetch('/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      alert('Event configuration saved successfully!');
      // Redirect to timer.html to start the timer with the configured settings
      window.location.href = '/timer.html';
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration.');
    }
  });
});
