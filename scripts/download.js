import { hideLoader } from "./loader.js";
import { showLoader } from "./loader.js";

import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { showAlert } from "./alerts.js";

import { disableBtn } from "./upload.js";

import { getUser } from "./user.js";
import { myId } from "./user.js";

import { avatar } from "./avatar.js";

const photoCount = document.querySelector('#photo-count');
export const emptyContent = document.querySelector('.empty-content');
export const photoContent = document.querySelector('.photos__content');
const postTemplate = document.querySelector('#post-template');
export const showMorePhotoBtn = document.querySelector('#show-more-photo');
const accountNickname = document.querySelector('#account-nickname');
const accountName = document.querySelector('#account-name');
const description = document.querySelector('#description');


let lastLoadedPhotoIndex = -1;
let user = {};
let posts = [];

//personal data downloading 
user = await getUser(myId);
fillBioData(user);

export function fillBioData(userOb) {  
  const { id, photo, nickname, name, biography } = userOb;
  avatar.src = photo;
  avatar.id = id;
  accountNickname.textContent = nickname;
  accountName.textContent = name;
  description.textContent = biography;
}

//posts downloading 

posts = await getPosts(myId);

export async function getPosts(id) {
  const urlPostsDownload = `${BASE_URL}users/${id}/posts/?` + new URLSearchParams({ limit: 100 }).toString();

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
      posts.sort((a,b) => b.id - a.id);
      return posts;
    } else {
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось получить данные'});
    }   
  } catch (error) {
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось получить данные'});
  }  
}

//displaying of photos (or the start position)
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