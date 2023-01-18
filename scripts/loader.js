import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

const loader = document.querySelector('.loader');


export function showLoader() {
  loader.classList.remove('hidden');
  showOverlay();
}

export function hideLoader() {
  loader.classList.add('hidden');
  hideOverlay();
}