const CONSENT_KEY = 'music-consent-enabled';

// --------------------
// STORAGE
// --------------------
const getStoredConsent = () => {
    try {
        return localStorage.getItem(CONSENT_KEY) === 'true';
    } catch {
        return false;
    }
};

const persistConsent = () => {
    try {
        localStorage.setItem(CONSENT_KEY, 'true');
    } catch { }
};

// --------------------
// DOM
// --------------------
const audio = document.getElementById('music');
const musicCard = document.getElementById('music-card');
const musicIconPlay = document.getElementById('music-icon-play');
const musicIconPause = document.getElementById('music-icon-pause');
const bars = document.querySelectorAll('.bar');

// --------------------
// CONFIG
// --------------------
const TARGET_VOLUME = 0.5;

// --------------------
// UI
// --------------------
const updateUI = (playing) => {
    if (!musicCard) return;

    musicCard.classList.toggle('is-playing', playing);

    bars.forEach((bar) => {
        bar.classList.toggle('opacity-40', !playing);
    });

    musicIconPlay?.classList.toggle('hidden', playing);
    musicIconPause?.classList.toggle('hidden', !playing);
};

const syncFromAudio = () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    const isPlaying = !audio.paused && !audio.ended;
    const hasSound = !audio.muted && audio.volume > 0.01;

    updateUI(isPlaying && hasSound);
};

// --------------------
// AUDIO HELPERS
// --------------------
const playMutedAutoplay = async () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    try {
        audio.muted = true;
        audio.volume = 0;
        await audio.play();
    } catch { }
};

const enableSound = async () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    audio.muted = false;
    audio.volume = TARGET_VOLUME;

    try {
        await audio.play();
    } catch {
        return;
    }

    persistConsent();
    syncFromAudio();
};

const pauseAudio = () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    audio.pause();
    syncFromAudio();
};

// --------------------
// CONTROLES
// --------------------
const toggleSound = async () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    // Si está muteado, desmutea primero
    if (audio.muted) {
        await enableSound();
        return;
    }

    // Si no está muteado, toggle normal play/pause
    const isPlaying = !audio.paused && !audio.ended;
    if (isPlaying) {
        pauseAudio();
    } else {
        await audio.play();
        syncFromAudio();
    }
};

// --------------------
// INIT
// --------------------
if (audio instanceof HTMLAudioElement) {
    audio.addEventListener('play', syncFromAudio);
    audio.addEventListener('pause', syncFromAudio);
    audio.addEventListener('ended', syncFromAudio);

    // 🔥 Autoplay silencioso SIEMPRE
    playMutedAutoplay();

    // Si ya dio consentimiento → activar en cuanto pueda
    if (getStoredConsent()) {
        enableSound();
    }

    syncFromAudio();
}

// --------------------
// EVENTOS UI
// --------------------
if (musicCard) {
    musicCard.addEventListener('click', toggleSound);

    musicCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSound();
        }
    });
}