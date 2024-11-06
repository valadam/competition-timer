document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from /config and set up the page with event details
    fetch('/config')
        .then(response => response.json())
        .then(data => {
            // Set the event details and logo
            if (data.logo) {
                document.getElementById('dynamic-logo').src = data.logo;
            } else {
                console.error("Logo path missing in config data.");
            }
            document.getElementById('event-title').textContent = data.eventTitle;
            document.getElementById('presenter').textContent = data.presenter;
            document.getElementById('title').textContent = data.title;
            document.getElementById('schedule').textContent = `${data.schedule / 60} min`;  // Display schedule in minutes

            // Initialize the timer with the schedule from config.json
            initializeTimer(data.schedule);
        })
        .catch(error => console.error("Error loading config data:", error));

    // Update current date and time display every second
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call to set immediately

    // Add event listener to "Return to Dashboard" button
    document.getElementById('return-dashboard').addEventListener('click', () => {
        window.location.href = 'index.html';  // Redirect to the dashboard page
    });
});

function updateDateTime() {
    const now = new Date();
    document.getElementById('date-time').innerText = now.toLocaleString();
}

function initializeTimer(timeInSeconds) {
    let duration = timeInSeconds;  // Original duration
    let remainingTime = duration;  // Time left for the timer
    let interval;                  // Interval ID for the timer
    let isPaused = false;          // Pause state

    const timerElement = document.getElementById('timer');
    const progressBar = document.getElementById('progress-bar');
    const additionalTimeDisplay = document.getElementById('additional-time-display');

    // Initial display of the timer and progress bar
    updateTimerDisplay(remainingTime);
    updateProgressBar(remainingTime, duration);

    // Button event listeners for timer control
    document.getElementById('start').addEventListener('click', startTimer);
    document.getElementById('pause').addEventListener('click', pauseTimer);
    document.getElementById('stop').addEventListener('click', stopTimer);
    document.getElementById('reset').addEventListener('click', resetTimer);
    document.getElementById('set-timeframe').addEventListener('click', setNewTimeFrame);
    document.getElementById('add-time').addEventListener('click', addAdditionalTime);

    function startTimer() {
        if (isPaused) {
            isPaused = false;
            return;
        }
        if (interval) clearInterval(interval); // Clear existing interval if running
        interval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                updateTimerDisplay(remainingTime);
                updateProgressBar(remainingTime, duration);
            } else {
                clearInterval(interval);
            }
        }, 1000);
    }

    function pauseTimer() {
        isPaused = true;
        clearInterval(interval);
    }

    function stopTimer() {
        clearInterval(interval);
        isPaused = false;
        remainingTime = 0;
        updateTimerDisplay(remainingTime);
        updateProgressBar(remainingTime, duration);
    }

    function resetTimer() {
        clearInterval(interval);
        remainingTime = duration;
        isPaused = false;
        updateTimerDisplay(remainingTime);
        updateProgressBar(remainingTime, duration);
        additionalTimeDisplay.innerText = "+00:00:00";
    }

    function setNewTimeFrame() {
        const newTimeFrame = parseInt(document.getElementById('new-timeframe').value) * 60;
        if (!isNaN(newTimeFrame) && newTimeFrame > 0) {
            clearInterval(interval);
            duration = newTimeFrame;
            remainingTime = newTimeFrame;
            updateTimerDisplay(remainingTime);
            updateProgressBar(remainingTime, duration);
            additionalTimeDisplay.innerText = "+00:00:00";
        }
    }

    function addAdditionalTime() {
        const additionalTime = parseInt(document.getElementById('additional-time').value) * 60;
        if (!isNaN(additionalTime) && additionalTime > 0) {
            remainingTime += additionalTime;
            duration += additionalTime;
            updateTimerDisplay(remainingTime);
            updateProgressBar(remainingTime, duration);
            updateAdditionalTimeDisplay(additionalTime);
        }
    }

    function updateAdditionalTimeDisplay(additionalSeconds) {
        const hours = Math.floor(additionalSeconds / 3600);
        const minutes = Math.floor((additionalSeconds % 3600) / 60);
        const seconds = additionalSeconds % 60;
        additionalTimeDisplay.innerText = `+${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimerDisplay(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updateProgressBar(currentTime, maxTime) {
        const percentage = (currentTime / maxTime) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${Math.floor(percentage)}%`;
 
    }
    
}

