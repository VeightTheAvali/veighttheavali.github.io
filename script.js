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