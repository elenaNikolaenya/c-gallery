import { overlay } from "./overlay.js";
import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

const addPhotoBtn = document.querySelector('#add-photo');
const addFirstPostBtn = document.querySelector('#add-first-post');
const addPostModal = document.querySelector('.add-post-modal');
const addPostStep1 = document.querySelector('.add-post-modal__step-1');
const addPostHeader = document.querySelector('.add-post-modal__text');
const fileUploadInput = document.querySelector('#file-upload');
const addPostStep2 = document.querySelector('.add-post-modal__step-2');
const addPostFooter = document.querySelector('.modal__footer');
const uploadedPhoto = document.querySelector('#uploaded-photo');
const postTextInput = document.querySelector('#post-text');
const textNotification = document.querySelector('#text-notification');
const textCounter = document.querySelector('.text-counter');
const postHashtagsInput = document.querySelector('#post-hashtags');
const postPublishBtn = document.querySelector('#post-publish');
const alertSuccess = document.querySelector('#alert-success');
const alertFail = document.querySelector('#alert-fail');

const MAX_CHAR_NUMBER = 2000;
const TIMEOUT = 2000;
const URL_POST_PUBLISH = "https://c-gallery.polinashneider.space/api/v1/posts/";
const TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjc1ODAyMDYxLCJpYXQiOjE2NzA5NjM2NjEsImp0aSI6IjdkNzQ5MDUxMjZkNjQwZTdiMGNkOTNjMTFkMGUxZGY4IiwidXNlcl9pZCI6MjV9.UtYKamvCmV187J_pov0OYS6cIIDZSJY60gB2K3ncPS0;
// step 1
addPhotoBtn.addEventListener('click', openAddPostModal);
addFirstPostBtn.addEventListener('click', openAddPostModal);
overlay.addEventListener('click', closeAddPostModal);

function openAddPostModal() {
  openModal(addPostModal);
  showOverlay();
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
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
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
  uploadedPhoto.src = url;
  countCharacters();
  addPostStep1.classList.add('hidden');
  addPostStep2.classList.remove('hidden');
  addPostFooter.classList.remove('hidden');  
}

postTextInput.addEventListener('input', processCharacters);

function processCharacters() {  
  countCharacters();
  validatePostLength();
}

function countCharacters() {
  let numberOfEnteredChars = postTextInput.value.length;
  textCounter.textContent = `${numberOfEnteredChars}/${MAX_CHAR_NUMBER}`;
}

function validatePostLength() {
  if (postTextInput.value.length > MAX_CHAR_NUMBER) {
    showNotification(textCounter, textNotification);
    highlightArea(postTextInput);   
    disableBtn(postPublishBtn); 
    return;
  }
  hideNotification(textCounter, textNotification);
  unhighlightArea(postTextInput);
  enableBtn(postPublishBtn);
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

function disableBtn(btn) {
  btn.disabled = true;
}

function enableBtn(btn) {
  btn.disabled = false;
}

postHashtagsInput.addEventListener('input', validateHashtags);

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

function submitData() {  
  clearPreviewURL();

  const data = createFormData();

  fetch(URL_POST_PUBLISH, {
    method: "POST",
    body: data,
    headers: {
      Authorization:
        `Bearer ${TOKEN} `,
    },
  })
  .then((response) => {
    if (response.status === 201) {
      showAlert(alertSuccess);
    } else {
      showAlert(alertFail);
    }    
  })
  .catch((error) => {
    showAlert(alertFail);
  })
  .finally(() => {
    clearInputs();
  })
}

function createFormData() {
  let formData = new FormData();
  const postHashtags = processPostHashtags();  
  formData.append('text', postTextInput.value);
  formData.append('image', file);
  formData.append('tags', postHashtags);
  return formData;  
}

function showAlert(alertToShow) {
  closeModal(addPostModal);
  resetSteps();
  alertToShow.classList.remove('hidden');
  setTimeout(() => {
    alertToShow.classList.add('hidden');
    hideOverlay();
  }, TIMEOUT);
}