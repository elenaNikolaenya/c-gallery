import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { overlay } from "./overlay.js";
import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

import { showLoader } from "./loader.js";

import { getPosts } from "./download.js";
import { showMainContent } from "./download.js";
import { resetIndex } from "./download.js";
import { cleanPhotoContent } from "./download.js";
import { showMorePhotoBtn } from "./download.js";

import { showAlert } from "./alerts.js";

import { user } from "./user.js";

const addPhotoBtn = document.querySelector('#add-photo');
const addFirstPostBtn = document.querySelector('#add-first-post');
const addPostModal = document.querySelector('.add-post-modal');
const addPostStep1 = document.querySelector('.add-post-modal__step-1');
const addPostHeader = document.querySelector('.add-post-modal__text');
const fileUploadInput = document.querySelector('#file-upload');
const addPostStep2 = document.querySelector('.add-post-modal__step-2');
const addPostFooter = document.querySelector('.modal__footer');
const accountInfoBlocks = document.querySelectorAll('.account-info');
const uploadedPhoto = document.querySelector('#uploaded-photo');
const postTextInput = document.querySelector('#post-text');
const textNotification = document.querySelector('#text-notification');
const textCounter = document.querySelector('.text-counter');
const postHashtagsInput = document.querySelector('#post-hashtags');
const postPublishBtn = document.querySelector('#post-publish');

const MAX_CHAR_POST = 2000;

// step 1
addPhotoBtn.addEventListener('click', openAddPostModal);
addFirstPostBtn.addEventListener('click', openAddPostModal);

function openAddPostModal() {
  openModal(addPostModal);
  showOverlay();
  overlay.addEventListener('click', closeAddPostModal);
}

function closeAddPostModal() {
  closeModal(addPostModal);
  hideOverlay();
  clearInputs();
  resetSteps();  
  clearPreviewURL();
  hideNotification(textCounter, textNotification);
  unhighlightArea(postTextInput);
  enableBtn(postPublishBtn);
  overlay.removeEventListener('click', closeAddPostModal);
}

export function openModal(modal) {
  modal.classList.add('active');
}

export function closeModal(modal) {
  modal.classList.remove('active');
}

function clearInputs() {
  fileUploadInput.value = '';
  postTextInput.value = '';
  postHashtagsInput.value = '';
}

function resetSteps() {
  addPostStep1.classList.remove('hidden');
  addPostStep2.classList.add('hidden');
  addPostFooter.classList.add('hidden');
}

function clearPreviewURL() {
  URL.revokeObjectURL(url);
}

//drag&drop
['dragenter', 'dragover'].forEach(event => {
  addPostStep1.addEventListener(event, highlight);
});

['dragleave', 'drop'].forEach(event => {
  addPostStep1.addEventListener(event, unhighlight);
});

function highlight() {
  addPostStep1.classList.add('highlight');
}

function unhighlight() {
  addPostStep1.classList.remove('highlight');
}

addPostStep1.addEventListener('dragover', (event) => {
  event.preventDefault();
});

addPostStep1.addEventListener('drop', (event) => {
  event.preventDefault();
  if (isFileTypeProper(event)) {
    createPreviewOnDrop(event);
    prepareDropedFileToSend(event);
    moveToStep2();
  } else {
    addPostHeader.classList.add('add-post-modal__text--red');
    setTimeout(() => {
      addPostHeader.classList.remove('add-post-modal__text--red');
    }, TIMEOUT)
  }  
});

function isFileTypeProper(event) {
  const file = event.dataTransfer.files[0];
  if (file.type.split("/")[0] !== 'image') {    
    return false;
  }
  return true;
}

let url = null;

function createPreviewOnDrop(event) {  
  url = URL.createObjectURL(event.dataTransfer.files[0]);
}

let file = null;

function prepareDropedFileToSend(event) {
  file = event.dataTransfer.files[0];
}
//input (button for upload)
fileUploadInput.addEventListener('change', processFileUploadInput);

function processFileUploadInput() {
  createPreviewOnBtn();
  prepareInputFileToSend();
  moveToStep2();
}

function createPreviewOnBtn() {
  url = URL.createObjectURL(fileUploadInput.files[0]);
}

