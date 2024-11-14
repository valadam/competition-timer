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
        this.addCompetitorExtraTimeButton = document.getElementById('add-time-competitors');
        this.returnDashboardButton = document.getElementById('return-dashboard');

        // Input fields
        this.newTimeframeInput = document.getElementById('new-timeframe');
        this.additionalTimeInput = document.getElementById('additional-time');
    }

    initializeState(initialSeconds) {
        this.totalTime = initialSeconds;
        this.initialTimeframe = 180;
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
        this.addCompetitorExtraTimeButton.addEventListener('click', () => this.addCompetitorExtraTime());
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

    startTimer() {
        // Clear any existing interval first
        if (this.interval) {
            clearInterval(this.interval);
        }

        // Start/resume the timer
        this.interval = setInterval(() => {
            if (this.totalTime > 0) {
                this.totalTime--;
                this.updateDisplays();
            } else {
                this.stopTimer();
                alert("Time's up!");
            }
        }, 1000);

        // Reset pause state
        this.isPaused = false;
    }

    pauseTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isPaused = true;
        }
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = null;
        this.totalTime = 0;
        this.isPaused = false;
        this.updateDisplays();
    }

    resetTimer() {
        this.stopTimer();
        this.additionalTime = 0;
        this.totalTime = this.initialTimeframe;
        this.maxTime = this.initialTimeframe;
        this.updateDisplays();
        this.clearInputs();
    }

    addCompetitorExtraTime() {
        const FIVE_MINUTES = 300;
        this.totalTime += FIVE_MINUTES;
        this.additionalTime += FIVE_MINUTES;
        this.maxTime += FIVE_MINUTES;
        this.updateDisplays();
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

        // Update event title using class selector
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