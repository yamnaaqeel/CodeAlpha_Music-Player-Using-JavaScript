const songs = [
  { title: "Midnight Drive", artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    c1: "#7c3aed", c2: "#22d3ee" },
  { title: "Golden Hour", artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    c1: "#f97316", c2: "#facc15" },
  { title: "Ocean Breeze", artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    c1: "#0ea5e9", c2: "#34d399" },
  { title: "Neon Nights", artist: "SoundHelix",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    c1: "#ec4899", c2: "#8b5cf6" }
];
const audio = document.getElementById("audio");
const vinyl = document.getElementById("vinyl");
const arm = document.getElementById("arm");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const autoplayBtn = document.getElementById("autoplayBtn");
const progress = document.getElementById("progress");
const bar = document.getElementById("bar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeEl = document.getElementById("volume");
const playlistEl = document.getElementById("playlistList");

let index = 0;
let autoplay = true;

// ---------- Helpers ----------
function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function setTheme(song) {
  document.documentElement.style.setProperty("--c1", song.c1);
  document.documentElement.style.setProperty("--c2", song.c2);
}

// ---------- Build playlist ----------
function buildPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="dot" style="background:linear-gradient(135deg, ${song.c1}, ${song.c2})"></span>
      <div class="meta"><strong>${song.title}</strong><small>${song.artist}</small></div>`;
    li.addEventListener("click", () => { loadSong(i); playSong(); });
    playlistEl.appendChild(li);
  });
}

function highlightActive() {
  [...playlistEl.children].forEach((li, i) => li.classList.toggle("active", i === index));
}

// ---------- Core controls ----------
function loadSong(i) {
  index = (i + songs.length) % songs.length;
  const song = songs[index];
  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  bar.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  setTheme(song);
  highlightActive();
}

function playSong() {
  audio.play().then(() => {
    vinyl.classList.add("playing");
    arm.classList.add("playing");
    playBtn.textContent = "⏸";
    playBtn.setAttribute("aria-label", "Pause");
  }).catch(() => { /* browser ne autoplay roka */ });
}

function pauseSong() {
  audio.pause();
  vinyl.classList.remove("playing");
  arm.classList.remove("playing");
  playBtn.textContent = "▶";
  playBtn.setAttribute("aria-label", "Play");
}

function togglePlay() { audio.paused ? playSong() : pauseSong(); }
function nextSong() { loadSong(index + 1); playSong(); }
function prevSong() {
  // 3 second se zyada chal chuka ho to gaana dobara shuru kare
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadSong(index - 1); playSong();
}

// ---------- Events ----------
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

autoplayBtn.addEventListener("click", () => {
  autoplay = !autoplay;
  autoplayBtn.classList.toggle("active", autoplay);
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  bar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", () => {
  if (autoplay) nextSong();
  else pauseSong();
});

// Progress bar par click karke seek
progress.addEventListener("click", (e) => {
  const rect = progress.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = ratio * audio.duration;
});

// Volume control
function updateVolume() {
  audio.volume = volumeEl.value;
  volumeEl.style.setProperty("--v", volumeEl.value * 100 + "%");
}
volumeEl.addEventListener("input", updateVolume);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  else if (e.code === "ArrowRight") nextSong();
  else if (e.code === "ArrowLeft") prevSong();
});

// ---------- Init ----------
buildPlaylist();
loadSong(0);
updateVolume();