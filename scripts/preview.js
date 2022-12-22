import { overlay } from "./overlay.js";
import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

import { openModal } from "./upload.js";
import { closeModal } from "./upload.js";

import { photoContent } from "./download.js";
import { posts } from "./download.js";

const previewPostModal = document.querySelector('.preview-post-modal');
const postTime = document.querySelector('.account-info__time');
const postPhoto = document.querySelector('#post-photo');
const postText = document.querySelector('.post-text');
const postHashtags = document.querySelector('.post-hashtags');


photoContent.addEventListener('click', openPreviewPostModal);

function openPreviewPostModal() {
  createPreviewPostModal(event, posts);
  openModal(previewPostModal);
  showOverlay();
  overlay.addEventListener('click', closePreviewPostModal); 
}

function closePreviewPostModal() {
  closeModal(previewPostModal);
  hideOverlay();  
}

function createPreviewPostModal(event, allPostsArr) {
  const postId = +event.target.closest('div.post').id;

  allPostsArr.forEach((item) => {
    if (item.id === postId) {
      postTime.textContent = getDayFromDate(item.created_at);
      postPhoto.src = item.image;
      postText.textContent = item.text;
      createHashtags(item.tags);
    }
  });

  function getDayFromDate(originalDate) {
    const objDate = new Date(originalDate);
    const date = objDate.getDate();
    const month = objDate.getMonth();
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date} ${months[month]}`;
  }

  function createHashtags(arr) {
    const fragment = new DocumentFragment;

    arr.forEach((item) => {
      const link = document.createElement('a');
      link.setAttribute('href', '#');
      link.textContent = item;
      fragment.append(link);
    })

    postHashtags.append(fragment);
  }  
}