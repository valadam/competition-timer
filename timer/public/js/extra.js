document.addEventListener("DOMContentLoaded", function () {
  // Get all required elements
  const timerSection = document.querySelector(".timer-section");
  const addButton = document.getElementById("add-time-competitors");
  const additionalTimersContainer = document.querySelector(".additional-timers-container");
  const mainTimerElement = document.getElementById("timer");
  const mainStartButton = document.getElementById("start");
  const mainPauseButton = document.getElementById("pause");
  const mainStopButton = document.getElementById("stop");

  // Array to hold all additional timers
  const additionalTimers = [];

  // Adjust main timer height based on additional timers
  function adjustMainTimerHeight() {
    if (additionalTimers.length > 0) {
      timerSection.classList.add('has-additional-timers');
      additionalTimersContainer.style.display = 'flex';
      const progressBar = document.querySelector('.progress');
      if (progressBar) {
        progressBar.style.display = 'block';
        progressBar.style.visibility = 'visible';
        progressBar.style.opacity = '1';
      }
    } else {
      timerSection.classList.remove('has-additional-timers');
      additionalTimersContainer.style.display = 'none';
    }
  }

  function isMainTimerRunning() {
    const mainTimer = document.getElementById('timer');
    const startButton = document.getElementById('start');
    const pauseButton = document.getElementById('pause');

    if (!mainTimer || !startButton || !pauseButton) return false;

    // Check if timer has a non-zero value
    const timerValue = mainTimer.textContent;
    const isNonZeroTime = timerValue !== '00:00:00';

    // Check button states using the inactive class
    const isStartInactive = startButton.classList.contains('inactive');
    const isPauseActive = !pauseButton.classList.contains('inactive');

    console.log('Timer State:', {
      timerValue,
      isNonZeroTime,
      isStartInactive,
      isPauseActive
    });

    // Timer is running if time is non-zero and start is inactive (pause is active)
    return isNonZeroTime && isStartInactive && isPauseActive;
  }

  function setupTimerControls(container, timer) {
    const stationInput = container.querySelector(".station-number");
    const timeInput = container.querySelector(".allocated-time");
    const timerDisplay = container.querySelector(".secondary-timer");
    const setButton = container.querySelector(".set-allocated-time");
    const resetButton = container.querySelector(".reset-allocated-time");
    const closeButton = container.querySelector(".close-time");

    setButton.addEventListener("click", () => {
      // First check station and time inputs
      const station = stationInput.value.trim();
      const additionalMinutes = parseInt(timeInput.value);

      if (!station || !/^\d{1,2}$/.test(station)) {
        alert("Please enter a valid station number (1-99)");
        return;
      }

      if (isNaN(additionalMinutes) || additionalMinutes <= 0) {
        alert("Please enter valid minutes");
        return;
      }

      // Then check if main timer is actively running
      if (!isMainTimerRunning()) {
        alert("Main timer must be running (not stopped or paused) to set additional time");
        return;
      }

      timer.stationNumber = station;
      timer.allocatedMinutes = additionalMinutes;
      timer.active = true;
      timer.isPaused = false;

      startTimer(timer, timerDisplay);

      // Disable inputs
      stationInput.disabled = true;
      timeInput.disabled = true;
      setButton.disabled = true;
    });

    resetButton.addEventListener("click", () => {
      clearInterval(timer.interval);
      timer.active = false;
      timer.remainingSeconds = 0;
      timer.stationNumber = null;
      timer.allocatedMinutes = 0;
      timer.isPaused = false;

      timerDisplay.textContent = "00:00:00";
      stationInput.value = "";
      timeInput.value = "";
      stationInput.disabled = false;
      timeInput.disabled = false;
      setButton.disabled = false;
    });

    closeButton.addEventListener("click", () => {
      if (timer.active) {
        alert("Please reset the timer before closing");
        return;
      }
      additionalTimersContainer.removeChild(container);
      const index = additionalTimers.indexOf(timer);
      if (index > -1) {
        additionalTimers.splice(index, 1);
      }
      adjustMainTimerHeight();
    });
  }

  function startTimer(timer, display) {
    clearInterval(timer.interval);
    timer.isPaused = false;

    // Set initial times
    const mainTimerSeconds = getMainTimerSeconds();
    const additionalSeconds = timer.allocatedMinutes * 60;
    timer.remainingSeconds = mainTimerSeconds + additionalSeconds;
    timer.initialMainTime = mainTimerSeconds;
    timer.totalAdditionalTime = additionalSeconds;

    timer.interval = setInterval(() => {
      if (!isMainTimerRunning()) {
        if (!timer.isPaused) {
          timer.isPaused = true;
        }
        return;
      }

      if (timer.remainingSeconds > 0 && !timer.isPaused) {
        const currentMainTime = getMainTimerSeconds();
        const timeElapsed = timer.initialMainTime - currentMainTime;
        timer.remainingSeconds = timer.totalAdditionalTime + currentMainTime;

        if (timer.remainingSeconds > 0) {
          display.textContent = formatTime(timer.remainingSeconds);
        } else {
          clearInterval(timer.interval);
          timer.active = false;
          display.textContent = "00:00:00";
          alert(`Time's up for Station ${timer.stationNumber}!`);
        }
      }
    }, 1000);
  }

  function getMainTimerSeconds() {
    if (!mainTimerElement) return 0;
    const mainTime = mainTimerElement.textContent.split(':');
    return parseInt(mainTime[0]) * 3600 + parseInt(mainTime[1]) * 60 + parseInt(mainTime[2]);
  }

  function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  function createTimerContainer() {
    const newTimer = {
      stationNumber: null,
      allocatedMinutes: 0,
      remainingSeconds: 0,
      active: false,
      interval: null,
      isPaused: false
    };
    additionalTimers.push(newTimer);

    const newTimerContainer = document.createElement("div");
    newTimerContainer.className = "additional-time-container";
    newTimerContainer.innerHTML = `
      <div class="timer-header">Competitor Additional Time</div>
      <div class="input-row">
        <div class="input-labels">
          <span>Station Number</span>
          <span>Time (min)</span>
        </div>
        <div class="input-fields">
          <input type="text" class="station-number" placeholder="00" maxlength="2">
          <input type="number" class="allocated-time" placeholder="00" min="1">
        </div>
      </div>
      <div class="secondary-timer">00:00:00</div>
      <div class="button-group">
        <button class="set-allocated-time">Set</button>
        <button class="reset-allocated-time">Reset</button>
        <button class="close-time">Close</button>
      </div>
    `;

    additionalTimersContainer.appendChild(newTimerContainer);
    setupTimerControls(newTimerContainer, newTimer);
  }

  // Add button click handler
  if (addButton) {
    addButton.addEventListener("click", function () {
      createTimerContainer();
      adjustMainTimerHeight();
    });
  }
});