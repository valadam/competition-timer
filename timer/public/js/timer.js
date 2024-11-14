
class TimerController {
    constructor() {
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

        // Timer state variables
        this.totalTime = 0; // Initialize to 00:00:00
        this.initialTimeframe = 180; // Default to 3 minutes, can be updated with SET button
        this.maxTime = this.initialTimeframe; // Used as the reference for the progress bar
        this.interval = null;
        this.isPaused = false;
        this.additionalTime = 0;

        // Bind event listeners
        this.bindEventListeners();

        // Initialize display
        this.updateTimerDisplay();
        this.updateAdditionalTimeDisplay();
        this.updateProgressBar();
    }

    bindEventListeners() {
        this.startButton.addEventListener('click', () => this.startTimer());
        this.pauseButton.addEventListener('click', () => this.pauseTimer());
        this.stopButton.addEventListener('click', () => this.stopTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.setTimeframeButton.addEventListener('click', () => this.setTimeframe());
        this.addTimeButton.addEventListener('click', () => this.addTime());
        this.addCompetitorExtraTimeButton.addEventListener('click', () => this.addCompetitorExtraTime());
        this.returnDashboardButton.addEventListener('click', () => {
            window.location.href = "/dashboard"; // Placeholder, update with actual path
        });
    }

    // Format time for display
    formatTime(seconds) {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    // Start the timer
    startTimer() {
        if (this.interval || this.isPaused) return; // Prevent multiple intervals
        this.interval = setInterval(() => {
            if (this.totalTime > 0) {
                this.totalTime--;
                this.updateTimerDisplay();
                this.updateProgressBar();
            } else {
                this.stopTimer();
                alert("Time's up!");
            }
        }, 1000);
    }

    // Pause the timer
    pauseTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isPaused = true;
        }
    }

    // Stop the timer and reset to 00:00:00
    stopTimer() {
        clearInterval(this.interval);
        this.interval = null;
        this.totalTime = 0; // Reset to 00:00:00
        this.isPaused = false;
        this.updateTimerDisplay();
        this.updateProgressBar();
    }

    // Reset function sets timer to 00:00:00 and clears inputs
    resetTimer() {
        this.stopTimer();
        this.additionalTime = 0;
        this.updateAdditionalTimeDisplay();
        this.clearInputs(); // Clear new timeframe and additional time inputs
        this.initialTimeframe = 180; // Reset default timeframe to 3 minutes
        this.maxTime = this.initialTimeframe; // Reset max reference for progress
    }

    // Update timer display
    updateTimerDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.totalTime);
    }

    // Update additional time display
    updateAdditionalTimeDisplay() {
        this.additionalTimeDisplay.textContent = `+${this.formatTime(this.additionalTime)}`;
    }

    // Set a new timeframe and update progress bar to 100%
    setTimeframe() {
        const newTime = parseInt(this.newTimeframeInput.value);
        if (!isNaN(newTime) && newTime > 0) {
            this.totalTime = newTime * 60; // Convert minutes to seconds
            this.initialTimeframe = this.totalTime; // Update initial timeframe reference
            this.maxTime = this.totalTime; // Set maxTime reference for progress calculation
            this.updateTimerDisplay();
            this.updateProgressBar(); // Fill progress bar to 100% immediately
            this.clearInputs(); // Clear input after setting new timeframe
        } else {
            alert("Please enter a valid timeframe in minutes.");
        }
    }

    // Add additional time, clear input after addition
    addTime() {
        const extraTime = parseInt(this.additionalTimeInput.value);
        if (!isNaN(extraTime) && extraTime > 0) {
            this.totalTime += extraTime * 60; // Convert minutes to seconds
            this.additionalTime += extraTime * 60;
            this.maxTime += extraTime * 60; // Update maxTime reference dynamically
            this.updateTimerDisplay();
            this.updateAdditionalTimeDisplay();
            this.additionalTimeInput.value = ""; // Clear input after adding
            this.updateProgressBar(); // Update progress bar based on new maxTime
        } else {
            alert("Please enter a valid additional time in minutes.");
        }
    }

    // Competitor extra time feature
    addCompetitorExtraTime() {
        this.totalTime += 300; // Add 5 minutes
        this.additionalTime += 300;
        this.maxTime += 300; // Update maxTime reference
        this.updateTimerDisplay();
        this.updateAdditionalTimeDisplay();
        this.updateProgressBar(); // Update progress bar based on new maxTime
    }

    // Update progress bar width based on time left and dynamic maxTime
    updateProgressBar() {
        const progress = (this.totalTime / this.maxTime) * 100;
        this.progressBar.style.width = `${Math.min(progress, 100)}%`; // Cap width at 100%
        this.progressBar.textContent = progress >= 100 ? "100%" : `${Math.round(progress)}%`; // Ensure 100% label is visible
    }

    // Clear all inputs
    clearInputs() {
        this.newTimeframeInput.value = "";
        this.additionalTimeInput.value = "";
    }
}

// Initialize the timer controller when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new TimerController();
});
