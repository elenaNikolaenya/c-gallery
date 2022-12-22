import { hideLoader } from "./loader.js";
import { showLoader } from "./loader.js";

import { TOKEN } from "./constants.js";
import { URL_POSTS_DOWNLOAD } from "./constants.js";

import { alertFail } from "./upload.js";
import { showAlert } from "./upload.js";
import { disableBtn } from "./upload.js";

const photoCount = document.querySelector('#photo-count');
const emptyContent = document.querySelector('.empty-content');
export const photoContent = document.querySelector('.photos__content');
const postTemplate = document.querySelector('#post-template');
export const showMorePhotoBtn = document.querySelector('#show-more-photo');

let lastLoadedPhotoIndex = -1;
export let posts = null;

//downloading 
await getPosts();

export async function getPosts() {
  try {
    const response = await fetch(URL_POSTS_DOWNLOAD + "?" + new URLSearchParams({ limit: 50 }).toString(), {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 200) {
      posts = await response.json();
      posts.reverse();
    } else {
      showAlert(alertFail, `Ошибка ${response.status}`);
    }   
  } catch (error) {
    showAlert(alertFail, `${error}`);
  }
}

//displaying of photos (or start position)
showMainContent();

export function showMainContent() {
  showPhotoCount(posts);

  if (posts.length === 0) {
    showEmptyContent();
  } else {
    createPhotoContent(posts);
    showPhotoContent();
  }
}

function showEmptyContent() {
  hideLoader();
  emptyContent.classList.remove('hidden');
  photoContent.classList.add('hidden');
}

function showPhotoCount(postsArr) {
  const number = postsArr.length;
  let phrase = '';

  switch(number) {
    case 1:
      phrase = `${number} публикация`;
      break;
    case 2:
    case 3:
    case 4:
      phrase = `${number} публикации`;
      break;
    default:
      phrase = `${number} публикаций`;
      break;
  }

  photoCount.textContent = phrase;
}

function createPhotoContent(postsArr) {
  const fragment = new DocumentFragment();

  for (let i = lastLoadedPhotoIndex + 1; i < lastLoadedPhotoIndex + 10; i++) {
    if (postsArr[i]) {
      const post = postsArr[i];
      const image = post.image;
      const likesNumber = post.likes;
      const commentsNumber = post.comments.length;
      const id = post.id;
      const card = makePostByTemplate(image, likesNumber, commentsNumber, id);
      fragment.append(card);
      if (i === postsArr.length - 1) {
        disableBtn(showMorePhotoBtn);
      }
    } else {
      disableBtn(showMorePhotoBtn);
    }        
  }
  lastLoadedPhotoIndex += 9;  
  photoContent.append(fragment);
}

function makePostByTemplate(image, likesNumber, commentsNumber, id) {
  const post = postTemplate.content.cloneNode(true);
  post.querySelector('img').src = image;
  post.querySelector('.likes span').textContent = likesNumber;
  post.querySelector('.comments span').textContent = commentsNumber;
  post.querySelector('div.post').setAttribute('id', `${id}`);
  return post;
}

function showPhotoContent() {
  hideLoader();
  emptyContent.classList.add('hidden');
  photoContent.classList.remove('hidden');
}

//functions for reloading (when a new post is added)
export function resetIndex() {
  lastLoadedPhotoIndex = -1;
}

export function cleanPhotoContent() {
  photoContent.innerHTML = '';
}

// button Show more photos
showMorePhotoBtn.addEventListener('click', showMorePhoto)

function showMorePhoto() {
  showLoader(); //not sure if it's necessary here
  createPhotoContent(posts);
  showPhotoContent();
}