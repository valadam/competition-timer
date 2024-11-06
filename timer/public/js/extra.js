document.addEventListener("DOMContentLoaded", function () {
  const timerSection = document.querySelector(".timer-section");
  const additionalTimeContainer = document.querySelector(".additional-time-container");
  const addButton = document.getElementById("add-time-competitors");

  // Initially hide the additional time container and set timer section to full height
  additionalTimeContainer.style.display = "none";
  timerSection.style.height = "calc(100vh - 40px)"; // Adjusted to fit viewport with padding

  // Add button click event to toggle visibility and adjust height only
  addButton.addEventListener("click", function () {
    if (additionalTimeContainer.style.display === "none") {
      additionalTimeContainer.style.display = "block";
      timerSection.style.height = "60vh"; // Shrink in height to fit within viewport
    } else {
      additionalTimeContainer.style.display = "none";// Return to full height
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const mainTimerElement = document.getElementById("timer");
  const startMainTimerButton = document.getElementById("start");
  const pauseMainTimerButton = document.getElementById("pause");
  const stopMainTimerButton = document.getElementById("stop");
  const addButton = document.getElementById("add-time-competitors");
  const timerSection = document.querySelector(".timer-section");

  // Container for all additional timers aligned horizontally
  const additionalTimersContainer = document.createElement("div");
  additionalTimersContainer.className = "additional-timers-container";
  timerSection.appendChild(additionalTimersContainer);

  let mainTimerRunning = false;
  let mainTimerPaused = false;

  // Main timer control
  startMainTimerButton.addEventListener("click", function () {
    mainTimerRunning = true;
    mainTimerPaused = false;
    additionalTimers.forEach(timer => resumeSecondaryTimer(timer)); // Resume all active additional timers
  });

  pauseMainTimerButton.addEventListener("click", function () {
    if (mainTimerRunning) {
      mainTimerPaused = true;
      additionalTimers.forEach(timer => pauseSecondaryTimer(timer)); // Pause all active additional timers
    }
  });

  stopMainTimerButton.addEventListener("click", function () {
    mainTimerRunning = false;
    mainTimerPaused = false;
    additionalTimers.forEach(timer => {
      clearInterval(timer.interval);
      timer.active = false;
    });
  });

  const additionalTimers = []; // Array to hold each additional timer’s data

  // Helper function to format time in HH:MM:SS
  function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  // Function to create a new timer container with independent controls
  function createTimerContainer() {
    const newTimer = {
      stationNumber: null,
      allocatedMinutes: 0,
      remainingSeconds: 0,
      active: false,
      interval: null,
    };
    additionalTimers.push(newTimer);

    // Create the container element for the new timer
    const newTimerContainer = document.createElement("div");
    newTimerContainer.className = "additional-time-container"; // Style class for the timer box
    newTimerContainer.innerHTML = `
      <h3>Competitor Additional Time</h3>
      <div>
        <label>Station Number:</label><br>
        <input type="text" class="station-number" placeholder="0" maxlength="2">
      </div>
      <div>
        <label>Allocated Time (min):</label>
        <input type="number" class="allocated-time" placeholder="00" min="1">
      </div>
      <div class="secondary-timer">00:00:00</div>
      <button class="set-allocated-time">Set</button>
      <button class="reset-allocated-time">Reset</button>
      <button class="close-time">Close</button>
    `;

    additionalTimersContainer.appendChild(newTimerContainer); // Append to the container

    const stationNumberInput = newTimerContainer.querySelector(".station-number");
    const allocatedTimeInput = newTimerContainer.querySelector(".allocated-time");
    const secondaryTimerDisplay = newTimerContainer.querySelector(".secondary-timer");
    const setButton = newTimerContainer.querySelector(".set-allocated-time");
    const resetButton = newTimerContainer.querySelector(".reset-allocated-time");
    const closeButton = newTimerContainer.querySelector(".close-time");

    // Set button: Starts the timer if the main timer is running
    setButton.addEventListener("click", function () {
      if (!mainTimerRunning || mainTimerPaused) {
        alert("The main timer must be running to start the allocated time.");
        return;
      }

      const allocatedMinutes = parseInt(allocatedTimeInput.value);
      if (isNaN(allocatedMinutes) || allocatedMinutes <= 0) {
        alert("Please enter a valid allocated time in minutes.");
        return;
      }

      const stationNumber = stationNumberInput.value.padStart(2, '0');
      if (!stationNumber || stationNumber.length > 2 || isNaN(stationNumber)) {
        alert("Please enter a valid station number.");
        return;
      }

      newTimer.stationNumber = stationNumber;
      newTimer.allocatedMinutes = allocatedMinutes;

      // Calculate total remaining time based on main timer
      const mainTimer = mainTimerElement.textContent.split(":");
      const mainTimerSeconds = parseInt(mainTimer[0]) * 3600 + parseInt(mainTimer[1]) * 60 + parseInt(mainTimer[2]);
      newTimer.remainingSeconds = mainTimerSeconds + allocatedMinutes * 60;
      secondaryTimerDisplay.textContent = formatTime(newTimer.remainingSeconds);

      if (!newTimer.active) {
        newTimer.active = true;
        newTimer.interval = setInterval(() => countdownSecondaryTimer(newTimer, secondaryTimerDisplay), 1000);
      }
    });

    // Reset button: Stops and resets the timer
    resetButton.addEventListener("click", function () {
      clearInterval(newTimer.interval);
      newTimer.remainingSeconds = newTimer.allocatedMinutes * 60;
      secondaryTimerDisplay.textContent = formatTime(newTimer.remainingSeconds);
      newTimer.active = false;
    });

    // Close button: Removes the timer container if the timer is not active
    closeButton.addEventListener("click", function () {
      if (newTimer.active) {
        alert("Cannot close the timer while it is active. Please reset the timer first.");
      } else {
        additionalTimersContainer.removeChild(newTimerContainer);
        additionalTimers.splice(additionalTimers.indexOf(newTimer), 1); // Remove from array
      }
    });
  }

  // Countdown function for each additional timer
  function countdownSecondaryTimer(timer, displayElement) {
    if (timer.remainingSeconds > 0) {
      timer.remainingSeconds--;
      displayElement.textContent = formatTime(timer.remainingSeconds);
    } else {
      clearInterval(timer.interval);
      timer.active = false;
      alert(`Station ${timer.stationNumber} timer finished.`);
    }
  }

  // Add button: Creates a new timer container for each additional station
  addButton.addEventListener("click", function () {
    createTimerContainer();
  });
});



