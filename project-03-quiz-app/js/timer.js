// thin wrapper around setInterval so callers don't have to manage the ID

let intervalId = null;

// starts a countdown from `seconds`, calling onTick(remaining) each second
// and onExpire() when it hits 0
export function startTimer(seconds, onTick, onExpire) {
  stopTimer();
  let remaining = seconds;
  onTick(remaining);

  intervalId = setInterval(() => {
    remaining -= 1;
    onTick(remaining);
    if (remaining <= 0) {
      stopTimer();
      onExpire();
    }
  }, 1000);
}

export function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// simple Promise-based delay — used by the countdown sequence
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
