const CONSENT_KEY = 'music-consent-enabled';

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
    } catch {
        // Ignore storage failures (private mode, strict browser settings).
    }
};

// DOM
const audio = document.getElementById('music');
const musicCard = document.getElementById('music-card');
const musicIconPlay = document.getElementById('music-icon-play');
const musicIconPause = document.getElementById('music-icon-pause');
const bars = document.querySelectorAll('.bar');

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
    updateUI(!audio.paused && !audio.ended);
};

const playAudio = async ({ muted = false } = {}) => {
    if (!(audio instanceof HTMLAudioElement)) return false;

    audio.muted = muted;

    try {
        await audio.play();
        syncFromAudio();
        return true;
    } catch {
        syncFromAudio();
        return false;
    }
};

const enableSound = async () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    audio.muted = false;
    const started = await playAudio({ muted: false });
    if (started) {
        persistConsent();
    }
};

// --------------------
// CONTROLES
// --------------------
const toggleSound = async () => {
    if (!(audio instanceof HTMLAudioElement)) return;

    if (!audio.paused && !audio.ended) {
        if (audio.muted) {
            await enableSound();
            return;
        }

        audio.pause();
        syncFromAudio();
        return;
    }

    if (getStoredConsent()) {
        await enableSound();
        return;
    }

    await playAudio({ muted: false });
    persistConsent();
};

// --------------------
// AUTOPLAY INTELIGENTE
// --------------------
const tryAutoplay = () => {
    return playAudio({ muted: false });
};

const tryMutedAutoplay = () => {
    return playAudio({ muted: true });
};

// --------------------
// INIT
// --------------------
if (audio instanceof HTMLAudioElement) {
    audio.volume = 0.5;
    audio.addEventListener('play', syncFromAudio);
    audio.addEventListener('pause', syncFromAudio);
    audio.addEventListener('ended', syncFromAudio);

    if (getStoredConsent()) {
        audio.muted = false;
        void tryAutoplay();
    } else {
        audio.muted = true;
        void tryMutedAutoplay();
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
            void toggleSound();
        }
    });
}