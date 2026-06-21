import { satcActivities } from "./satcActivities.js";

// ========== DOM ELEMENTS ==========
// These are the HTML elements JavaScript will read, change, or listen to.

const timerSection = document.querySelector("#timer-section");
const breakSection = document.querySelector("#break-section");

const modeLabel = document.querySelector("#mode-label");
const timerDisplay = document.querySelector("#timer-display");
const statusMessage = document.querySelector("#status-message");

const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");
const revealBreakButton = document.querySelector("#reveal-break-button");
const newActivityButton = document.querySelector("#new-activity-button");
const backToFocusButton = document.querySelector("#back-to-focus-button");

const activityCategory = document.querySelector("#activity-category");
const activityTitle = document.querySelector("#activity-title");
const activityPrompt = document.querySelector("#activity-prompt");
const reflectionQuestion = document.querySelector("#reflection-question");

const sessionCount = document.querySelector("#session-count");

// ========== APP STATE ==========
// State = what the app needs to remember.

const FOCUS_SECONDS = 10;

let mode = "focus";
let timeLeft = FOCUS_SECONDS;
let isTimerRunning = false;
let timerIntervalId = null;
let currentActivityIndex = 0;
let completedSessions = 0;

// ========== RENDER HELPERS ==========
// Render = update what the user sees on the page.

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function renderActivity() {
  const activity = satcActivities[currentActivityIndex];

  activityCategory.textContent = activity.category;
  activityTitle.textContent = activity.title;
  activityPrompt.textContent = activity.prompt;
  reflectionQuestion.textContent = activity.reflectionQuestion;
}

function showFocusMode() {
  mode = "focus";

  timerSection.hidden = false;
  breakSection.hidden = true;

  modeLabel.textContent = "AND JUST LIKE CLOCKWORK...";
  statusMessage.textContent = "Abso-f*ing-lutely time to focus.";

  timeLeft = FOCUS_SECONDS;
  isTimerRunning = false;
  clearInterval(timerIntervalId);

  renderTimer();
}

function showBreakMode() {
  mode = "break";

  timerSection.hidden = true;
  breakSection.hidden = false;

  isTimerRunning = false;
  clearInterval(timerIntervalId);

  renderActivity();
}

function updateSessionCount() {
  sessionCount.textContent = completedSessions;
}

// ========== TIMER BEHAVIOR ==========

function startTimer() {
  if (isTimerRunning) {
    return;
  }

  isTimerRunning = true;
  statusMessage.textContent = "Focus mode is running.";

  timerIntervalId = setInterval(() => {
    timeLeft = timeLeft - 1;
    renderTimer();

    if (timeLeft <= 0) {
      completedSessions = completedSessions + 1;
      updateSessionCount();
      showBreakMode();
    }
  }, 1000);
}

function pauseTimer() {
  isTimerRunning = false;
  clearInterval(timerIntervalId);
  statusMessage.textContent = "Paused. Still very downtown of you.";
}

function resetTimer() {
  isTimerRunning = false;
  clearInterval(timerIntervalId);

  timeLeft = FOCUS_SECONDS;
  renderTimer();

  statusMessage.textContent = "Reset. No column filed yet.";
}

// ========== ACTIVITY BEHAVIOR ==========

function showNextActivity() {
  currentActivityIndex = currentActivityIndex + 1;

  if (currentActivityIndex >= satcActivities.length) {
    currentActivityIndex = 0;
  }

  renderActivity();
}

function revealBreakActivity() {
  showBreakMode();
}

// ========== EVENT LISTENERS ==========
// Event listener = JavaScript waiting for a click.

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

revealBreakButton.addEventListener("click", revealBreakActivity);
newActivityButton.addEventListener("click", showNextActivity);
backToFocusButton.addEventListener("click", showFocusMode);

// ========== INITIAL PAGE LOAD ==========

renderTimer();
renderActivity();
updateSessionCount();
