import { getPosts } from "./download.js";
import { fillBioData } from "./download.js";
import { cleanPhotoContent } from "./download.js";
import { resetIndex } from "./download.js";
import { showMainContent } from "./download.js";
import { showMorePhotoBtn } from "./download.js";
import { emptyContent } from "./download.js";
import { photoContent } from "./download.js";

import { enableBtn } from "./upload.js";
import { displayIcons } from "./upload.js";
import { renderMainContent } from "./upload.js";

import { deletePostBtn } from "./preview.js";

import { avatarUploadInput } from "./avatar.js";
import { getUser, myId } from "./user.js";

const editingControls = document.querySelector('.editing');
const exitBtn = document.querySelector('.exit-btn');

let user = {};
let posts = [];

//open other's user profile
export async function openUserProfile(event) {  
  let chosenUserId = null;
  
  if (event.target.tagName === 'IMG' || event.target.tagName === 'SPAN') {
    chosenUserId = event.target.closest('.user-info').id;
  }

  //personal data downloading
  const chosenUser = await getUser(chosenUserId);

  fillBioData(chosenUser);
  avatarUploadInput.disabled = true;

  //buttons hiding
  hideControllers();
  showExitBtn();

  //posts downloading 
  posts = await getPosts(chosenUserId);
  cleanPhotoContent();
  resetIndex();
  enableBtn(showMorePhotoBtn);
  showMainContent();
  hideEmptyContent();

  //preview modification
  deletePostBtn.classList.add('hidden');
  displayIcons(chosenUser);  

  //exit, back home
  exitBtn.addEventListener('click', goHome);

  async function goHome() {
    user = await getUser(myId);
    fillBioData(user);
    avatarUploadInput.disabled = false;
    showControllers();
    hideExitBtn();
    displayEmptyContent();
    posts = await getPosts(myId);
    renderMainContent();
    deletePostBtn.classList.remove('hidden');
  }  
}

function hideEmptyContent() {
  emptyContent.classList.add('hidden');
}

function displayEmptyContent() {
  emptyContent.classList.remove('hidden');
}

function hideControllers() {
  editingControls.classList.add('hidden');
}

function showControllers() {
  editingControls.classList.remove('hidden');
}

function showExitBtn() {
  exitBtn.classList.remove('hidden');
}

function hideExitBtn() {
  exitBtn.classList.add('hidden');
}