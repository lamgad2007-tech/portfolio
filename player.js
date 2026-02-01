// Enhanced player: play/pause, seek, volume, mute, and visualizer (Web Audio API)
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const seek = document.getElementById('seek');
const volume = document.getElementById('volume');
const muteBtn = document.getElementById('muteBtn');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');


let audioCtx = null;
let source = null;
let lastVolume = parseFloat(volume?.value ?? 1);

function fmt(s){
  if (!isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function setPlayIcon(isPlaying){
  if(isPlaying){
    playBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>`;
    playBtn.setAttribute('aria-label','Pause');
    playBtn.setAttribute('aria-pressed','true');
  }else{
    playBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 4l15 8-15 8V4z"/></svg>`;
    playBtn.setAttribute('aria-label','Play');
    playBtn.setAttribute('aria-pressed','false');
  }
}

function setupAudioContext(){
  if (!audioCtx) {
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      source = audioCtx.createMediaElementSource(audio);
      source.connect(audioCtx.destination);
    }catch(e){
      console.warn('Web Audio API is not available or blocked by CORS', e);
    }
  }
}




// Initialize UI
setPlayIcon(false);
if (volume) audio.volume = parseFloat(volume.value);

// Metadata loaded → set duration
audio.addEventListener('loadedmetadata', () => {
  seek.max = Math.floor(audio.duration);
  if(durationEl) durationEl.textContent = fmt(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if(!seek.dragging) seek.value = Math.floor(audio.currentTime);
  if(currentTimeEl) currentTimeEl.textContent = fmt(audio.currentTime);
});

playBtn.addEventListener('click', async () => {
  // resume audio context on user interaction
  if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
  if(!audioCtx) setupAudioContext();

  if (audio.paused) {
    audio.play().then(() => setPlayIcon(true)).catch(err => console.warn('Play failed', err));
  } else {
    audio.pause();
    setPlayIcon(false);
  }
});

seek.addEventListener('input', () => {
  seek.dragging = true;
  audio.currentTime = seek.value;
  if(currentTimeEl) currentTimeEl.textContent = fmt(seek.value);
});
seek.addEventListener('change', () => { seek.dragging = false; });

// Volume control
if (volume){
  volume.addEventListener('input', () => {
    audio.volume = parseFloat(volume.value);
    if (audio.volume === 0) {
      muteBtn.setAttribute('aria-pressed','true');
    } else {
      muteBtn.setAttribute('aria-pressed','false');
    }
    lastVolume = audio.volume;
  });
}

// Mute toggle
muteBtn.addEventListener('click', () => {
  if (!audio.muted && audio.volume > 0){
    audio.muted = true;
    muteBtn.setAttribute('aria-pressed','true');
    // show muted icon
    muteBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16.5 12a4.5 4.5 0 0 0-4.5-4.5v9A4.5 4.5 0 0 0 16.5 12zM19 12c0 3.04-1.64 5.69-4.12 7.12l1.23 1.23C20.06 19.3 22 15.86 22 12s-1.94-7.3-6-8.35l-1.23 1.23C17.36 6.31 19 8.96 19 12z"/></svg>`;
  } else {
    audio.muted = false;
    muteBtn.setAttribute('aria-pressed','false');
    // restore volume icon
    muteBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 10v4h4l5 5V5L7 10H3zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM19 12c0 3.04-1.64 5.69-4.12 7.12l1.23 1.23C20.06 19.3 22 15.86 22 12s-1.94-7.3-6-8.35l-1.23 1.23C17.36 6.31 19 8.96 19 12z"/></svg>`;
  }
});

// If user interacts with volume UI, ensure audio context is set up
[volume, muteBtn].forEach(el => el && el.addEventListener('click', () => { if(!audioCtx) setupAudioContext(); }));

audio.addEventListener('ended', () => {
  setPlayIcon(false);
  audio.currentTime = 0;
});

audio.addEventListener('play', () => { setPlayIcon(true); setupAudioContext(); });

audio.addEventListener('pause', () => { setPlayIcon(false); });

audio.addEventListener('error', () => {
  console.warn('Audio error: check that the audio source exists or the URL is valid.');
});

// Try to autoplay the audio on load; browsers may block autoplay until a user gesture
async function attemptAutoplay(){
  try{
    if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
    if (!audioCtx) setupAudioContext();

    // Start volume at 0
    const targetVol = parseFloat(volume ? volume.value : 1);
    audio.volume = 0;

    await audio.play();
    setPlayIcon(true);

    // Fade in gradually over ~3 seconds
    let currentVol = 0;
    const fadeInterval = setInterval(() => {
      if (audio.paused) { clearInterval(fadeInterval); return; }
      currentVol += 0.02;
      if (currentVol >= targetVol) {
        audio.volume = targetVol;
        clearInterval(fadeInterval);
      } else {
        audio.volume = currentVol;
      }
    }, 60);
  }catch(err){
    // Autoplay prevented by the browser — keep UI paused and wait for user interaction
    console.debug('Autoplay prevented or failed:', err);
    setPlayIcon(false);
    // Restore volume in case autoplay set it to 0 and then failed
    audio.volume = parseFloat(volume ? volume.value : 1);

    // Fallback: Play on first interaction (click, tap, or key)
    const unlock = () => {
      attemptAutoplay();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    document.addEventListener('keydown', unlock);
  }
}

window.addEventListener('load', () => {
  // small delay to give the page time to settle
  setTimeout(attemptAutoplay, 500);
});

// Try again when tab becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && audio.paused) attemptAutoplay();
});

// Like Button Logic
const likeBtn = document.getElementById('likeBtn');
const likeText = document.getElementById('likeText');
const likeCount = document.getElementById('likeCount');

// Simulated base count
const baseCount = 0;

if (likeBtn) {
  const isLiked = localStorage.getItem('site_liked') === 'true';
  if (likeCount) likeCount.textContent = isLiked ? baseCount + 1 : baseCount;

  if (isLiked) {
    likeBtn.classList.add('liked');
    if(likeText) likeText.textContent = 'Liked';
  }
  likeBtn.addEventListener('click', () => {
    const liked = likeBtn.classList.toggle('liked');
    localStorage.setItem('site_liked', liked);
    if(likeText) likeText.textContent = liked ? 'Liked' : 'Like';
    if(likeCount) likeCount.textContent = liked ? baseCount + 1 : baseCount;
  });
}
