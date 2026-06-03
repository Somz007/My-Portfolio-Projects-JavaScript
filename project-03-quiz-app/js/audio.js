// audio.js — Web Audio API sound effects
//
// AudioContext must be created after a user gesture (browser security rule).
// We create it lazily on first call.

let _ctx     = null;
let _enabled = JSON.parse(localStorage.getItem('quiz-sound') ?? 'true');

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

function tone(freq, duration, type = 'sine', vol = 0.25) {
  if (!_enabled) return;
  try {
    const c    = ctx();
    const osc  = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type            = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // AudioContext blocked or unavailable — silently skip
  }
}

export function playCorrect() {
  tone(523, 0.08);                             // C5
  setTimeout(() => tone(659, 0.08), 80);       // E5
  setTimeout(() => tone(784, 0.15), 160);      // G5
}

export function playWrong() {
  tone(280, 0.08, 'sawtooth', 0.2);
  setTimeout(() => tone(210, 0.18, 'sawtooth', 0.15), 80);
}

export function playTick() {
  tone(900, 0.04, 'sine', 0.12);
}

export function playCountdown() {
  tone(440, 0.12);
}

export function playStart() {
  tone(440, 0.08);
  setTimeout(() => tone(554, 0.08), 90);
  setTimeout(() => tone(659, 0.08), 180);
  setTimeout(() => tone(880, 0.2),  270);
}

export function toggleSound() {
  _enabled = !_enabled;
  localStorage.setItem('quiz-sound', JSON.stringify(_enabled));
  return _enabled;
}

export function isSoundEnabled() {
  return _enabled;
}
