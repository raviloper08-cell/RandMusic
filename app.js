// ===== Mock Data =====
const defaultTracks = [
  { id: 1, title: "Midnight Gold", artist: "Silver Echo", duration: 214, cover: null, liked: false },
  { id: 2, title: "Aurora", artist: "Neon Horizon", duration: 198, cover: null, liked: true },
  { id: 3, title: "Crystal Dreams", artist: "Luna Vale", duration: 245, cover: null, liked: false },
  { id: 4, title: "Golden Hour", artist: "Velvet Sky", duration: 187, cover: null, liked: false },
  { id: 5, title: "Silver Lining", artist: "Echo Park", duration: 223, cover: null, liked: true },
  { id: 6, title: "Starlight", artist: "Nova Bloom", duration: 201, cover: null, liked: false },
  { id: 7, title: "Ember", artist: "Ash & Gold", duration: 176, cover: null, liked: false },
  { id: 8, title: "Moonlit", artist: "Nightveil", duration: 256, cover: null, liked: true },
  { id: 9, title: "Radiance", artist: "Solar Flare", duration: 192, cover: null, liked: false },
  { id: 10, title: "Whisper", artist: "Soft Rain", duration: 231, cover: null, liked: false },
];

let tracks = JSON.parse(localStorage.getItem('rmusic_tracks')) || [...defaultTracks];
let currentTrackIndex = -1;
let isPlaying = false;
let progressInterval = null;
let currentTime = 0;

// ===== DOM =====
const content = document.getElementById('content');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerCover = document.getElementById('playerCover');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const likeBtn = document.getElementById('likeBtn');
const addMusicBtn = document.getElementById('addMusicBtn');
const addMusicModal = document.getElementById('addMusicModal');
const cancelAdd = document.getElementById('cancelAdd');
const confirmAdd = document.getElementById('confirmAdd');
const searchInput = document.getElementById('searchInput');

// ===== Helpers =====
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function saveTracks() {
  localStorage.setItem('rmusic_tracks', JSON.stringify(tracks));
}

function getCoverEmoji(id) {
  const emojis = ['🎵', '🎶', '💎', '✨', '🌙', '⭐', '🔥', '🌊', '💜', '🌟'];
  return emojis[id % emojis.length];
}

// ===== Render Sections =====
function renderHome() {
  content.innerHTML = `
    <h1 class="section-title">Добро пожаловать в R&Music</h1>
    <p class="section-subtitle">Золото • Серебро • Музыка</p>

    <div class="wave-banner">
      <div class="wave-icon">✧</div>
      <div class="wave-info">
        <h2>Золотая Волна</h2>
        <p>Персональная подборка под твоё настроение. Нажми и слушай.</p>
        <button class="btn-wave" onclick="startWave()">Включить волну</button>
      </div>
    </div>

    <h2 style="margin-bottom: 18px; font-size: 20px;">Рекомендации</h2>
    <div class="tracks-grid" id="homeGrid"></div>
  `;

  const grid = document.getElementById('homeGrid');
  tracks.slice(0, 8).forEach((t, i) => {
    grid.innerHTML += createTrackCard(t, i);
  });
}

function renderWave() {
  content.innerHTML = `
    <h1 class="section-title">✧ Золотая Волна</h1>
    <p class="section-subtitle">Бесконечный поток треков, подобранных специально для тебя</p>

    <div class="wave-banner" style="margin-bottom: 32px;">
      <div class="wave-icon">✧</div>
      <div class="wave-info">
        <h2>Твоя Золотая Волна</h2>
        <p>Слушай без остановки. Мы подберём следующий трек за тебя.</p>
        <button class="btn-wave" onclick="startWave()">▶ Запустить</button>
      </div>
    </div>

    <div class="tracks-list" id="waveList"></div>
  `;

  const list = document.getElementById('waveList');
  // Shuffle a bit for "wave" feel
  const shuffled = [...tracks].sort(() => Math.random() - 0.5);
  shuffled.forEach((t, i) => {
    list.innerHTML += createTrackRow(t, i);
  });
}

function renderCollection() {
  const liked = tracks.filter(t => t.liked);
  content.innerHTML = `
    <h1 class="section-title">Коллекция</h1>
    <p class="section-subtitle">Твои любимые треки</p>
    <div class="tracks-list" id="collectionList"></div>
  `;

  const list = document.getElementById('collectionList');
  if (liked.length === 0) {
    list.innerHTML = `<p style="color: var(--text-muted); padding: 20px 0;">Пока пусто. Нажми ♡ на треке, чтобы добавить.</p>`;
  } else {
    liked.forEach((t, i) => {
      list.innerHTML += createTrackRow(t, tracks.indexOf(t));
    });
  }
}

function renderPlaylists() {
  content.innerHTML = `
    <h1 class="section-title">Плейлисты</h1>
    <p class="section-subtitle">Создавай и слушай свои подборки</p>
    <div class="tracks-grid">
      <div class="track-card" onclick="alert('В будущем можно будет создавать плейлисты')">
        <div class="cover" style="background: linear-gradient(135deg, #d4af37, #a88b2a);">+</div>
        <div class="title">Создать плейлист</div>
        <div class="artist">Новый</div>
      </div>
      <div class="track-card">
        <div class="cover">💎</div>
        <div class="title">Золотая коллекция</div>
        <div class="artist">${tracks.length} треков</div>
      </div>
      <div class="track-card">
        <div class="cover">🌙</div>
        <div class="title">Ночной вайб</div>
        <div class="artist">Для спокойного вечера</div>
      </div>
    </div>
  `;
}

