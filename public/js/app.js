
const featureEl = document.querySelector(".feature");
const phrases = ["Fast", "Lightweight", "Easy-To-Use"];
let currentPhrase = 0;
let currentChar = 0;
let isDeleting = false;
let speed = 120; // typing speed in ms

function type() {
  let text = phrases[currentPhrase];
  
  if (isDeleting) {
    currentChar--;
  } else {
    currentChar++;
  }
  
  featureEl.textContent = text.substring(0, currentChar);
  
  if (!isDeleting && currentChar === text.length) {
    isDeleting = true;
    speed = 100;
    setTimeout(type, 1200); // pause before deleting
    return;
  } else if (isDeleting && currentChar === 0) {
    isDeleting = false;
    currentPhrase = (currentPhrase + 1) % phrases.length;
    speed = 120;
  }
  
  setTimeout(type, speed);
}

type();