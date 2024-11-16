document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Capture form data
    const eventData = {
      eventTitle: document.getElementById('eventTitle').value,
      presenter: document.getElementById('presenter').value,
      title: document.getElementById('title').value,
      schedule: parseInt(document.getElementById('schedule').value) * 60, // Convert minutes to seconds
      logoPath: ''
    };

    // Handle logo upload
    const logoFile = document.getElementById('logo').files[0];
    if (logoFile) {
      const formData = new FormData();
      formData.append('file', logoFile);

      try {
        const uploadResponse = await fetch('/upload-logo', {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          eventData.logoPath = result.filePath;
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        alert('Failed to upload logo.');
        return;
      }
    }

    // Save configuration
    try {
      const saveResponse = await fetch('/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (saveResponse.ok) {
        // Store timer initialization data in localStorage
        localStorage.setItem('initialTime', eventData.schedule.toString());
        localStorage.setItem('initialDisplayTime', `${eventData.schedule / 60} Minutes`);

        // Redirect to timer page
        window.location.href = 'timer.html';
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    }
  });
});