function renderSearch(query = '') {
  const filtered = query
    ? tracks.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase())
      )
    : tracks;

  content.innerHTML = `
    <h1 class="section-title">Поиск</h1>
    <p class="section-subtitle">${query ? `Результаты по «${query}»` : 'Найди свой трек'}</p>
    <div class="tracks-list" id="searchList"></div>
  `;

  const list = document.getElementById('searchList');
  if (filtered.length === 0) {
    list.innerHTML = `<p style="color: var(--text-muted);">Ничего не найдено</p>`;
  } else {
    filtered.forEach(t => {
      list.innerHTML += createTrackRow(t, tracks.indexOf(t));
    });
  }
}

function createTrackCard(t, index) {
  return `
    <div class="track-card" onclick="playTrack(${index})">
      <div class="cover">${t.cover ? `<img src="${t.cover}" alt="">` : getCoverEmoji(t.id)}</div>
      <div class="title">${t.title}</div>
      <div class="artist">${t.artist}</div>
    </div>
  `;
}

function createTrackRow(t, index) {
  return `
    <div class="track-row" onclick="playTrack(${index})">
      <span class="num">${index + 1}</span>
      <span class="row-title">${t.title}</span>
      <span class="row-artist">${t.artist}</span>
      <span class="duration">${formatTime(t.duration)}</span>
    </div>
  `;
}

// ===== Player =====
function playTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentTrackIndex = index;
  const t = tracks[index];

  playerTitle.textContent = t.title;
  playerArtist.textContent = t.artist;
  playerCover.textContent = t.cover ? '' : getCoverEmoji(t.id);
  if (t.cover) {
    playerCover.innerHTML = `<img src="${t.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
  }

  durationEl.textContent = formatTime(t.duration);
  currentTime = 0;
  updateProgress();
  likeBtn.textContent = t.liked ? '♥' : '♡';
  likeBtn.classList.toggle('liked', t.liked);

  isPlaying = true;
  playBtn.textContent = '⏸';
  startProgress();
}

function togglePlay() {
  if (currentTrackIndex === -1) {
    playTrack(0);
    return;
  }
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? '⏸' : '▶';
  if (isPlaying) startProgress();
  else clearInterval(progressInterval);
}

function startProgress() {
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (!isPlaying) return;
    currentTime += 1;
    const t = tracks[currentTrackIndex];
    if (currentTime >= t.duration) {
      nextTrack();
      return;
    }
    updateProgress();
  }, 1000);
}

function updateProgress() {
  const t = tracks[currentTrackIndex];
  if (!t) return;
  const pct = (currentTime / t.duration) * 100;
  progressFill.style.width = pct + '%';
  currentTimeEl.textContent = formatTime(currentTime);
}

function nextTrack() {
  if (currentTrackIndex === -1) return;
  const next = (currentTrackIndex + 1) % tracks.length;
  playTrack(next);
}

function prevTrack() {
  if (currentTrackIndex === -1) return;
  const prev = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  playTrack(prev);
}

function startWave() {
  // Start from a random track
  const random = Math.floor(Math.random() * tracks.length);
  playTrack(random);
  // Switch to wave section
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-section="wave"]').classList.add('active');
  renderWave();
}

function toggleLike() {
  if (currentTrackIndex === -1) return;
  const t = tracks[currentTrackIndex];
  t.liked = !t.liked;
  likeBtn.textContent = t.liked ? '♥' : '♡';
  likeBtn.classList.toggle('liked', t.liked);
  saveTracks();
}

// ===== Navigation =====
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const section = item.dataset.section;

    if (section === 'home') renderHome();
    else if (section === 'wave') renderWave();
    else if (section === 'collection') renderCollection();
    else if (section === 'playlists') renderPlaylists();
    else if (section === 'search') renderSearch();
  });
});

// ===== Events =====
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
likeBtn.addEventListener('click', toggleLike);

progressBar.addEventListener('click', (e) => {
  if (currentTrackIndex === -1) return;
  const rect = progressBar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  currentTime = pct * tracks[currentTrackIndex].duration;
  updateProgress();
});

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim();
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-section="search"]').classList.add('active');
  renderSearch(q);
});

// Add Music Modal
addMusicBtn.addEventListener('click', () => {
  addMusicModal.classList.add('open');
});

cancelAdd.addEventListener('click', () => {
  addMusicModal.classList.remove('open');
});

confirmAdd.addEventListener('click', () => {
  const title = document.getElementById('newTitle').value.trim();
  const artist = document.getElementById('newArtist').value.trim();
  const cover = document.getElementById('newCover').value.trim();

  if (!title || !artist) {
    alert('Название и исполнитель обязательны');
    return;
  }

  const newTrack = {
    id: Date.now(),
    title,
    artist,
    duration: 180 + Math.floor(Math.random() * 120),
    cover: cover || null,
    liked: false
  };

  tracks.unshift(newTrack);
  saveTracks();
  addMusicModal.classList.remove('open');
  document.getElementById('newTitle').value = '';
  document.getElementById('newArtist').value = '';
  document.getElementById('newCover').value = '';

  // Refresh current view
  const active = document.querySelector('.nav-item.active');
  if (active) active.click();
});

// Init
renderHome();
