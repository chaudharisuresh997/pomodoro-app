const fs = require("fs");
const path = require("path");

var datafile = path.join(__dirname, "data/appData.json");

console.log("data======>");
fs.readFile(datafile, (err, data) => {
  let firstTime = JSON.parse(data);
  let isOpened = firstTime.notified;

  if (err) {
    let appData = {
      notified: false,
    };
    let data = JSON.stringify(appData);
    fs.writeFileSync(datafile, data);
  }

  if (!isOpened) {
    new Notification("This is a test Notification", {
      body:
        "Seems like the app was launched first time, Thanks for downloading",
    });
    let appData = {
      notified: true,
    };
    let data = JSON.stringify(appData);
    fs.writeFileSync(datafile, data);
  }
});

let workTime = 45; // min
let restTime = 25; // min

let TIME_LIMIT = workTime * 60;
const FULL_DASH_ARRAY = 283;
let WARNING_THRESHOLD = TIME_LIMIT / 4;
let ALERT_THRESHOLD = TIME_LIMIT / 6;

let working = true;

let COLOR_CODES = {
  info: {
    color: "green",
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD,
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD,
  },
};

let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

function resetClock() {
  document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;
}

resetClock();
startTimer();

function onTimesUp() {
  clearInterval(timerInterval);
  if (working) {
    new Notification("Time To Rest", {
      body: "Well done, now rest for " + restTime + " min",
    });

    TIME_LIMIT = restTime * 60;
    WARNING_THRESHOLD = TIME_LIMIT / 4;
    ALERT_THRESHOLD = TIME_LIMIT / 6;
    working = false;
    COLOR_CODES = {
      info: {
        color: "pink",
      },
      warning: {
        color: "purple",
        threshold: WARNING_THRESHOLD,
      },
      alert: {
        color: "blue",
        threshold: ALERT_THRESHOLD,
      },
    };
  } else {
    new Notification("Time To Work", {
      body: "Enough Resting let's finish the task we started",
    });

    TIME_LIMIT = workTime * 60;
    working = true;
    WARNING_THRESHOLD = TIME_LIMIT / 4;
    ALERT_THRESHOLD = TIME_LIMIT / 6;
    COLOR_CODES = {
      info: {
        color: "green",
      },
      warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD,
      },
      alert: {
        color: "red",
        threshold: ALERT_THRESHOLD,
      },
    };
  }

  timePassed = 0;
  timeLeft = TIME_LIMIT;
  timerInterval = null;
  remainingPathColor = COLOR_CODES.info.color;
  resetClock();
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft <= 0) {
      onTimesUp();
    }
  }, 1000);
  timePassed = 0;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

function changeTime() {
  workTime = Math.floor(document.getElementById("workingTime").value);
  restTime = Math.floor(document.getElementById("restingTime").value);
  console.log(workTime, restTime);
  document.getElementById("inputTimes").style.display = "none";
  document.getElementById("app").style.display = "grid";

  TIME_LIMIT = workTime * 60;
  WARNING_THRESHOLD = TIME_LIMIT / 4;
  ALERT_THRESHOLD = TIME_LIMIT / 6;
  working = true;

  clearInterval(timerInterval);
  resetClock();
  startTimer();
}

function displayTimeChanger() {
  document.getElementById("inputTimes").style.display = "block";
  document.getElementById("app").style.display = "none";
}

function setTimes(e) {
  if (e.key == "r") {
    displayTimeChanger();
  }
}

document.getElementById("body");
document.addEventListener("keypress", setTimes);
