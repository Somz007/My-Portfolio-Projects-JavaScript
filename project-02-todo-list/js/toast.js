// toast.js — undo-delete notification
//
// Shows a 4-second dismissible toast with an undo button.
// Only one toast can be visible at a time — a new delete cancels the previous.

import { truncate } from './utils.js';

const toastEl   = document.getElementById('toast');
const toastMsg  = document.getElementById('toast-msg');
const toastUndo = document.getElementById('toast-undo');

let timer = null;

export function showToast(taskText, onUndo) {
  if (timer) clearTimeout(timer);

  toastMsg.textContent = `"${truncate(taskText, 35)}" deleted`;
  toastEl.hidden       = false;

  // trigger CSS transition — need a reflow between hidden=false and adding .visible
  toastEl.getBoundingClientRect();
  toastEl.classList.add('visible');

  toastUndo.onclick = () => {
    clearTimeout(timer);
    dismiss();
    onUndo();
  };

  timer = setTimeout(dismiss, 4000);
}

function dismiss() {
  toastEl.classList.remove('visible');
  toastEl.addEventListener('transitionend', () => {
    toastEl.hidden = true;
  }, { once: true });
  timer = null;
}
