// ── elements ────────────────────────────────────────────────────
const screens = Array.from(document.querySelectorAll(".screen"));
const dots = document.getElementById("dots");
const envelopeWrap = document.getElementById("envelopeWrap");
const song = document.getElementById("song");
const musicBtn = document.getElementById("musicBtn");

let current = 0;

// ── screen navigation ───────────────────────────────────────────
function goTo(index) {
  if (index < 0 || index >= screens.length) return;
  screens[current].classList.remove("active");
  current = index;
  screens[current].classList.add("active");
  paintDots();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function next() {
  goTo(current + 1);
}

document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", next);
});

// ── progress dots ───────────────────────────────────────────────
screens.forEach(() => {
  dots.appendChild(document.createElement("i"));
});

function paintDots() {
  // hidden on the envelope screen, and on the final screen it stays full
  dots.hidden = current === 0;
  Array.from(dots.children).forEach((dot, i) => {
    dot.classList.toggle("on", i <= current);
  });
}

// ── envelope opens everything ───────────────────────────────────
function openLetter() {
  goTo(1);
  if (!hideMusicIfMissing()) {
    musicBtn.hidden = false;
    startMusic();
  }
}

envelopeWrap.addEventListener("click", openLetter);
envelopeWrap.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openLetter();
  }
});

// ── music ───────────────────────────────────────────────────────
// browsers only allow audio after a real tap, so this runs on the
// envelope click. if music/song.mp3 is missing, the button hides.
function startMusic() {
  song.volume = 0.45;
  song
    .play()
    .then(() => {
      musicBtn.classList.add("playing");
      musicBtn.classList.remove("muted");
    })
    .catch(() => {
      if (!hideMusicIfMissing()) musicBtn.classList.add("muted");
    });
}

// if music/song.mp3 was never added, hide the button rather than
// leaving a control that does nothing
function hideMusicIfMissing() {
  if (song.error || song.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    musicBtn.hidden = true;
    return true;
  }
  return false;
}

song.addEventListener("error", hideMusicIfMissing);

musicBtn.addEventListener("click", () => {
  if (song.paused) {
    startMusic();
  } else {
    song.pause();
    musicBtn.classList.remove("playing");
    musicBtn.classList.add("muted");
  }
});

// ── photo carousel ──────────────────────────────────────────────
const track = document.getElementById("track");
const slides = Array.from(track.children);
const cdots = document.getElementById("cdots");
const prevPhoto = document.getElementById("prevPhoto");
const nextPhoto = document.getElementById("nextPhoto");

let photo = 0;

// a photo that has not been added to images/ yet gets a soft placeholder
slides.forEach((slide) => {
  const img = slide.querySelector("img");
  img.addEventListener("error", () => slide.classList.add("missing"));
  if (img.complete && img.naturalWidth === 0) slide.classList.add("missing");
});

slides.forEach(() => cdots.appendChild(document.createElement("i")));

function showPhoto(index) {
  photo = Math.max(0, Math.min(index, slides.length - 1));
  track.style.transform = `translateX(-${photo * 100}%)`;
  Array.from(cdots.children).forEach((dot, i) => {
    dot.classList.toggle("on", i === photo);
  });
  prevPhoto.disabled = photo === 0;
  nextPhoto.disabled = photo === slides.length - 1;
}

prevPhoto.addEventListener("click", () => showPhoto(photo - 1));
nextPhoto.addEventListener("click", () => showPhoto(photo + 1));

// swipe on phones
let touchX = null;

track.addEventListener(
  "touchstart",
  (e) => {
    touchX = e.changedTouches[0].clientX;
  },
  { passive: true }
);

track.addEventListener(
  "touchend",
  (e) => {
    if (touchX === null) return;
    const delta = e.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 45) showPhoto(photo + (delta < 0 ? 1 : -1));
    touchX = null;
  },
  { passive: true }
);

showPhoto(0);

// ── the ask ─────────────────────────────────────────────────────
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

// the "no" button runs away, but always stays fully on screen.
// its resting spot is measured once and cached — measuring it again
// mid-transition would read an in-flight position and drift off screen.
let home = null;

function measureHome() {
  const previous = noBtn.style.transform;
  noBtn.style.transition = "none";
  noBtn.style.transform = "none";
  const box = noBtn.getBoundingClientRect();
  home = { x: box.left, y: box.top, w: box.width, h: box.height };
  noBtn.style.transform = previous;
  // force a reflow so the transition returning doesn't animate the restore
  void noBtn.offsetWidth;
  noBtn.style.transition = "";
}

function dodge() {
  if (!home) measureHome();

  const margin = 12;
  const maxX = Math.max(margin, window.innerWidth - home.w - margin);
  const maxY = Math.max(margin, window.innerHeight - home.h - margin);

  const targetX = margin + Math.random() * (maxX - margin);
  const targetY = margin + Math.random() * (maxY - margin);

  noBtn.style.transform = `translate(${targetX - home.x}px, ${targetY - home.y}px)`;
}

// a resize moves the resting spot, so measure it again
window.addEventListener("resize", () => {
  home = null;
  noBtn.style.transform = "";
});

noBtn.addEventListener("mouseover", dodge);
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  dodge();
});
noBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    dodge();
  },
  { passive: false }
);

yesBtn.addEventListener("click", () => {
  next();
  celebrate();
});

// ── confetti hearts on yes ──────────────────────────────────────
const bgHearts = document.getElementById("bgHearts");

function celebrate() {
  const chars = ["💖", "💕", "🤍", "💘", "🌸"];
  for (let i = 0; i < 40; i++) {
    const heart = document.createElement("span");
    heart.textContent = chars[Math.floor(Math.random() * chars.length)];
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = 16 + Math.random() * 26 + "px";
    heart.style.animationDuration = 3 + Math.random() * 3 + "s";
    heart.style.animationDelay = Math.random() * 0.8 + "s";
    bgHearts.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
  }
}

// ── ambient floating hearts ─────────────────────────────────────
function spawnHeart() {
  const chars = ["💗", "💕", "🤍", "🌸"];
  const heart = document.createElement("span");
  heart.textContent = chars[Math.floor(Math.random() * chars.length)];
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.fontSize = 12 + Math.random() * 16 + "px";
  heart.style.animationDuration = 7 + Math.random() * 6 + "s";
  bgHearts.appendChild(heart);
  setTimeout(() => heart.remove(), 14000);
}

for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 900);
setInterval(spawnHeart, 1600);

paintDots();
