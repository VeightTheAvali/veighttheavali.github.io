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

const moodUsername = "VeightAdmin";
const moodPassword = "ZipJeStrasneGay123_";
const moodElement = document.querySelector("#mood");
const profilePicture = document.querySelector("#profilePicture");

if (moodElement && profilePicture) {
  moodElement.textContent = localStorage.getItem("mood-status") || "vibing";

  function changeMood() {
    if (prompt("Username:") !== moodUsername) {
      alert("Invalid username or password.");
      return;
    }

    if (prompt("Password to change mood:") !== moodPassword) {
      alert("Invalid username or password.");
      return;
    }

    const mood = prompt("How are you feeling?");
    if (mood === null) {
      return;
    }

    const newMood = mood.trim();
    if (!newMood) {
      return;
    }

    moodElement.textContent = newMood;
    localStorage.setItem("mood-status", newMood);
  }

  profilePicture.addEventListener("click", changeMood);
  profilePicture.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      changeMood();
    }
  });
}

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