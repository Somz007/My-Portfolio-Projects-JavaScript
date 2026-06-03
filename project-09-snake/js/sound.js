// Web Audio synth — lazy context so it only creates after first user gesture

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, gain = 0.2, type = 'sine') {
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

export function playEat() {
  tone(660, 0.07, 0.2);
}

export function playDie() {
  [330, 294, 247].forEach((f, i) =>
    setTimeout(() => tone(f, 0.22, 0.18), i * 110)
  );
}

// ascending fanfare for new high score or win
export function playNewBest() {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => tone(f, 0.18, 0.22), i * 85)
  );
}
