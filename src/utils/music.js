import { Howl } from 'howler';

let sound = null;

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

// --------------------
// CONTROLES
// --------------------
const playSound = () => {
    const s = getSound();

    s.play();
    updateUI(true);
};

const pauseSound = () => {
    const s = getSound();

    s.pause();
    updateUI(false);
};

const toggleSound = () => {
    const s = getSound();

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
    const s = getSound();
    if (s.playing()) {
        updateUI(true);
        return;
    }

    const id = s.play();

    if (id !== null) {
        // Howler usa eventos en vez de promesas
        s.once('play', () => {
            updateUI(true);
        });

        s.once('playerror', () => {
            updateUI(false);
        });
    }
};

// --------------------
// INIT
// --------------------
tryAutoplay();

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