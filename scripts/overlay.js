const body = document.querySelector('body');
export const overlay = document.querySelector('.body-overlay');

export function showOverlay() {
  body.classList.add('with-overlay');
  overlay.classList.add('active');
}

export function hideOverlay() {
  body.classList.remove('with-overlay');
  overlay.classList.remove('active');
}