function prepareInputFileToSend() {
  file = fileUploadInput.files[0];
}
// step 2
function moveToStep2() {
  displayIcons();
  uploadedPhoto.src = url;
  countCharacters(postTextInput, textCounter, MAX_CHAR_POST);
  addPostStep1.classList.add('hidden');
  addPostStep2.classList.remove('hidden');
  addPostFooter.classList.remove('hidden');  
}

export function displayIcons() {
  accountInfoBlocks.forEach((item) => {
    const iconPhoto = item.querySelector('img');
    iconPhoto.src = user.photo;
    iconPhoto.alt = user.nickname;
    const iconName = item.querySelector('span');
    iconName.textContent = user.nickname;
  })
}

postTextInput.addEventListener('input', processCharacters);

function processCharacters() {  
  countCharacters(postTextInput, textCounter, MAX_CHAR_POST);
  validateTextLength(postTextInput, MAX_CHAR_POST, textCounter, textNotification, postPublishBtn);
}

export function countCharacters(textInput, charactersCounter, maxNum) {
  let numberOfEnteredChars = textInput.value.length;
  charactersCounter.textContent = `${numberOfEnteredChars}/${maxNum}`;
}

export function validateTextLength(textInput, maxLength, counter, notification, btn) {
  if (textInput.value.length > maxLength) {
    showNotification(counter, notification);
    highlightArea(textInput);   
    disableBtn(btn); 
    return;
  }
  hideNotification(counter, notification);
  unhighlightArea(textInput);
  enableBtn(btn);
}

function showNotification(counter, notification) {
  counter.classList.add('error');
  notification.classList.remove('v-hidden');
}

function hideNotification(counter, notification) {
  counter.classList.remove('error');
  notification.classList.add('v-hidden');
}

function highlightArea(input) {
  input.classList.add('error');
}

function unhighlightArea(input) {
  input.classList.remove('error');
}

export function disableBtn(btn) {
  btn.disabled = true;
}

export function enableBtn(btn) {
  btn.disabled = false;
}

const debouncedValidateHashtags = _.debounce(validateHashtags, 700);

postHashtagsInput.addEventListener('input', debouncedValidateHashtags);

function validateHashtags() {
  const hashtags = processPostHashtags();
  const REGEXP = /^\#([a-zа-яё0-9]+[a-zа-яё]+[a-zа-яё0-9_]*)$/i;

  if (postHashtagsInput.value === '') {
    unhighlightArea(postHashtagsInput);
    enableBtn(postPublishBtn);
  } else {
    for (let hashtag of hashtags) {
      if (!REGEXP.test(hashtag)) {
        highlightArea(postHashtagsInput);
        disableBtn(postPublishBtn);    
      } else {
        unhighlightArea(postHashtagsInput);
        enableBtn(postPublishBtn);
      }
    }
  }  
}

function processPostHashtags() {
  const str = postHashtagsInput.value;
  const result = str.trim().split(/\s+/);
  return result;
}

postPublishBtn.addEventListener('click', submitData);

async function submitData() {  
  clearPreviewURL();

  const data = createFormData();
  const urlPostPublish = BASE_URL + "posts/";

  try {
    const response = await fetch(urlPostPublish, {
      method: "POST",
      body: data,
      headers: {
        Authorization:
          `Bearer ${TOKEN} `,
      },
    });

    if (response.status === 201) {
      closeModal(addPostModal);
      resetSteps();
      showAlert(true, 'Пост добавлен!', 'Мы сохранили все данные');
      renderMainContent();
    } else {      
      closeModal(addPostModal);
      resetSteps();      
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось загрузить данные');
    }      
  } catch (error) {
    closeModal(addPostModal);
    resetSteps();
    showAlert(false, `${error}`, 'Не удалось загрузить данные');
  } finally {
    clearInputs();
  }
}

function createFormData() {
  let formData = new FormData();
  const postHashtags = processPostHashtags();  
  formData.append('text', postTextInput.value);
  formData.append('image', file);
  if (postHashtagsInput.value) {
    formData.append('tags', postHashtags);
  }  
  return formData;  
}

export async function renderMainContent() {
  showLoader();
  await getPosts();
  resetIndex(); 
  cleanPhotoContent();
  enableBtn(showMorePhotoBtn);
  showMainContent();
}