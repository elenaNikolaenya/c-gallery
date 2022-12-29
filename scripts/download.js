import { hideLoader } from "./loader.js";
import { showLoader } from "./loader.js";

import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { showAlert } from "./alerts.js";
import { disableBtn } from "./upload.js";

import { user } from "./user.js";

import { avatar } from "./avatar.js";

const photoCount = document.querySelector('#photo-count');
const emptyContent = document.querySelector('.empty-content');
export const photoContent = document.querySelector('.photos__content');
const postTemplate = document.querySelector('#post-template');
export const showMorePhotoBtn = document.querySelector('#show-more-photo');
const accountNickname = document.querySelector('#account-nickname');
const accountName = document.querySelector('#account-name');
const description = document.querySelector('#description');

let lastLoadedPhotoIndex = -1;
export let posts = null;


//personal data downloading 
fillBioData();

export function fillBioData() {  
  const { photo, nickname, name, biography } = user;
  avatar.src = photo;
  accountNickname.textContent = nickname;
  accountName.textContent = name;
  description.textContent = biography;
}

//posts downloading 

const urlPostsDownload = BASE_URL + "users/me/posts/?" + new URLSearchParams({ limit: 50 }).toString();

await getPosts();

export async function getPosts() {
  try {
    const response = await fetch(urlPostsDownload, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 200) {
      posts = await response.json();
      posts = posts.sort((a,b) => b.id - a.id);
    } else {
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось получить данные');
    }   
  } catch (error) {
    showAlert(false, `${error}`, 'Не удалось получить данные');
  }  
}

//displaying of photos (or start position)
showMainContent();

export function showMainContent() {
  if (posts) {
    showPhotoCount(posts);

    if (posts.length === 0) {
      showEmptyContent();
    } else {
      createPhotoContent(posts);
      showPhotoContent();
    }
  }  
}

function showEmptyContent() {
  hideLoader();
  emptyContent.classList.remove('hidden');
  photoContent.classList.add('hidden');
  showMorePhotoBtn.classList.add('hidden');
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
  const renderedPhotoNumber = 9;

  for (let i = lastLoadedPhotoIndex + 1; i < lastLoadedPhotoIndex + 1 + renderedPhotoNumber; i++) {
    if (postsArr[i]) {
      const {image, likes: likesNumber, comments, id} = postsArr[i];      
      const commentsNumber = comments.length;
      const card = makePostByTemplate(image, likesNumber, commentsNumber, id);
      fragment.append(card);
      if (i === postsArr.length - 1) {
        disableBtn(showMorePhotoBtn);
      }
    } else {
      disableBtn(showMorePhotoBtn);
    }        
  }
  lastLoadedPhotoIndex += renderedPhotoNumber;  
  photoContent.append(fragment);
}

function makePostByTemplate(image, likesNumber, commentsNumber, id) {
  const post = postTemplate.content.cloneNode(true);
  post.querySelector('img').src = image;
  post.querySelector('.likes span').textContent = likesNumber;
  post.querySelector('.comments span').textContent = commentsNumber;
  post.querySelector('div.post').id = id;
  return post;
}

function showPhotoContent() {
  hideLoader();
  emptyContent.classList.add('hidden');
  photoContent.classList.remove('hidden');
  showMorePhotoBtn.classList.remove('hidden');
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