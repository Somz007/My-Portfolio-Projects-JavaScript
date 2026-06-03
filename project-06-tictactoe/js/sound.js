// Web Audio API — no deps, no files. AudioContext is lazy so it only creates
// on the first user interaction (browser requirement).

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  // resume in case it was suspended (autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, gain = 0.25, type = 'sine') {
  const c   = getCtx();
  const osc = c.createOscillator();
  const env = c.createGain();

  osc.connect(env);
  env.connect(c.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  env.gain.setValueAtTime(gain, c.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

// short soft blip on cell placement
export function playPlace() {
  tone(400, 0.07, 0.18);
}

// ascending arpeggio on win: C5 → E5 → G5
export function playWin() {
  [523, 659, 784].forEach((f, i) =>
    setTimeout(() => tone(f, 0.22, 0.25), i * 100)
  );
}

// gentle descending tones on draw
export function playDraw() {
  tone(330, 0.18, 0.2);
  setTimeout(() => tone(277, 0.28, 0.15), 130);
}

// descending minor fall on loss
export function playLose() {
  [330, 294, 262].forEach((f, i) =>
    setTimeout(() => tone(f, 0.22, 0.2), i * 130)
  );
}
