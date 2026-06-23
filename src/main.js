import { satcActivities } from "./satcActivities.js";

// ========== DOM ELEMENTS ==========
// These are the HTML elements JavaScript will read, change, or listen to.

const timerSection = document.querySelector("#timer-section");
const breakSection = document.querySelector("#break-section");
const reportSection = document.querySelector("#report-section");

const modeLabel = document.querySelector("#mode-label");
const timerDisplay = document.querySelector("#timer-display");
const statusMessage = document.querySelector("#status-message");
const breakStatusMessage = document.querySelector("#break-status-message");

const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");
const revealBreakButton = document.querySelector("#reveal-break-button");
const newActivityButton = document.querySelector("#new-activity-button");
const backToFocusButton = document.querySelector("#back-to-focus-button");
const saveResponseButton = document.querySelector("#save-response-button");
const viewReportButton = document.querySelector("#view-report-button");
const backToBreakButton = document.querySelector("#back-to-break-button");
const reportBackToFocusButton = document.querySelector("#report-back-to-focus-button");

const activityCategory = document.querySelector("#activity-category");
const activityTitle = document.querySelector("#activity-title");
const activityPrompt = document.querySelector("#activity-prompt");
const reflectionQuestion = document.querySelector("#reflection-question");
const activityResponse = document.querySelector("#activity-response");

const sessionCount = document.querySelector("#session-count");
const reportSessionCount = document.querySelector("#report-session-count");
const responseCount = document.querySelector("#response-count");
const reportEntries = document.querySelector("#report-entries");

// ========== APP STATE ==========
// State = what the app needs to remember.

const FOCUS_SECONDS = 25 * 60;
// For testing only, you can temporarily use:
// const FOCUS_SECONDS = 10;

let mode = "focus";
let timeLeft = FOCUS_SECONDS;
let savedFocusTimeBeforeBreak = FOCUS_SECONDS;
let breakStartedFromCompletedSession = false;

let isTimerRunning = false;
let timerIntervalId = null;
let currentActivityIndex = 0;
let completedSessions = 0;
let savedResponses = [];

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

function getCurrentActivity() {
  return satcActivities[currentActivityIndex];
}

function renderActivity() {
  const activity = getCurrentActivity();

  activityCategory.textContent = activity.category;
  activityTitle.textContent = activity.title;
  activityPrompt.textContent = activity.prompt;
  reflectionQuestion.textContent = activity.reflectionQuestion;
}

function updateSessionCount() {
  sessionCount.textContent = completedSessions;
  reportSessionCount.textContent = completedSessions;
}

function updateResponseCount() {
  responseCount.textContent = savedResponses.length;
}

function renderReport() {
  updateSessionCount();
  updateResponseCount();

  if (savedResponses.length === 0) {
    reportEntries.innerHTML = "<p>No responses saved yet.</p>";
    return;
  }

  reportEntries.innerHTML = "";

  savedResponses.forEach((entry, index) => {
    const article = document.createElement("article");
    article.classList.add("report-entry");

    article.innerHTML = `
      <p class="newspaper-kicker">Entry ${index + 1}</p>
      <h3>${entry.title}</h3>
      <p><strong>Prompt:</strong> ${entry.prompt}</p>
      <p><strong>Question:</strong> ${entry.question}</p>
      <p><strong>Your response:</strong> ${entry.response}</p>
    `;

    reportEntries.appendChild(article);
  });
}

// ========== MODE BEHAVIOR ==========

function showFocusMode() {
  mode = "focus";

  timerSection.hidden = false;
  breakSection.hidden = true;
  reportSection.hidden = true;

  modeLabel.textContent = "AND JUST LIKE CLOCKWORK...";
  statusMessage.textContent = "Absofuckinglutely time to focus.";

  isTimerRunning = false;
  clearInterval(timerIntervalId);

  if (breakStartedFromCompletedSession) {
    timeLeft = FOCUS_SECONDS;
  } else {
    timeLeft = savedFocusTimeBeforeBreak;
  }

  breakStartedFromCompletedSession = false;

  renderTimer();
}

function showBreakMode(options = {}) {
  mode = "break";

  timerSection.hidden = true;
  breakSection.hidden = false;
  reportSection.hidden = true;

  isTimerRunning = false;
  clearInterval(timerIntervalId);

  breakStartedFromCompletedSession = Boolean(options.completedSession);

  if (!breakStartedFromCompletedSession) {
    savedFocusTimeBeforeBreak = timeLeft;
  }

  renderActivity();
}

function showReportMode() {
  mode = "report";

  timerSection.hidden = true;
  breakSection.hidden = true;
  reportSection.hidden = false;

  renderReport();
}
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendBreakNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Carrie’s Column Timer", {
      body: "25 minutes are up. Manhattan Intermission time.",
    });
  }
}

function playCompletionSound() {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

  gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.65);
}

function completeFocusSession() {
  completedSessions = completedSessions + 1;
  updateSessionCount();

  document.title = "Break Time — Carrie’s Column Timer";

  playCompletionSound();
  sendBreakNotification();

  showBreakMode({
    completedSession: true,
  });
}
// ========== TIMER BEHAVIOR ==========

function startTimer() {
  if (isTimerRunning) {
    return;
  }
requestNotificationPermission();
  isTimerRunning = true;
  statusMessage.textContent = "Focus mode is running.";

  timerIntervalId = setInterval(() => {
    timeLeft = timeLeft - 1;
    renderTimer();

   if (timeLeft <= 0) {
  completeFocusSession();
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
  savedFocusTimeBeforeBreak = FOCUS_SECONDS;
  breakStartedFromCompletedSession = false;

  renderTimer();

  statusMessage.textContent = "Reset. No column filed yet.";
}

// ========== ACTIVITY + RESPONSE BEHAVIOR ==========

function showNextActivity() {
  currentActivityIndex = currentActivityIndex + 1;

  if (currentActivityIndex >= satcActivities.length) {
    currentActivityIndex = 0;
  }

  activityResponse.value = "";
  breakStatusMessage.textContent = "Response not saved yet.";

  renderActivity();
}

function revealBreakActivity() {
  showBreakMode({
    completedSession: false,
  });
}

function saveResponse() {
  const responseText = activityResponse.value.trim();

  if (responseText === "") {
    breakStatusMessage.textContent = "Write something first, Carrie.";
    return;
  }

  const activity = getCurrentActivity();

  savedResponses.push({
    activityId: activity.id,
    title: activity.title,
    prompt: activity.prompt,
    question: activity.reflectionQuestion,
    response: responseText,
  });

  activityResponse.value = "";
  breakStatusMessage.textContent = "Saved to the column.";
  updateResponseCount();
}

// ========== EVENT LISTENERS ==========
// Event listener = JavaScript waiting for a click.

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

revealBreakButton.addEventListener("click", revealBreakActivity);
newActivityButton.addEventListener("click", showNextActivity);
backToFocusButton.addEventListener("click", showFocusMode);

saveResponseButton.addEventListener("click", saveResponse);
viewReportButton.addEventListener("click", showReportMode);
backToBreakButton.addEventListener("click", () => showBreakMode({ completedSession: breakStartedFromCompletedSession }));
reportBackToFocusButton.addEventListener("click", showFocusMode);

// ========== INITIAL PAGE LOAD ==========

renderTimer();
renderActivity();
updateSessionCount();
updateResponseCount();
