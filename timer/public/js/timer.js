class TimerController {
    constructor(initialSeconds = 0) {
        this.initializeElements();
        this.initializeState(initialSeconds);
        this.bindEventListeners();
        this.updateDisplays();
    }

    initializeElements() {
        // Timer displays
        this.timerDisplay = document.getElementById('timer');
        this.additionalTimeDisplay = document.getElementById('additional-time-display');
        this.progressBar = document.getElementById('progress-bar');

        // Control buttons
        this.startButton = document.getElementById('start');
        this.pauseButton = document.getElementById('pause');
        this.stopButton = document.getElementById('stop');
        this.resetButton = document.getElementById('reset');
        this.setTimeframeButton = document.getElementById('set-timeframe');
        this.addTimeButton = document.getElementById('add-time');
        this.returnDashboardButton = document.getElementById('return-dashboard');

        // Input fields
        this.newTimeframeInput = document.getElementById('new-timeframe');
        this.additionalTimeInput = document.getElementById('additional-time');
    }

    initializeState(initialSeconds) {
        this.totalTime = initialSeconds;
        this.initialTimeframe = null; // Removed 3-minute default to allow dynamic setting
        this.maxTime = this.initialTimeframe;
        this.interval = null;
        this.isPaused = false;
        this.additionalTime = 0;
    }

    bindEventListeners() {
        this.startButton.addEventListener('click', () => this.startTimer());
        this.pauseButton.addEventListener('click', () => this.pauseTimer());
        this.stopButton.addEventListener('click', () => this.stopTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.setTimeframeButton.addEventListener('click', () => this.validateAndSetTimeframe());
        this.addTimeButton.addEventListener('click', () => this.validateAndAddTime());
        this.returnDashboardButton.addEventListener('click', () => window.location.href = "/");
    }

    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    validateTimeInput(input, fieldName = 'time') {
        const value = parseInt(input?.trim());
        if (!input?.trim() || isNaN(value) || value <= 0) {
            alert(`Please enter a valid ${fieldName} in minutes.`);
            return null;
        }
        return value;
    }

    validateAndSetTimeframe() {
        const newTime = this.validateTimeInput(this.newTimeframeInput.value, 'timeframe');
        if (newTime !== null) {
            this.totalTime = newTime * 60;
            this.initialTimeframe = this.totalTime;
            this.maxTime = this.totalTime;
            this.updateDisplays();
            this.clearInputs();
        }
    }

    validateAndAddTime() {
        const extraTime = this.validateTimeInput(this.additionalTimeInput.value, 'additional time');
        if (extraTime !== null) {
            const extraSeconds = extraTime * 60;
            this.totalTime += extraSeconds;
            this.additionalTime += extraSeconds;
            this.maxTime += extraSeconds;
            this.updateDisplays();
            this.clearInputs();
        }
    }

    updateButtonStates() {
        if (this.interval) {
            // Timer is running
            this.startButton.classList.add('inactive');
            this.pauseButton.classList.remove('inactive');
            this.stopButton.classList.remove('inactive');
        } else if (this.isPaused) {
            // Timer is paused
            this.startButton.classList.remove('inactive');
            this.pauseButton.classList.add('inactive');
            this.stopButton.classList.remove('inactive');
        } else if (this.totalTime === 0) {
            // Timer is stopped or not started
            this.startButton.classList.remove('inactive');
            this.pauseButton.classList.add('inactive');
            this.stopButton.classList.add('inactive');
        }
    }

    // Update button states (active/innactive)
    startTimer() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            if (this.totalTime > 0) {
                this.totalTime--;
                this.updateDisplays();
            } else {
                this.stopTimer();
                alert("Time's up!");
            }
        }, 1000);

        this.isPaused = false;
        this.updateButtonStates();
    }

    pauseTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isPaused = true;
            this.updateButtonStates();
        }
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = null;
        this.totalTime = 0;
        this.isPaused = false;
        this.updateDisplays();
        this.updateButtonStates();
    }

    resetTimer() {
        this.stopTimer();
        this.additionalTime = 0;
        this.totalTime = this.initialTimeframe;
        this.maxTime = this.initialTimeframe;
        this.updateDisplays();
        this.clearInputs();
        this.updateButtonStates();
    }

    updateDisplays() {
        this.updateTimerDisplay();
        this.updateAdditionalTimeDisplay();
        this.updateProgressBar();
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.totalTime);
    }

    updateAdditionalTimeDisplay() {
        this.additionalTimeDisplay.textContent = `+${this.formatTime(this.additionalTime)}`;
    }

    updateProgressBar() {
        const progress = (this.totalTime / this.maxTime) * 100;
        const cappedProgress = Math.min(progress, 100);
        this.progressBar.style.width = `${cappedProgress}%`;
        this.progressBar.textContent = `${Math.round(cappedProgress)}%`;
    }

    clearInputs() {
        this.newTimeframeInput.value = "";
        this.additionalTimeInput.value = "";
    }
}

