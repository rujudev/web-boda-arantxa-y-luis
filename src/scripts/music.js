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
const FADE_DURATION = 600; // ms

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
const fadeVolume = (from, to, duration) => {
    if (!(audio instanceof HTMLAudioElement)) return;

    const start = performance.now();

    const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = from + (to - from) * progress;

        audio.volume = value;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };

    requestAnimationFrame(step);
};

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

    try {
        await audio.play();
    } catch {
        return;
    }

    fadeVolume(0, TARGET_VOLUME, FADE_DURATION);
    persistConsent();
    syncFromAudio();
};

const pauseWithFade = () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    const startVolume = audio.volume;

    fadeVolume(startVolume, 0, FADE_DURATION);

    setTimeout(() => {
        audio.pause();
        audio.volume = TARGET_VOLUME;
        syncFromAudio();
    }, FADE_DURATION);
};

// --------------------
// CONTROLES
// --------------------
const toggleSound = async () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    const isPlaying = !audio.paused && !audio.ended;

    if (isPlaying) {
        pauseWithFade();
        return;
    }

    await enableSound();
};

// --------------------
// UNLOCK GLOBAL (clave UX)
// --------------------
const unlockAudioOnce = async () => {
    if (!audio) return;

    if (audio.muted) {
        await enableSound();
    }
};

document.addEventListener('click', unlockAudioOnce, { once: true });
document.addEventListener('keydown', unlockAudioOnce, { once: true });

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
        setTimeout(() => {
            enableSound();
        }, 300);
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