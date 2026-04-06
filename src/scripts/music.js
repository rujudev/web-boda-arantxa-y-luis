import { Howl } from 'howler';

let sound = null;
let isStarting = false;
let hasMutedFallbackStarted = false;
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

// --------------------
// AUDIO
// --------------------
const getSound = () => {
    if (sound) return sound;

    sound = new Howl({
        src: ['/audio/in_this_shirt.mp3'],
        loop: true,
        html5: true, // 👈 importante para evitar algunos bloqueos
        volume: 0.5,
    });

    return sound;
};

const startPlayback = ({ muted = false } = {}) => {
    const s = getSound();

    if (s.playing()) {
        if (s.mute() !== muted) {
            s.mute(muted);
        }
        updateUI(s.playing());
        return;
    }

    if (isStarting) {
        updateUI(false);
        return;
    }

    isStarting = true;
    s.mute(muted);
    const id = s.play();

    if (id === null) {
        isStarting = false;
        updateUI(false);
        return;
    }

    s.once('play', () => {
        isStarting = false;
        updateUI(true);
    });

    s.once('playerror', () => {
        isStarting = false;
        updateUI(false);
    });

    s.once('loaderror', () => {
        isStarting = false;
        updateUI(false);
    });
};

// --------------------
// CONTROLES
// --------------------
const playSound = () => {
    const s = getSound();

    if (s.playing() && s.mute()) {
        s.mute(false);
        persistConsent();
        updateUI(true);
        return;
    }

    startPlayback({ muted: false });
    persistConsent();
};

const pauseSound = () => {
    const s = getSound();

    s.pause();
    updateUI(false);
};

const toggleSound = () => {
    const s = getSound();

    if (isStarting) return;

    if (s.playing() && s.mute()) {
        playSound();
        return;
    }

    if (s.playing()) {
        pauseSound();
    } else {
        playSound();
    }
};

// --------------------
// AUTOPLAY INTELIGENTE
// --------------------
const tryAutoplay = () => {
    startPlayback({ muted: false });
};

const tryMutedAutoplay = () => {
    if (hasMutedFallbackStarted) return;

    hasMutedFallbackStarted = true;
    startPlayback({ muted: true });
};

// --------------------
// INIT
// --------------------
if (getStoredConsent()) {
    tryAutoplay();
} else {
    const s = getSound();

    s.once('playerror', () => {
        tryMutedAutoplay();
    });

    s.once('loaderror', () => {
        updateUI(false);
    });

    tryAutoplay();
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