// Initialize configuration and timer
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/data/config.json');
        const config = await response.json();

        // Set up UI elements
        const logoElement = document.getElementById('dynamic-logo');
        logoElement.src = config.logoPath || "/img/uploads/default_logo.png";

        // Update event title
        const eventTitleElement = document.querySelector('.event-title');
        if (eventTitleElement) {
            eventTitleElement.textContent = config.eventTitle || 'Event Title';
        }

        document.getElementById('presenter').textContent = config.presenter || 'Presenter';
        document.getElementById('title').textContent = config.title || 'Module Title';

        const initialSeconds = config.schedule || 0;
        document.getElementById('schedule').textContent = formatDuration(initialSeconds);

        // Initialize timer with configuration
        new TimerController(initialSeconds);
    } catch (error) {
        console.error("Failed to load configuration:", error);
        // Fallback to default initialization
        new TimerController();
    }
});

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? hours + " Hours " : ""}${minutes} Minutes`.trim();
}

// Function to update date and time
function updateDateTime() {
    const dateTimeElement = document.getElementById("date-time");
    const now = new Date();

    // Formatting date and time separately
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    const formattedDate = now.toLocaleDateString('en-GB', dateOptions); // Date line
    const formattedTime = now.toLocaleTimeString('en-GB', timeOptions); // Time line

    // Updating with bold and shadow effect and splitting lines
    dateTimeElement.innerHTML = `<span>${formattedDate}</span><br><span>${formattedTime}</span>`;
}

// Initial call without delay
updateDateTime();
// Refresh every second
setInterval(updateDateTime, 1000);

// Custom notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show'); // Display notification

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Handle logo upload
const logoElement = document.getElementById('dynamic-logo');
const logoUploadInput = document.getElementById('logo-upload');

// Trigger file upload dialog on logo click (optional)
logoElement.addEventListener('click', () => {
    logoUploadInput.click();
});

// Handle the uploaded file and display it
logoUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) { // Check if the file is an image
        const reader = new FileReader();

        // When the file is loaded, set it as the logo source
        reader.onload = function (e) {
            logoElement.src = e.target.result;
        };

        reader.readAsDataURL(file); // Convert image file to a data URL for inline display
    } else {
        showNotification("Please upload a valid image file."); // Notify if not an image
    }
});


// Update the "Time" display with the current countdown value
function updateScheduleTime() {
    const scheduleElement = document.getElementById('schedule');
    const timerElement = document.getElementById('timer');
    scheduleElement.innerText = timerElement.textContent;
}



// Update the "Time" display with the live countdown value
function updateScheduleTime() {
    const scheduleElement = document.getElementById('schedule');
    const timerElement = document.getElementById('timer');
    scheduleElement.innerText = timerElement.textContent;
}

// Integrate updateScheduleTime into the main timer loop
setInterval(updateScheduleTime, 1000); // Update every second


// Get initial countdown time from localStorage (if set by dashboard)
const initialTime = localStorage.getItem('initialTime');
const initialDisplayTime = localStorage.getItem('initialDisplayTime');

if (initialTime && initialDisplayTime) {
    this.initialTimeframe = parseInt(initialTime, 10); // Set countdown time in seconds
    document.getElementById('schedule').innerText = initialDisplayTime; // Display time in "Time" section
}

// Update countdown when SET button is clicked
document.getElementById('set-timeframe').addEventListener('click', function () {
    const newTimeFrameInput = document.getElementById('new-timeframe').value;
    if (newTimeFrameInput) {
        const newTimeInSeconds = parseInt(newTimeFrameInput, 10) * 60;
        this.initialTimeframe = newTimeInSeconds; // Set new countdown time
        document.getElementById('schedule').innerText = newTimeFrameInput + ' Minutes'; // Update display
    }
});
