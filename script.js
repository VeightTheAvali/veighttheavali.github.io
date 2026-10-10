const birthDate = {
  year: 2006,
  month: 9,
  day: 25
};

const today = new Date();
let age = today.getFullYear() - birthDate.year;

if (
  today.getMonth() < birthDate.month ||
  (today.getMonth() === birthDate.month && today.getDate() < birthDate.day)
) {
  age -= 1;
}

const ageElement = document.querySelector("#age");

if (ageElement) {
  ageElement.textContent = age;
}

const spotifyApiUrl = "https://veighttheavaligithubio.vercel.app/api/now-playing";
const moodApiUrl = "https://veighttheavaligithubio.vercel.app/api/mood";
const updateMoodApiUrl = "https://veighttheavaligithubio.vercel.app/api/update-mood";
const moodElement = document.querySelector("#mood");
const moodUpdatedElement = document.querySelector("#moodUpdated");
const profilePicture = document.querySelector("#profilePicture");
const listeningLink = document.querySelector("#listeningLink");
const listeningElement = document.querySelector(".listening-status span");
const listeningProgressElement = document.querySelector(".listening-progress");
let currentTrack = null;
let moodUpdatedAt = null;

function updateMoodTimestamp() {
  if (!moodUpdatedElement || !moodUpdatedAt) {
    return;
  }

  const minutes = Math.max(0, Math.floor((Date.now() - moodUpdatedAt.getTime()) / 60000));
  moodUpdatedElement.textContent = `updated ${minutes === 0 ? "just now" : `${minutes} minute${minutes === 1 ? "" : "s"} ago`}`;
}

if (moodElement && profilePicture) {
  async function loadMood() {
    try {
      const response = await fetch(`${moodApiUrl}?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Mood request failed with status ${response.status}`);
      }

      const data = await response.json();
      moodElement.textContent = data.mood;
      moodUpdatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
      updateMoodTimestamp();
    } catch (error) {
      console.error("Could not load mood:", error);
    }
  }

  async function changeMood() {
    const username = prompt("Username:");
    if (username === null) {
      return;
    }

    const password = prompt("Password:");
    if (password === null) {
      return;
    }

    const mood = prompt("How are you feeling?");
    if (mood === null || !mood.trim()) {
      return;
    }

    try {
      const response = await fetch(updateMoodApiUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username,
          password,
          mood: mood.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Mood update failed.");
      }

      moodElement.textContent = data.mood;
      moodUpdatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
      updateMoodTimestamp();
    } catch (error) {
      alert(error.message);
    }
  }

  loadMood();
  setInterval(loadMood, 30000);
  setInterval(updateMoodTimestamp, 30000);
  profilePicture.addEventListener("click", changeMood);
  profilePicture.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      changeMood();
    }
  });
}

async function updateCurrentlyPlaying() {
  if (!spotifyApiUrl || !listeningElement) {
    return;
  }

  try {
    const response = await fetch(`${spotifyApiUrl}?t=${Date.now()}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`Spotify request failed with status ${response.status}`);
    }

    const track = await response.json();
    if (track.playing) {
      listeningElement.textContent = `${track.title} — ${track.artist}`;
      listeningLink.href = track.url;
      listeningLink.removeAttribute("aria-disabled");
      currentTrack = {
        durationMs: track.durationMs,
        progressMs: track.progressMs,
        receivedAt: Date.now()
      };
      updateListeningProgress();
    } else {
      listeningElement.textContent = "nothing right now";
      listeningLink.removeAttribute("href");
      listeningLink.setAttribute("aria-disabled", "true");
      currentTrack = null;
      updateListeningProgress();
    }
  } catch (error) {
    console.error("Could not load Spotify status:", error);
  }
}

function updateListeningProgress() {
  if (!listeningProgressElement) {
    return;
  }

  if (!currentTrack || !currentTrack.durationMs) {
    listeningProgressElement.style.width = "0%";
    return;
  }

  const elapsedMs = Date.now() - currentTrack.receivedAt;
  const progress = Math.min(
    100,
    ((currentTrack.progressMs + elapsedMs) / currentTrack.durationMs) * 100
  );
  listeningProgressElement.style.width = `${progress}%`;
}

updateCurrentlyPlaying();
setInterval(updateCurrentlyPlaying, 30000);
setInterval(updateListeningProgress, 1000);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const paws = new Set();
let lastPawTime = 0;

function addPaw(event) {
  if (reduceMotion.matches || event.pointerType !== "mouse") {
    return;
  }

  const now = performance.now();
  if (now - lastPawTime < 20) {
    updatePaws(event.clientX, event.clientY);
    return;
  }

  lastPawTime = now;
  const paw = document.createElement("span");
  paw.className = "paw-trail";
  paw.setAttribute("aria-hidden", "true");
  paw.style.left = `${event.clientX - 9}px`;
  paw.style.top = `${event.clientY - 9}px`;
  paw.dataset.x = event.clientX;
  paw.dataset.y = event.clientY;
  paws.add(paw);
  document.body.appendChild(paw);
  paw.addEventListener("animationend", () => {
    paws.delete(paw);
    paw.remove();
  }, {once: true});
}

function updatePaws(x, y) {
  paws.forEach(paw => {
    const distance = Math.hypot(x - Number(paw.dataset.x), y - Number(paw.dataset.y));
    paw.style.opacity = Math.max(0, 0.28 * (1 - distance / 180));
    if (distance > 180) {
      paws.delete(paw);
      paw.remove();
    }
  });
}

document.addEventListener("pointermove", addPaw);